import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/kslim/app-shell";

// AUTH DESATIVADO PARA DESENVOLVIMENTO LOCAL
// Para reativar o login, restaure o beforeLoad original com supabase.auth.getUser()
export const Route = createFileRoute("/_app")({
  ssr: false,
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

