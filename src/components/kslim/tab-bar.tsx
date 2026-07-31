import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, Layers, BookOpen, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/protocolo", label: "Protocolo", icon: Sparkles },
  { to: "/rotinas", label: "Rotinas", icon: Layers },
  { to: "/guia", label: "Guia", icon: BookOpen },
  { to: "/coach", label: "Coach", icon: MessageCircle },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-30 border-t border-border/70 bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 pt-2">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10.5px] font-medium tracking-wide transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                    active ? "bg-primary-soft" : "bg-transparent",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>
                <span className={cn(active && "font-semibold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
