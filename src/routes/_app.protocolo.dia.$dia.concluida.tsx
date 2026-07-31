import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PROTOCOLO, SEMANAS, type Missao } from "@/data/protocol";
import { useProtocol } from "@/hooks/use-protocol";
import { Check, ArrowRight, Flame, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/protocolo/dia/$dia/concluida")({
  loader: ({ params }): { missao: Missao } => {
    const dia = Number(params.dia);
    const missao = PROTOCOLO.find((m) => m.dia === dia);
    if (!missao) throw notFound();
    return { missao };
  },
  component: Concluida,
});

function Concluida() {
  const { missao } = Route.useLoaderData() as { missao: Missao };
  const { state, currentDay } = useProtocol();
  const proximaSemana = SEMANAS.find((s) => s.numero === missao.semana + 1);
  const acabouSemana = missao.dia % 7 === 0 && missao.dia < 21;
  const completouTudo = missao.dia === 21;

  return (
    <div className="flex min-h-[80vh] flex-col items-center px-6 pt-16 text-center animate-fade-in">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success-soft animate-scale-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-8 w-8" strokeWidth={2.5} />
        </div>
      </div>

      <p className="eyebrow mt-8">Dia {missao.dia} concluído</p>
      <h1 className="mt-3 font-display text-[30px] leading-tight">
        {completouTudo ? "Protocolo completo." : "Missão concluída."}
      </h1>
      <p className="mt-4 max-w-xs text-sm text-muted-foreground">
        {completouTudo
          ? "Você percorreu os 21 dias do Protocolo K-Slim. O corpo agora conhece o caminho."
          : acabouSemana && proximaSemana
            ? `Semana ${missao.semana} concluída. Amanhã começa a Semana ${proximaSemana.numero} — ${proximaSemana.nome}.`
            : "Seu protocolo continua amanhã. A próxima etapa já está preparada."}
      </p>

      <div className="mt-8 grid w-full max-w-xs grid-cols-2 gap-3">
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Missões" value={state.completedDays.length} />
        <Stat icon={<Flame className="h-4 w-4" />} label="Constância" value={state.streak} />
      </div>

      <Link
        to="/protocolo"
        className="mt-10 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground soft-shadow active:scale-[0.98]"
      >
        {completouTudo ? "Ver meu protocolo" : `Voltar ao Dia ${Math.min(currentDay, 21)}`}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-center gap-1.5 text-primary">
        {icon}
        <span className="font-display text-2xl">{value}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
