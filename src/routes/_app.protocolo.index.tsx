import { createFileRoute, Link } from "@tanstack/react-router";
import { PROTOCOLO, SEMANAS, FOCOS_LABEL } from "@/data/protocol";
import { useProtocol } from "@/hooks/use-protocol";
import { useProfile } from "@/hooks/use-profile";
import { ProgressBar, MetricBar } from "@/components/kslim/progress";
import { ScreenHeader } from "@/components/kslim/app-shell";
import { Lock, Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/protocolo/")({
  component: ProtocoloHome,
});

function ProtocoloHome() {
  const { currentDay, status, state, metrics, overall, hydrated } = useProtocol();
  const { profile } = useProfile();

  const nome = profile.nome || "você";
  const semanaAtual = PROTOCOLO.find((m) => m.dia === currentDay)?.semana ?? 1;

  return (
    <div>
      <ScreenHeader
        eyebrow={`Dia ${currentDay} de 21 · Semana ${semanaAtual}`}
        title={`Bem-vinda, ${nome}.`}
        subtitle="Cada dia ativa uma etapa do seu protocolo. Complete a missão de hoje para desbloquear a próxima."
        right={
          <div className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-primary">
            <Flame className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="text-xs font-semibold">{hydrated ? state.streak : 0}</span>
          </div>
        }
      />

      <div className="px-6">
        <div className="card-elevated p-5">
          <ProgressBar value={state.completedDays.length} total={21} label="Protocolo K-Slim" />
        </div>
      </div>

      <section className="mt-8 px-6">
        <p className="eyebrow mb-3">Sistemas ativados</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricBar label="Sistema Linfático" value={metrics.linfatico} tone="success" />
          <MetricBar label="Core" value={metrics.core} tone="primary" />
          <MetricBar label="Cintura" value={metrics.cintura} tone="primary" />
          <MetricBar label="Postura" value={metrics.postura} tone="info" />
          <MetricBar label="Mobilidade" value={metrics.mobilidade} tone="warn" />
          <MetricBar label="Glúteo" value={metrics.gluteo} tone="primary" />
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-center text-[11px] text-muted-foreground">
          Protocolo concluído · <span className="font-semibold text-foreground">{overall}%</span>
        </div>
      </section>

      <section className="mt-10 px-6">
        <p className="eyebrow mb-4">Mapa do protocolo</p>
        <div className="space-y-8">
          {SEMANAS.map((sem) => {
            const missoes = PROTOCOLO.filter((m) => m.semana === sem.numero);
            return (
              <div key={sem.numero}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-lg">
                    Semana {sem.numero} — <span className="text-primary">{sem.nome}</span>
                  </h2>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">{sem.descricao}</p>
                <ul className="space-y-2.5">
                  {missoes.map((m) => (
                    <MissionRow
                      key={m.dia}
                      dia={m.dia}
                      titulo={m.titulo}
                      foco={m.foco.map((f) => FOCOS_LABEL[f]).slice(0, 2)}
                      status={hydrated ? status(m.dia) : "bloqueado"}
                    />
                  ))}

                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-8 mb-2 text-center text-xs text-muted-foreground">
          Um protocolo. Não uma playlist.
        </p>
      </section>
    </div>
  );
}

function MissionRow({
  dia, titulo, foco, status,
}: {
  dia: number; titulo: string; foco: string[];
  status: "concluido" | "disponivel" | "bloqueado";
}) {

  const body = (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 transition-all",
        status === "disponivel" && "border-primary bg-primary-soft/60 soft-shadow",
        status === "concluido" && "border-border bg-card opacity-90",
        status === "bloqueado" && "border-border bg-card/60 opacity-70",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          status === "disponivel" && "bg-primary text-primary-foreground",
          status === "concluido" && "bg-success-soft text-success",
          status === "bloqueado" && "bg-muted text-muted-foreground",
        )}
      >
        {status === "concluido" ? <Check className="h-5 w-5" strokeWidth={2.4} /> :
         status === "bloqueado" ? <Lock className="h-4 w-4" strokeWidth={1.6} /> :
         <span>{dia}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="eyebrow">Dia {dia}</p>
          {status === "disponivel" && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-primary">
              Hoje
            </span>
          )}
        </div>
        <p className={cn("mt-0.5 truncate font-medium", status === "bloqueado" && "text-muted-foreground")}>
          {titulo}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="truncate">{foco.join(" · ")}</span>
        </div>

      </div>
    </div>
  );

  if (status === "bloqueado") return <li>{body}</li>;
  return (
    <li>
      <Link
        to="/protocolo/dia/$dia"
        params={{ dia: String(dia) }}
        className="block transition-transform hover:translate-y-[-1px] active:scale-[0.99]"
      >
        {body}
      </Link>
    </li>
  );
}
