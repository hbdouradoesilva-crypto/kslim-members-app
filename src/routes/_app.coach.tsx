import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ScreenHeader } from "@/components/kslim/app-shell";
import { SUGESTOES, respostaMock } from "@/data/coach";
import { Send, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/coach")({
  component: Coach,
});

type Msg = { from: "coach" | "user"; text: string };

function Coach() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "coach", text: "Oi, sou o Coach K-Slim. Posso te orientar dentro do protocolo. Escolha um atalho ou escreva sua pergunta." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "coach", text: respostaMock(text) }]);
      setTyping(false);
    }, 700);
  };

  return (
    <div className="flex min-h-[calc(100svh-72px)] flex-col">
      <ScreenHeader
        eyebrow="Assistente do protocolo"
        title="Coach K-Slim"
        subtitle="Suporte contínuo dentro do método. Respostas alinhadas ao seu dia."
        right={
          <span className="inline-flex items-center gap-1 rounded-full bg-premium-soft px-2.5 py-1 text-[10px] font-semibold text-premium">
            <Sparkles className="h-3 w-3" /> IA
          </span>
        }
      />

      <div className="flex-1 space-y-3 px-6 pb-4">
        {msgs.map((m, i) => (
          <Bubble key={i} from={m.from}>{m.text}</Bubble>
        ))}
        {typing && (
          <Bubble from="coach">
            <span className="inline-flex gap-1">
              <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
            </span>
          </Bubble>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sugestões */}
      <div className="border-t border-border/60 px-6 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Premium banner */}
      <div className="mx-6 mb-3 flex items-center gap-3 rounded-2xl border border-premium/25 bg-premium-soft p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-premium text-white">
          <Lock className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-premium">Coach K-Slim Premium</p>
          <p className="text-[11px] text-muted-foreground">Acompanha seu histórico e ajusta o plano em tempo real.</p>
        </div>
        <button className="rounded-full bg-premium px-3 py-1.5 text-[11px] font-semibold text-white">Upgrade</button>
      </div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2 rounded-full border border-border bg-card pr-1.5 pl-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva sua pergunta…"
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function Bubble({ from, children }: { from: "coach" | "user"; children: React.ReactNode }) {
  return (
    <div className={cn("flex animate-fade-in", from === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          from === "user"
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: delay }}
    />
  );
}
