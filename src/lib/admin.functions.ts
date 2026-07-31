import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Falha ao validar permissão");
  if (!data) throw new Error("Acesso negado");
}

async function logAdmin(
  adminId: string,
  action: string,
  target: string | null,
  metadata: Record<string, unknown> = {},
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target,
    metadata: metadata as never,
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findOrCreateUserByEmail(
  supabaseAdmin: any,
  email: string,
  fullName = "",
): Promise<{ userId: string; created: boolean }> {
  const emailLower = normalizeEmail(email);

  const { data: prof, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("user_id")
    .eq("email", emailLower)
    .maybeSingle();
  if (profErr) throw new Error(profErr.message);
  if (prof?.user_id) return { userId: prof.user_id, created: false };

  const authLookup = await supabaseAdmin.rpc("find_auth_user_id_by_email", {
    _email: emailLower,
  });
  if (authLookup.error) throw new Error(authLookup.error.message);
  if (authLookup.data) return { userId: authLookup.data as string, created: false };

  const randomPass = crypto.randomUUID() + crypto.randomUUID();
  const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
    email: emailLower,
    password: randomPass,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (cErr || !created?.user) throw new Error(cErr?.message ?? "Falha ao criar usuário");
  return { userId: created.user.id, created: true };
}

async function normalizeAccessRows(
  supabaseAdmin: any,
  userId: string,
  email: string,
  fullName = "",
) {
  const emailLower = normalizeEmail(email);
  await supabaseAdmin.rpc("normalize_auth_user_login_fields", {
    _user_id: userId,
  });

  const { error: profileErr } = await supabaseAdmin
    .from("profiles")
    .upsert({
      user_id: userId,
      email: emailLower,
      ...(fullName.trim() ? { full_name: fullName.trim() } : {}),
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  if (profileErr) throw new Error(profileErr.message);

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "aluno" }, { onConflict: "user_id,role" });
  if (roleErr) throw new Error(roleErr.message);

  const { error: prefsErr } = await supabaseAdmin
    .from("user_profile_prefs")
    .insert({ user_id: userId, onboarded: false });
  if (prefsErr && !prefsErr.message.toLowerCase().includes("duplicate")) {
    throw new Error(prefsErr.message);
  }
}

// ============ LIST USERS ============
export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      { data: authList, error: authErr },
      { data: profiles },
      { data: roles },
      { data: purchases },
    ] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      supabaseAdmin.from("profiles").select("user_id, full_name, email, is_active, created_at"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("purchases").select("user_id, product_id, amount_cents, created_at"),
    ]);

    if (authErr) throw new Error(authErr.message);

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const rolesByUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    }
    const productsByUser = new Map<string, string[]>();
    const totalByUser = new Map<string, number>();
    for (const p of purchases ?? []) {
      const arr = productsByUser.get(p.user_id) ?? [];
      if (!arr.includes(p.product_id)) arr.push(p.product_id);
      productsByUser.set(p.user_id, arr);
      totalByUser.set(p.user_id, (totalByUser.get(p.user_id) ?? 0) + (p.amount_cents ?? 0));
    }

    return (authList?.users ?? []).map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? p?.email ?? "",
        full_name: p?.full_name ?? "",
        is_active: p?.is_active ?? true,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: rolesByUser.get(u.id) ?? [],
        product_ids: productsByUser.get(u.id) ?? [],
        total_spent_cents: totalByUser.get(u.id) ?? 0,
      };
    });
  });

// ============ LIST PRODUCTS (for filter dropdown) ============
export const adminListProductsLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, title, cakto_product_id")
      .order("title", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ============ RELEASE STUDENT ACCESS BY EMAIL ============
export const adminReleaseAccessByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      email: z.string().email(),
      product_id: z.string().uuid(),
      full_name: z.string().max(120).optional().default(""),
      send_link: z.boolean().optional().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const emailLower = normalizeEmail(data.email);

    const { data: product, error: productErr } = await supabaseAdmin
      .from("products")
      .select("id, title")
      .eq("id", data.product_id)
      .maybeSingle();
    if (productErr) throw new Error(productErr.message);
    if (!product) throw new Error("Produto não encontrado.");

    const { userId, created } = await findOrCreateUserByEmail(
      supabaseAdmin,
      emailLower,
      data.full_name ?? "",
    );
    await normalizeAccessRows(supabaseAdmin, userId, emailLower, data.full_name ?? "");

    const { data: existingPurchase, error: existingErr } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", data.product_id)
      .maybeSingle();
    if (existingErr) throw new Error(existingErr.message);

    if (!existingPurchase) {
      const { error: purchaseErr } = await supabaseAdmin.from("purchases").insert({
        user_id: userId,
        product_id: data.product_id,
        payment_provider: "manual",
        external_id: `manual-release-${userId}-${data.product_id}`,
        amount_cents: 0,
      });
      if (purchaseErr && !purchaseErr.message.toLowerCase().includes("duplicate")) {
        throw new Error(purchaseErr.message);
      }
    }

    let magicLinkSent = false;
    if (data.send_link) {
      const { sendMagicLinkForExistingAccount } = await import("@/lib/auth-link.server");
      const linkResult = await sendMagicLinkForExistingAccount(emailLower);
      magicLinkSent = linkResult.ok;
      if (!linkResult.ok) {
        console.warn("[adminReleaseAccessByEmail] magic link warn", {
          email: emailLower,
          reason: linkResult.reason,
        });
      }
    }

    await logAdmin(context.userId, "access.release.student", userId, {
      email: emailLower,
      product_id: data.product_id,
      product_title: product.title,
      created,
      already_had_purchase: !!existingPurchase,
      magic_link_sent: magicLinkSent,
    });

    return {
      ok: true,
      user_id: userId,
      created,
      already_had_purchase: !!existingPurchase,
      magic_link_sent: magicLinkSent,
    };
  });

