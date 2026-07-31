import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });

    const { data: prefs } = await supabase
      .from("user_profile_prefs")
      .select("onboarded")
      .eq("user_id", data.session.user.id)
      .maybeSingle();

    if (prefs?.onboarded !== true) throw redirect({ to: "/onboarding" });
    throw redirect({ to: "/protocolo" });
  },
  component: () => null,
});
