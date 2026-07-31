import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { PROTOCOLO, FOCOS_LABEL, type Missao } from "@/data/protocol";
import { useProtocol } from "@/hooks/use-protocol";
import { ArrowLeft, Check, Clock, Target, ListChecks, Lock } from "lucide-react";
import { YouTubePlayer } from "@/components/kslim/youtube-player";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/protocolo/dia/$dia")({
  loader: ({ params }): { missao: Missao } => {
    const dia = Number(params.dia);
    const missao = PROTOCOLO.find((m) => m.dia === dia);
    if (!missao) throw notFound();
    return { missao };
  },
  component: MissaoDetalhe,
});

function MissaoDetalhe() {
  const { missao } = Route.useLoaderData() as { missao: Missao };
  const { status, complete } = useProtocol();
  const navigate = useNavigate();
  const st = status(missao.dia);
  const bloqueado = st === "bloqueado";

  const onConcluir = () => {
    complete(missao.dia);
    navigate({ to: "/protocolo/dia/$dia/concluida", params: { dia: String(missao.dia) } });
  };

  return (
    <div>
      <div className="px-6 pt-6">
        <Link to="/protocolo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Protocolo
        </Link>
      </div>

      <header className="px-6 pt-6">
        <p className="eyebrow">Dia {missao.dia} · Semana {missao.semana}</p>
        <h1 className="mt-2 font-display text-[28px] leading-tight">{missao.titulo}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{missao.objetivo}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Chip icon={<Clock className="h-3 w-3" />}>{missao.duracaoMin} min</Chip>
          <Chip icon={<Target className="h-3 w-3" />}>
            {missao.foco.map((f) => FOCOS_LABEL[f]).join(" · ")}
          </Chip>
          {st === "concluido" && (
            <span className="rounded-full bg-success-soft px-3 py-1 text-[11px] font-semibold text-success">
              Concluído
            </span>
          )}
        </div>
      </header>

      <section className="mt-6 px-6">
        <YouTubePlayer url={missao.videoUrl} title={missao.titulo} />
      </section>


      <section className="mt-8 px-6">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="h-3.5 w-3.5 text-primary" />
          <p className="eyebrow">Antes de começar</p>
        </div>
        <ul className="space-y-2 rounded-2xl border border-border bg-card p-5">
          {missao.checklist.map((c, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-foreground/85">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="sticky bottom-0 mt-10 border-t border-border/60 bg-background/90 px-6 py-4 backdrop-blur-xl">
        {bloqueado ? (
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted py-4 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" /> Disponível após concluir o Dia {missao.dia - 1}
          </div>
        ) : st === "concluido" ? (
          <div className="flex items-center justify-center gap-2 rounded-full bg-success-soft py-4 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Missão já concluída
          </div>
        ) : (
          <button
            onClick={onConcluir}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground",
              "transition-all hover:brightness-105 active:scale-[0.98] soft-shadow",
            )}
          >
            <Check className="h-4 w-4" /> Concluir missão
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
      {icon}{children}
    </span>
  );
}
