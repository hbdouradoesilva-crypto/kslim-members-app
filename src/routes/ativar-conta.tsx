import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ativar-conta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ativar acesso — K-Slim" },
      { name: "description", content: "Ative seu acesso ao K-Slim." },
    ],
  }),
  component: AtivarContaPage,
});

function AtivarContaPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSignOutAndBack() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function pedirNovoLink() {
    const { data } = await supabase.auth.getUser();
    const alvo = (data.user?.email ?? email).trim().toLowerCase();
    if (!alvo) {
      toast.error("Informe o email da sua compra.");
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: alvo,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        shouldCreateUser: false,
      },
    });
    setSending(false);
    if (error) {
      toast.error("Não conseguimos enviar o link agora. Tente novamente em instantes.");
      return;
    }
    toast.success(`Link enviado para ${alvo}.`);
  }

  return (
    <div className="min-h-svh bg-[oklch(0.96_0.008_40)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-sm flex-col rounded-3xl bg-background p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)]">
        <p className="eyebrow">Acesso</p>
        <h1 className="mt-1 font-display text-3xl">Sua conta ainda não tem acesso liberado</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Você entrou, mas essa conta ainda não tem o produto liberado. Isso pode acontecer se você usou um email diferente do da compra, ou se a liberação manual ainda não aconteceu.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Confira se o email usado é o mesmo da compra.</p>
          <p><strong className="text-foreground">2.</strong> Se comprou agora, aguarde alguns minutos e peça um novo link.</p>
          <p><strong className="text-foreground">3.</strong> Se o problema continuar, fale com o suporte enviando o email da compra.</p>
        </div>

        <label className="mt-6 block text-xs font-medium text-muted-foreground">
          Email da compra (opcional)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
          />
        </label>

        <button
          type="button"
          onClick={pedirNovoLink}
          disabled={sending}
          className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {sending ? "Enviando..." : "Receber novo link de acesso"}
        </button>

        <button
          type="button"
          onClick={handleSignOutAndBack}
          className="mt-3 text-center text-xs text-muted-foreground underline"
        >
          Entrar com outra conta
        </button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Já é aluno e recebeu acesso? <Link to="/login" className="underline text-foreground/80">Voltar ao login</Link>.
        </p>
      </div>
    </div>
  );
}
