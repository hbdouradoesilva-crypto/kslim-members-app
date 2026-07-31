import { createFileRoute, Link } from "@tanstack/react-router";
import { ROTINAS, CATEGORIAS } from "@/data/routines";
import { ScreenHeader } from "@/components/kslim/app-shell";
import { ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/rotinas/")({
  component: Rotinas,
});

function Rotinas() {
  return (
    <div>
      <ScreenHeader
        eyebrow="Biblioteca K-Slim"
        title="Rotinas"
        subtitle="Sessões curtas para momentos específicos — encaixe quando o corpo pedir."
      />

      <div className="space-y-9 px-6">
        {CATEGORIAS.map((cat) => {
          const items = ROTINAS.filter((r) => r.categoria === cat);
          if (!items.length) return null;
          return (
            <section key={cat}>
              <h2 className="mb-3 font-display text-lg">{cat}</h2>
              <div className="space-y-2.5">
                {items.map((r) => (
                  <Link
                    key={r.slug}
                    to="/rotinas/$slug"
                    params={{ slug: r.slug }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 active:scale-[0.99]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft via-muted to-info-soft">
                      <Play className="h-4 w-4 fill-primary text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{r.titulo}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.objetivo}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <NivelDot nivel={r.nivel} />
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function NivelDot({ nivel }: { nivel: string }) {
  const color = nivel === "Leve" ? "bg-success" : nivel === "Moderada" ? "bg-warn" : "bg-destructive";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
      {nivel}
    </span>
  );
}
