import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SEMAFORO, REGRAS_DE_OURO, MITOS, FAQ, RECEITAS, LISTA_COMPRAS } from "@/data/guide";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/guia/$secao")({
  loader: ({ params }) => {
    const valid = ["verde","amarelo","vermelho","regras-de-ouro","mitos","receitas","hidratacao","lista-compras","faq"];
    if (!valid.includes(params.secao)) throw notFound();
    return { secao: params.secao };
  },
  component: GuiaSecao,
});

function GuiaSecao() {
  const { secao } = Route.useLoaderData() as { secao: string };
  return (
    <div>
      <div className="px-6 pt-6">
        <Link to="/guia" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Guia
        </Link>
      </div>
      <div className="px-6 pt-6 pb-10">
        {renderSecao(secao)}
      </div>
    </div>
  );
}

function renderSecao(secao: string) {
  if (secao === "verde" || secao === "amarelo" || secao === "vermelho") {
    const s = SEMAFORO[secao];
    const cor = {
      verde: "bg-[color:var(--color-semaforo-verde)]",
      amarelo: "bg-[color:var(--color-semaforo-amarelo)]",
      vermelho: "bg-[color:var(--color-semaforo-vermelho)]",
    }[secao];
    return (
      <>
        <span className={cn("inline-block h-3 w-3 rounded-full", cor)} />
        <h1 className="mt-3 font-display text-[28px]">{s.titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{s.descricao}</p>
        <ul className="mt-6 space-y-2">
          {s.itens.map((a, i) => (
            <li key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm">
              <span className="font-medium">{a.nome}</span>
              {a.nota ? <span className="text-[11px] text-muted-foreground">{a.nota}</span> : null}
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (secao === "regras-de-ouro") return (
    <>
      <h1 className="font-display text-[28px]">Regras de Ouro</h1>
      <p className="mt-2 text-sm text-muted-foreground">Os princípios que sustentam o protocolo. Ler uma vez por semana.</p>
      <ol className="mt-6 space-y-2.5">
        {REGRAS_DE_OURO.map((r, i) => (
          <li key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
            <span className="font-display text-2xl text-primary">{i + 1}</span>
            <span className="pt-1 text-sm">{r}</span>
          </li>
        ))}
      </ol>
    </>
  );

  if (secao === "mitos") return (
    <>
      <h1 className="font-display text-[28px]">Mitos e Verdades</h1>
      <ul className="mt-6 space-y-3">
        {MITOS.map((m, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">Mito</p>
            <p className="mt-1 font-medium">{m.mito}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-success">Verdade</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.verdade}</p>
          </li>
        ))}
      </ul>
    </>
  );

  if (secao === "receitas") return (
    <>
      <h1 className="font-display text-[28px]">Receitas Rápidas</h1>
      <p className="mt-2 text-sm text-muted-foreground">Preparo em minutos, sabor da estação.</p>
      <ul className="mt-6 space-y-3">
        {RECEITAS.map((r, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg">{r.nome}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{r.tempo}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {r.ingredientes.map((ing, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="mt-2 h-1 w-1 rounded-full bg-primary" />
                  {ing}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );

  if (secao === "hidratacao") return (
    <>
      <h1 className="font-display text-[28px]">Hidratação e Chás</h1>
      <p className="mt-2 text-sm text-muted-foreground">Meta base: 35 ml por kg. Dividir ao longo do dia.</p>
      <div className="mt-6 space-y-3">
        {["Água ao acordar (300 ml)","Chá de hibisco (manhã)","Água drenante (tarde)","Chá de cavalinha (fim da tarde)","Chá de gengibre (noite, sem cafeína)"].map((t, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 text-sm">{t}</div>
        ))}
      </div>
    </>
  );

  if (secao === "lista-compras") return (
    <>
      <h1 className="font-display text-[28px]">Lista de compras</h1>
      <p className="mt-2 text-sm text-muted-foreground">O essencial para uma semana leve.</p>
      <ul className="mt-6 space-y-2">
        {LISTA_COMPRAS.map((c, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            {c}
          </li>
        ))}
      </ul>
    </>
  );

  if (secao === "faq") return (
    <>
      <h1 className="font-display text-[28px]">Perguntas frequentes</h1>
      <ul className="mt-6 space-y-3">
        {FAQ.map((f, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-medium">{f.q}</p>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </li>
        ))}
      </ul>
    </>
  );

  return null;
}
