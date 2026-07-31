import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Public webhook — /api/public/* bypasses auth on published sites.
// We authenticate the Cakto request via a shared secret sent in headers,
// query string, or body.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "content-type, authorization, x-cakto-secret, x-webhook-secret, x-signature, x-cakto-signature",
};

function pick(obj: any, paths: string[]): any {
  for (const p of paths) {
    const parts = p.split(".");
    let cur: any = obj;
    let ok = true;
    for (const part of parts) {
      if (cur == null) { ok = false; break; }
      cur = cur[part];
    }
    if (ok && cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return undefined;
}

function normalizeEvent(raw: string | undefined): "approved" | "refunded" | "chargeback" | "unknown" {
  const s = (raw ?? "").toString().toLowerCase();
  // Aceita compra_aprovada E TAMBÉM pix gerado/pendente para facilitar testes
  if (["approved", "purchase_approved", "paid", "aprovado", "compra_aprovada", "sale_approved", "pix", "gerado", "pending", "waiting", "aguardando"].some((k) => s.includes(k))) return "approved";
  if (["refund", "refunded", "reembolso", "estorno"].some((k) => s.includes(k))) return "refunded";
  if (["chargeback"].some((k) => s.includes(k))) return "chargeback";
  return "unknown";
}

function norm(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function mask(v: string | null | undefined): string {
  if (!v) return "";
  return v.slice(0, 8) + "…";
}

async function readSecretFromRequest(request: Request, body: any): Promise<{ value: string | null; source: string }> {
  const headers = [
    "x-cakto-secret",
    "x-webhook-secret",
    "x-signature",
    "x-cakto-signature",
  ];
  for (const h of headers) {
    const v = request.headers.get(h);
    if (v) return { value: v, source: `header:${h}` };
  }
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return { value: auth.slice(7), source: "header:authorization" };

  const url = new URL(request.url);
  for (const q of ["secret", "token", "signature"]) {
    const v = url.searchParams.get(q);
    if (v) return { value: v, source: `query:${q}` };
  }
  const bodySecret = body?.secret ?? body?.data?.secret;
  if (bodySecret) return { value: String(bodySecret), source: "body" };
  return { value: null, source: "none" };
}

export const Route = createFileRoute("/api/public/webhooks/cakto")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET;
        if (!CAKTO_WEBHOOK_SECRET) {
          console.error("[cakto-webhook] missing CAKTO_WEBHOOK_SECRET");
          return new Response("Server not configured", { status: 500, headers: CORS_HEADERS });
        }

        // parse body FIRST so we can find secrets embedded in it
        const rawText = await request.text();
        let body: any = {};
        try { body = rawText ? JSON.parse(rawText) : {}; } catch {
          return new Response("Invalid JSON", { status: 400, headers: CORS_HEADERS });
        }

        const { value: providedSecret, source } = await readSecretFromRequest(request, body);
        if (!providedSecret || !safeEqual(providedSecret, CAKTO_WEBHOOK_SECRET)) {
          // Diagnostic: log which header/body field names arrived (names only, never values)
          // so we can teach the handler about Cakto's actual secret field. Remove after debugging.
          const headerNames: string[] = [];
          request.headers.forEach((_v, k) => headerNames.push(k));
          const bodyKeys = body && typeof body === "object" ? Object.keys(body) : [];
          const dataKeys = body?.data && typeof body.data === "object" ? Object.keys(body.data) : [];
          console.warn("[cakto-webhook] auth failed", {
            source,
            sample: mask(providedSecret),
            secretLen: providedSecret?.length ?? 0,
            headerNames,
            bodyKeys,
            dataKeys,
            url: request.url,
          });
          return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
        }


        // Load admin client only after auth passes
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const eventRaw = pick(body, ["event", "type", "data.event", "data.status", "status"]);
        const event = normalizeEvent(eventRaw);

        const email = pick(body, [
          "data.customer.email", "customer.email", "buyer.email", "data.buyer.email", "data.email", "email",
        ]);
        const customerName = pick(body, [
          "data.customer.name", "customer.name", "buyer.name", "data.buyer.name",
        ]);
        const caktoProductId = pick(body, [
          "data.product.id", "product.id", "data.product_id", "product_id", "data.offer.id", "offer.id",
        ]);
        const caktoProductName = pick(body, [
          "data.product.name", "product.name", "data.offer.name", "offer.name",
        ]);
        const externalId = pick(body, [
          "data.id", "data.transaction_id", "data.order_id", "data.refId", "id", "transaction_id", "order_id",
        ]);
        const amount = pick(body, [
          "data.amount", "amount", "data.total", "total", "data.price", "price",
        ]);
        const amountCents = typeof amount === "number"
          ? Math.round(amount > 999 ? amount : amount * 100)
          : amount ? Math.round(Number(amount) * 100) : null;

        const logCtx = {
          event, email, caktoProductId, caktoProductName, externalId,
          bodyPreview: rawText.slice(0, 4000),
        };
        console.log("[cakto-webhook] processing", { event, email, caktoProductId, externalId });

        if (event === "unknown") {
          console.log("[cakto-webhook] ignored", logCtx);
          return Response.json({ ok: true, ignored: true }, { headers: CORS_HEADERS });
        }

        // Refunded / chargeback → delete purchase
        if (event === "refunded" || event === "chargeback") {
          if (!externalId) return new Response("Missing external_id", { status: 400, headers: CORS_HEADERS });
          const { error } = await supabaseAdmin
            .from("purchases")
            .delete()
            .eq("payment_provider", "cakto")
            .eq("external_id", String(externalId));
          if (error) {
            console.error("[cakto-webhook] delete error", error.message);
            return new Response("Delete failed", { status: 500, headers: CORS_HEADERS });
          }
          return Response.json({ ok: true, action: event }, { headers: CORS_HEADERS });
        }

        // Approved
        if (!email) return new Response("Missing email", { status: 400, headers: CORS_HEADERS });

        // 1. Idempotency FIRST — if we've already seen this external_id, ack and stop.
        if (externalId) {
          const { data: existingP } = await supabaseAdmin
            .from("purchases").select("id")
            .eq("payment_provider", "cakto").eq("external_id", String(externalId)).maybeSingle();
          if (existingP) {
            return Response.json({ ok: true, already_processed: true }, { headers: CORS_HEADERS });
          }
        }

        // 2. Find product
        let productId: string | null = null;
        if (caktoProductId) {
          const { data } = await supabaseAdmin
            .from("products").select("id").eq("cakto_product_id", String(caktoProductId)).maybeSingle();
          productId = data?.id ?? null;
        }
        if (!productId && caktoProductName) {
          const { data: all } = await supabaseAdmin.from("products").select("id, title");
          const target = norm(String(caktoProductName));
          const hit = (all ?? []).find((p) => {
            const t = norm(p.title);
            return t === target || t.includes(target) || target.includes(t);
          });
          productId = hit?.id ?? null;
        }
        if (!productId) {
          console.warn("[cakto-webhook] product not mapped", { caktoProductId, caktoProductName, email });
          // Persist so the admin sees it in the dashboard instead of silently dropping the sale.
          try {
            await supabaseAdmin.from("admin_logs").insert({
              admin_id: null,
              action: "webhook.product_unmapped",
              target: String(email).toLowerCase(),
              metadata: {
                cakto_product_id: caktoProductId ?? null,
                cakto_product_name: caktoProductName ?? null,
                external_id: externalId ?? null,
                amount_cents: amountCents,
                customer_name: customerName ?? null,
              } as never,
            });
          } catch (e) {
            console.error("[cakto-webhook] failed to log unmapped product", (e as Error).message);
          }
          return Response.json({
            ok: true,
            product_mapped: false,
            cakto_product_id: caktoProductId ?? null,
            cakto_product_name: caktoProductName ?? null,
          }, { headers: CORS_HEADERS });
        }

        // 3. Find or create user — prefer profiles lookup, then auth lookup, then creation.
        const emailLower = String(email).toLowerCase();
        let userId: string | null = null;
        const { data: prof } = await supabaseAdmin
          .from("profiles").select("user_id").eq("email", emailLower).maybeSingle();
        if (prof?.user_id) {
          userId = prof.user_id;
        } else {
          const lookup = await supabaseAdmin.rpc("find_auth_user_id_by_email", {
            _email: emailLower,
          });
          if (lookup.data) {
            userId = lookup.data as string;
          } else {
            const randomPass = crypto.randomUUID() + crypto.randomUUID();
            const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
              email: emailLower,
              password: randomPass,
              email_confirm: true,
              user_metadata: { full_name: customerName ?? "" },
            });
            if (cErr || !created?.user) {
              // Race: another concurrent webhook may have just created this user.
              const { data: prof2 } = await supabaseAdmin
                .from("profiles").select("user_id").eq("email", emailLower).maybeSingle();
              if (prof2?.user_id) {
                userId = prof2.user_id;
              } else {
                console.error("[cakto-webhook] create user failed", cErr?.message);
                return new Response("Create user failed", { status: 500, headers: CORS_HEADERS });
              }
            } else {
              userId = created.user.id;
            }
          }
        }

        await supabaseAdmin.rpc("normalize_auth_user_login_fields", {
          _user_id: userId!,
        });

        await supabaseAdmin.from("profiles").upsert({
          user_id: userId!,
          email: emailLower,
          ...(customerName ? { full_name: String(customerName) } : {}),
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        await supabaseAdmin.from("user_roles").upsert({
          user_id: userId!,
          role: "aluno",
        }, { onConflict: "user_id,role" });

        const { error: prefsErr } = await supabaseAdmin
          .from("user_profile_prefs")
          .insert({ user_id: userId!, onboarded: false });
        if (prefsErr && !prefsErr.message.toLowerCase().includes("duplicate")) {
          console.warn("[cakto-webhook] prefs prepare warn", prefsErr.message);
        }

        // 4. Insert purchase
        const { data: existingEntitlement } = await supabaseAdmin
          .from("purchases")
          .select("id")
          .eq("user_id", userId!)
          .eq("product_id", productId)
          .maybeSingle();

        const { error: insErr } = existingEntitlement ? { error: null } : await supabaseAdmin.from("purchases").insert({
            user_id: userId!,
            product_id: productId,
            payment_provider: "cakto",
            external_id: externalId ? String(externalId) : null,
            amount_cents: amountCents,
          });
        if (insErr) {
          if (insErr.message.toLowerCase().includes("duplicate")) {
            return Response.json({ ok: true, already_processed: true }, { headers: CORS_HEADERS });
          }
          console.error("[cakto-webhook] insert error", insErr.message);
          return new Response("Insert failed", { status: 500, headers: CORS_HEADERS });
        }

        // Envia o link mágico de acesso depois que a compra foi registrada.
        try {
          const { sendMagicLinkForExistingAccount } = await import("@/lib/auth-link.server");
          const linkResult = await sendMagicLinkForExistingAccount(emailLower);
          if (!linkResult.ok) {
            console.warn("[cakto-webhook] magic link warn", { email: emailLower, reason: linkResult.reason });
          }
        } catch (e) {
          console.warn("[cakto-webhook] magic link exception", (e as Error).message);
        }

        return Response.json({ ok: true, action: "approved", user_id: userId, product_id: productId }, { headers: CORS_HEADERS });
      },
    },
  },
});
