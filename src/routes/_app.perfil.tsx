import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/kslim/app-shell";
import { useProfile } from "@/hooks/use-profile";
import { useProtocol } from "@/hooks/use-protocol";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Award, Flame, Calendar, Sparkles, Bell, ShieldCheck, LogOut, ChevronRight, RotateCcw, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/perfil")({
  component: Perfil,
});

function Perfil() {
  const { profile, save } = useProfile();
  const { state, overall, reset } = useProtocol();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const CONQUISTAS = [
    { id: "m1", label: "Primeira missão", desbloq: state.completedDays.length >= 1, Icon: Sparkles },
    { id: "s1", label: "Primeira semana", desbloq: state.completedDays.length >= 7, Icon: Award },
    { id: "s7", label: "7 dias seguidos", desbloq: state.streak >= 7, Icon: Flame },
    { id: "d14", label: "14 dias", desbloq: state.completedDays.length >= 14, Icon: Calendar },
    { id: "d21", label: "Protocolo completo", desbloq: state.completedDays.length >= 21, Icon: Award },
    { id: "manha", label: "Ritual matinal", desbloq: state.completedDays.includes(15), Icon: Sparkles },
  ];

  const nome = profile.nome || "Você";

  return (
    <div>
      <ScreenHeader eyebrow="Sua jornada" title="Perfil" />

      <section className="px-6">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft font-display text-2xl text-primary">
            {nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl">{nome}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {profile.objetivo === "desinchar" && "Foco: desinchar"}
              {profile.objetivo === "afinar" && "Foco: afinar a cintura"}
              {profile.objetivo === "leveza" && "Foco: recuperar leveza"}
              {!profile.objetivo && "No Protocolo K-Slim"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Missões" value={state.completedDays.length} />
          <Stat label="Sequência" value={state.streak} icon={<Flame className="h-3.5 w-3.5 text-primary" />} />
          <Stat label="Protocolo" value={`${overall}%`} />
        </div>
      </section>

      {isAdmin && (
        <section className="mt-6 px-6">
          <button
            onClick={() => navigate({ to: "/admin/dashboard" })}
            className="flex w-full items-center gap-4 rounded-2xl border border-primary/30 bg-primary-soft/60 p-4 text-left transition-colors hover:bg-primary-soft"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Modo Admin</p>
              <p className="mt-0.5 font-display text-base text-foreground">Painel de Administrador</p>
              <p className="text-[11px] text-muted-foreground">Métricas, vendas, usuárias e produtos</p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary" />
          </button>
        </section>
      )}

      <section className="mt-10 px-6">
        <p className="eyebrow mb-3">Conquistas</p>
        <div className="grid grid-cols-3 gap-3">
          {CONQUISTAS.map(({ id, label, desbloq, Icon }) => (
            <div
              key={id}
              className={cn(
                "flex flex-col items-center rounded-2xl border p-3 text-center transition-all",
                desbloq ? "border-primary/30 bg-primary-soft/50" : "border-border bg-card opacity-55",
              )}
            >
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                desbloq ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}>
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <p className="mt-2 text-[10.5px] font-medium leading-tight text-foreground/85">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 px-6">
        <p className="eyebrow mb-3">Configurações</p>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <Row icon={<Bell className="h-4 w-4" />} label="Notificações" hint="Lembretes suaves" />
          <Row icon={<ShieldCheck className="h-4 w-4" />} label="Privacidade" hint="Seus dados" />
          <Row icon={<Award className="h-4 w-4" />} label="Termos e Política" />
        </ul>

        {user?.email ? (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Conectada como <span className="text-foreground">{user.email}</span>
          </p>
        ) : null}

        <button
          onClick={() => {
            if (confirm("Reiniciar o protocolo? Todo o progresso será apagado.")) {
              reset();
              save({ onboarded: false });
              navigate({ to: "/onboarding" });
            }
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm text-muted-foreground transition-colors hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar protocolo
        </button>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/login", replace: true });
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-foreground/5 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/10"
        >
          <LogOut className="h-4 w-4" /> Sair da conta
        </button>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          K-Slim · Protocolo Coreano
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-primary">
        {icon}
        <span className="font-display text-2xl text-foreground">{value}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ icon, label, hint }: { icon: React.ReactNode; label: string; hint?: string }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground/70">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </li>
  );
}
