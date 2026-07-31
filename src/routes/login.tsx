import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — K-Slim" },
      { name: "description", content: "Acesse sua conta K-Slim pelo link enviado no seu email." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Pequeno delay para dar sensação de processamento
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-svh bg-[oklch(0.96_0.008_40)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-sm flex-col rounded-3xl bg-background p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)]">
        <p className="eyebrow">Entrar no</p>
        <h1 className="mt-1 font-display text-4xl">K-Slim</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Digite seu email e enviaremos um link de acesso.
        </p>
        <form onSubmit={submitEmail} className="mt-8 space-y-4">
          <label className="block text-xs font-medium text-muted-foreground">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Verificando..." : "Receber link de acesso"}
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Ainda não comprou?{" "}
          <a href="https://k-slim-protocol.lovable.app" className="underline text-foreground/80">
            Conheça o K-Slim
          </a>.
        </p>
      </div>
    </div>
  );
}
