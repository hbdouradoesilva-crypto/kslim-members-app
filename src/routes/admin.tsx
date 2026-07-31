import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Users, Package, Mail, BarChart3, Settings, LogOut, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — K-Slim" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/products", label: "Produtos", icon: Package },
  { to: "/admin/emails", label: "Emails", icon: Mail },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Configurações", icon: Settings },
] as const;

function AdminLayout() {
  return (
    <AuthGuard requireAdmin>
      <AdminShell />
    </AuthGuard>
  );
}

function AdminShell() {
  const { profile, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-svh bg-[oklch(0.96_0.008_40)]">
      <aside className="hidden w-64 flex-col border-r border-border bg-background px-4 py-6 md:flex">
        <div className="px-3 pb-6">
          <p className="eyebrow">K-Slim</p>
          <h1 className="mt-1 font-display text-xl">Admin</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-border pt-4">
          <p className="truncate px-3 text-xs text-muted-foreground">{profile?.email}</p>
          <Link
            to="/protocolo"
            className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao app
          </Link>
          <button
            onClick={() => signOut()}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <MobileNav pathname={pathname} />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
      <Link
        to="/protocolo"
        className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> App
      </Link>
      {NAV.map((item) => {
        const active = pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
              active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
