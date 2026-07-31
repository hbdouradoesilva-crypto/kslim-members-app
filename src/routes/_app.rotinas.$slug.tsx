import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ROTINAS, type Rotina } from "@/data/routines";
import { ArrowLeft } from "lucide-react";
import { YouTubePlayer } from "@/components/kslim/youtube-player";

export const Route = createFileRoute("/_app/rotinas/$slug")({
  loader: ({ params }): { rotina: Rotina } => {
    const rotina = ROTINAS.find((r) => r.slug === params.slug);
    if (!rotina) throw notFound();
    return { rotina };
  },
  component: RotinaDetalhe,
});

function RotinaDetalhe() {
  const { rotina } = Route.useLoaderData() as { rotina: Rotina };
  return (
    <div>
      <div className="px-6 pt-6">
        <Link to="/rotinas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Rotinas
        </Link>
      </div>
      <header className="px-6 pt-6">
        <p className="eyebrow">{rotina.categoria}</p>
        <h1 className="mt-2 font-display text-[28px] leading-tight">{rotina.titulo}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{rotina.objetivo}</p>
      </header>

      <section className="mt-8 px-6 pb-10">
        <YouTubePlayer url={rotina.videoUrl} title={rotina.titulo} />
      </section>
    </div>
  );
}
