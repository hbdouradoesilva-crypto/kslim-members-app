import { createFileRoute, Link } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/kslim/app-shell";
import { SEMAFORO, REGRAS_DE_OURO, MITOS, FAQ, RECEITAS, LISTA_COMPRAS } from "@/data/guide";
import { ArrowUpRight, Droplet, Utensils, Sparkles, HelpCircle, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/guia/")({
  component: Guia,
});

const SECOES = [
  { slug: "regras-de-ouro", titulo: "Regras de Ouro", desc: "7 princípios que sustentam o protocolo.", Icon: Sparkles },
  { slug: "mitos", titulo: "Mitos e Verdades", desc: "O que a ciência diz sobre desinchar.", Icon: HelpCircle },
  { slug: "receitas", titulo: "Receitas Rápidas", desc: "Chás, bowls e pratos leveza.", Icon: Utensils },
  { slug: "hidratacao", titulo: "Hidratação e Chás", desc: "O que beber para acelerar o resultado.", Icon: Droplet },
  { slug: "lista-compras", titulo: "Lista de compras", desc: "Tudo que a semana pede.", Icon: ShoppingBag },
  { slug: "faq", titulo: "Perguntas frequentes", desc: "Dúvidas comuns das primeiras semanas.", Icon: HelpCircle },
] as const;

function Guia() {
  return (
    <div>
      <ScreenHeader
        eyebrow="Semáforo K-Slim"
        title="Guia alimentar"
        subtitle="Não é dieta. É orientação — o que sustenta, o que modera e o que trava o resultado."
      />

      <section className="px-6">
        <div className="space-y-3">
          <Link to="/guia/$secao" params={{ secao: "verde" }}
            className="block rounded-2xl border border-border bg-card p-5 transition-all hover:border-[color:var(--color-semaforo-verde)]/60">
            <SemaforoRow tom="verde" titulo={SEMAFORO.verde.titulo} desc={SEMAFORO.verde.descricao} />
          </Link>
          <Link to="/guia/$secao" params={{ secao: "amarelo" }}
            className="block rounded-2xl border border-border bg-card p-5 transition-all hover:border-[color:var(--color-semaforo-amarelo)]/60">
            <SemaforoRow tom="amarelo" titulo={SEMAFORO.amarelo.titulo} desc={SEMAFORO.amarelo.descricao} />
          </Link>
          <Link to="/guia/$secao" params={{ secao: "vermelho" }}
            className="block rounded-2xl border border-border bg-card p-5 transition-all hover:border-[color:var(--color-semaforo-vermelho)]/60">
            <SemaforoRow tom="vermelho" titulo={SEMAFORO.vermelho.titulo} desc={SEMAFORO.vermelho.descricao} />
          </Link>
        </div>
      </section>

      <section className="mt-10 px-6">
        <p className="eyebrow mb-3">Mais no Guia</p>
        <div className="grid grid-cols-2 gap-3">
          {SECOES.map(({ slug, titulo, desc, Icon }) => (
            <Link
              key={slug}
              to="/guia/$secao"
              params={{ secao: slug }}
              className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <p className="mt-3 text-[13px] font-medium leading-snug">{titulo}</p>
              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4 text-[11px] text-muted-foreground">
          <span>Regras: <b className="text-foreground">{REGRAS_DE_OURO.length}</b></span>
          <span>Receitas: <b className="text-foreground">{RECEITAS.length}</b></span>
          <span>Mitos: <b className="text-foreground">{MITOS.length}</b></span>
          <span>Compras: <b className="text-foreground">{LISTA_COMPRAS.length}</b></span>
          <span>FAQ: <b className="text-foreground">{FAQ.length}</b></span>
        </div>
      </section>
    </div>
  );
}

function SemaforoRow({ tom, titulo, desc }: { tom: "verde" | "amarelo" | "vermelho"; titulo: string; desc: string }) {
  const cor = {
    verde: "bg-[color:var(--color-semaforo-verde)]",
    amarelo: "bg-[color:var(--color-semaforo-amarelo)]",
    vermelho: "bg-[color:var(--color-semaforo-vermelho)]",
  }[tom];
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1 flex flex-col gap-1">
        <span className={cn("h-3 w-3 rounded-full", tom === "verde" ? cor : "bg-muted")} />
        <span className={cn("h-3 w-3 rounded-full", tom === "amarelo" ? cor : "bg-muted")} />
        <span className={cn("h-3 w-3 rounded-full", tom === "vermelho" ? cor : "bg-muted")} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg">{titulo}</p>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </div>
  );
}
