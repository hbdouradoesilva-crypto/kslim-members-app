import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { PUBLIC_SITE_URL } from "@/lib/site-url";

export type MagicLinkResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "inactive" | "rate_limited" | "send_failed"; message?: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createServerPublishableClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export async function sendMagicLinkForExistingAccount(email: string): Promise<MagicLinkResult> {
  const emailLower = normalizeEmail(email);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("user_id, is_active")
    .eq("email", emailLower)
    .maybeSingle();

  if (profileError) {
    console.error("[magic-link] profile lookup failed", profileError.message);
    return { ok: false, reason: "send_failed", message: profileError.message };
  }
  if (!profile?.user_id) return { ok: false, reason: "not_found" };
  if (profile.is_active === false) return { ok: false, reason: "inactive" };

  const pub = createServerPublishableClient();
  const { error } = await pub.auth.signInWithOtp({
    email: emailLower,
    options: {
      emailRedirectTo: PUBLIC_SITE_URL,
      shouldCreateUser: false,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    console.warn("[magic-link] send failed", { email: emailLower, message: error.message });
    if (msg.includes("rate") || error.status === 429) return { ok: false, reason: "rate_limited", message: error.message };
    if (msg.includes("signup") || msg.includes("not allowed") || msg.includes("not found")) return { ok: false, reason: "not_found", message: error.message };
    return { ok: false, reason: "send_failed", message: error.message };
  }

  return { ok: true };
}