import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";

/** Extrai o ID do vídeo de qualquer formato de link do YouTube. */
export function extractYouTubeId(input?: string): string | null {
  if (!input) return null;
  const s = input.trim();
  // Já é só o ID (11 chars alfanuméricos + - _)
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      // /embed/ID, /shorts/ID, /live/ID
      const m = url.pathname.match(/\/(embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[2];
    }
  } catch {
    // não é URL válida
  }
  return null;
}

export function YouTubePlayer({
  url,
  title = "Vídeo da sessão",
}: {
  url?: string;
  title?: string;
}) {
  const id = extractYouTubeId(url);
  const [playing, setPlaying] = useState(false);

  if (!id) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft to-muted">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground/80">Vídeo em breve</p>
          <p className="max-w-[220px] text-xs text-muted-foreground">
            A sessão em vídeo desta missão será disponibilizada aqui.
          </p>
        </div>
      </div>
    );
  }

  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const watch = `https://www.youtube.com/watch?v=${id}`;

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black soft-shadow">
        {playing ? (
          <iframe
            src={embed}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Assistir: ${title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105">
              <Play className="ml-1 h-6 w-6 fill-primary text-primary" />
            </span>
          </button>
        )}
      </div>
      <a
        href={watch}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ExternalLink className="h-3 w-3" /> Abrir no YouTube
      </a>
    </div>
  );
}