// ============ EXPORT USERS CSV (Meta Ads Custom Audience format) ============
export const adminExportUsersCSV = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      includes: z.array(z.string().uuid()).default([]),
      excludes: z.array(z.string().uuid()).default([]),
      role: z.enum(["all", "admin", "aluno"]).default("all"),
      onlyActive: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      { data: authList, error: authErr },
      { data: profiles },
      { data: roles },
      { data: purchases },
    ] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      supabaseAdmin.from("profiles").select("user_id, full_name, email, is_active"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("purchases").select("user_id, product_id"),
    ]);
    if (authErr) throw new Error(authErr.message);

    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const rolesByUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    }
    const productsByUser = new Map<string, Set<string>>();
    for (const p of purchases ?? []) {
      const s = productsByUser.get(p.user_id) ?? new Set<string>();
      s.add(p.product_id);
      productsByUser.set(p.user_id, s);
    }

    const rows = (authList?.users ?? [])
      .filter((u) => {
        const p = profileMap.get(u.id);
        if (data.onlyActive && p?.is_active === false) return false;
        const userRoles = rolesByUser.get(u.id) ?? [];
        if (data.role !== "all" && !userRoles.includes(data.role)) return false;
        const owned = productsByUser.get(u.id) ?? new Set<string>();
        for (const inc of data.includes) if (!owned.has(inc)) return false;
        for (const exc of data.excludes) if (owned.has(exc)) return false;
        return true;
      })
      .map((u) => {
        const p = profileMap.get(u.id);
        const email = (u.email ?? p?.email ?? "").toLowerCase().trim();
        const name = (p?.full_name ?? "").trim();
        const parts = name.split(/\s+/).filter(Boolean);
        const fn = (parts[0] ?? "").toLowerCase();
        const ln = (parts.slice(1).join(" ") ?? "").toLowerCase();
        return { email, fn, ln, country: "BR" };
      })
      .filter((r) => r.email);

    // CSV with Meta Ads Custom Audience headers.
    // Meta accepts raw email + FN/LN + country and hashes at upload.
    const esc = (v: string) => {
      if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
      return v;
    };
    const header = "email,fn,ln,country";
    const body = rows.map((r) => [r.email, r.fn, r.ln, r.country].map(esc).join(",")).join("\n");
    const csv = header + "\n" + body + (body ? "\n" : "");

    await logAdmin(context.userId, "users.export_csv", null, {
      count: rows.length,
      includes: data.includes,
      excludes: data.excludes,
      role: data.role,
      only_active: data.onlyActive,
    });

    return { csv, count: rows.length };
  });

// ============ INVITE / PROMOTE ADMIN BY EMAIL ============
export const adminInviteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const emailLower = normalizeEmail(data.email);
    const { userId } = await findOrCreateUserByEmail(supabaseAdmin, emailLower);
    await normalizeAccessRows(supabaseAdmin, userId, emailLower);

    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (rErr && !rErr.message.toLowerCase().includes("duplicate")) throw new Error(rErr.message);

    try {
      const { sendMagicLinkForExistingAccount } = await import("@/lib/auth-link.server");
      const linkResult = await sendMagicLinkForExistingAccount(emailLower);
      if (!linkResult.ok) {
        console.warn("[adminInviteAdmin] magic link warn", { email: emailLower, reason: linkResult.reason });
      }
    } catch (e) {
      console.warn("[adminInviteAdmin] magic link exception", (e as Error).message);
    }

    await logAdmin(context.userId, "role.grant.admin", userId, { email: emailLower, via: "invite" });
    return { ok: true, user_id: userId };
  });


// ============ TOGGLE ACTIVE ============
export const adminToggleActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid(), is_active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: data.is_active })
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    await logAdmin(context.userId, data.is_active ? "user.activate" : "user.deactivate", data.user_id);
    return { ok: true };
  });

// ============ SET ROLE ============
export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      user_id: z.string().uuid(),
      role: z.enum(["admin", "aluno"]),
      grant: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // never remove the last admin
    if (data.role === "admin" && !data.grant) {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) throw new Error("Não é possível remover o último admin.");
    }

    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.user_id, role: data.role })
        .select()
        .maybeSingle();
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    await logAdmin(context.userId, `role.${data.grant ? "grant" : "revoke"}.${data.role}`, data.user_id);
    return { ok: true };
  });

// ============ STATS ============
export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [
      { count: activeUsers },
      { count: totalPurchases },
      { data: recentPurchases },
      { data: logs },
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("purchases").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("purchases")
        .select("amount_cents, created_at")
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
      supabaseAdmin.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    const mrrCents = (recentPurchases ?? []).reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
    return {
      activeUsers: activeUsers ?? 0,
      totalPurchases: totalPurchases ?? 0,
      mrrCents,
      logs: logs ?? [],
    };
  });

// ============ SALES PER DAY ============
export const adminSalesByDay = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("purchases")
      .select("created_at, amount_cents")
      .gte("created_at", since)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    const byDay = new Map<string, { day: string; count: number; cents: number }>();
    for (const p of data ?? []) {
      const day = new Date(p.created_at).toISOString().slice(0, 10);
      const cur = byDay.get(day) ?? { day, count: 0, cents: 0 };
      cur.count += 1;
      cur.cents += p.amount_cents ?? 0;
      byDay.set(day, cur);
    }
    return Array.from(byDay.values());
  });
