import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const onboardingInput = z.object({
  nome: z.string().trim().max(80).optional().nullable(),
  objetivo: z.enum(["desinchar", "afinar", "leveza"]).optional().nullable(),
});

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => onboardingInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_active")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (profileError) throw new Error("Não conseguimos validar sua conta.");
    if (profile?.is_active === false) throw new Error("Conta desativada. Fale com o suporte.");

    const { error } = await supabaseAdmin
      .from("user_profile_prefs")
      .upsert({
        user_id: context.userId,
        nome: data.nome?.trim() || "você",
        objetivo: data.objetivo ?? null,
        onboarded: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      console.error("[completeOnboarding] prefs upsert failed", {
        userId: context.userId,
        message: error.message,
      });
      throw new Error("Não conseguimos salvar seu acesso agora.");
    }

    return { ok: true };
  });