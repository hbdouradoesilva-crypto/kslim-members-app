import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { completeOnboarding } from "@/lib/onboarding.functions";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Leaf, Wind } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: Onboarding,
});

const OBJETIVOS = [
  { id: "desinchar", label: "Desinchar", desc: "Sair do peso e da retenção.", Icon: Wind },
  { id: "afinar", label: "Afinar a cintura", desc: "Redesenhar a silhueta por dentro.", Icon: Sparkles },
  { id: "leveza", label: "Recuperar leveza", desc: "Voltar a se sentir bem no próprio corpo.", Icon: Leaf },
] as const;

function Onboarding() {
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState<(typeof OBJETIVOS)[number]["id"] | null>(null);
  const [saving, setSaving] = useState(false);
  const completeOnboardingFn = useServerFn(completeOnboarding);
  const navigate = useNavigate();

  const total = 4;

  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await completeOnboardingFn({ data: { nome: nome.trim() || "você", objetivo } });
      navigate({ to: "/protocolo", replace: true });
    } catch {
      const { toast } = await import("sonner");
      toast.error("Não conseguimos salvar. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-svh w-full bg-[oklch(0.96_0.008_40)]">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background">
        {/* progresso */}
        <div className="flex gap-1.5 px-6 pt-6">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col px-6 pt-10 pb-8 animate-fade-in" key={step}>
          {step === 0 && (
            <>
              <p className="eyebrow">Bem-vinda</p>
              <h1 className="mt-3 font-display text-[34px] leading-[1.05]">
                Você acaba de entrar no{" "}
                <span className="text-primary">Protocolo K-Slim</span>.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Um método coreano de 21 dias para desinchar, afinar a cintura e recuperar
                a leveza do corpo — sem academia, sem sofrimento.
              </p>
              <div className="mt-auto pt-10">
                <PrimaryButton onClick={next}>Começar</PrimaryButton>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="eyebrow">Passo 1 de 3</p>
              <h1 className="mt-3 font-display text-3xl">Como podemos te chamar?</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Seu nome aparece no início de cada missão.
              </p>
              <input
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu primeiro nome"
                className="mt-8 w-full rounded-2xl border border-border bg-card px-5 py-4 text-base outline-none transition-colors focus:border-primary"
              />
              <div className="mt-auto pt-10">
                <PrimaryButton onClick={next}>Continuar</PrimaryButton>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="eyebrow">Passo 2 de 3</p>
              <h1 className="mt-3 font-display text-3xl">Qual é o seu foco agora?</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                O protocolo é o mesmo — sua intenção ajusta o Coach.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {OBJETIVOS.map(({ id, label, desc, Icon }) => {
                  const active = objetivo === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setObjetivo(id)}
                      className={cn(
                        "flex items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-auto pt-10">
                <PrimaryButton onClick={next} disabled={!objetivo}>Continuar</PrimaryButton>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="eyebrow">A promessa</p>
              <h1 className="mt-3 font-display text-[30px] leading-[1.1]">
                21 dias. 3 etapas.<br />Um corpo mais leve.
              </h1>
              <div className="mt-6 space-y-3">
                <PromiseRow n="1" titulo="Desinchar e Ativar" desc="Semana 1 — drenagem, respiração e mobilidade." />
                <PromiseRow n="2" titulo="Modelar e Afinar" desc="Semana 2 — cintura, core profundo e postura." />
                <PromiseRow n="3" titulo="Consolidar e Manter" desc="Semana 3 — rituais que se tornam hábito." />
              </div>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Cada dia libera uma nova etapa. Complete a missão para desbloquear a próxima.
              </p>
              <div className="mt-auto pt-10">
                <PrimaryButton onClick={finish} disabled={saving}>{saving ? "Entrando..." : "Entrar no protocolo"}</PrimaryButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-medium text-primary-foreground transition-all",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        !disabled && "hover:brightness-105 active:scale-[0.98] soft-shadow",
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function PromiseRow({ n, titulo, desc }: { n: string; titulo: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
      <span className="font-display text-2xl text-primary">{n}</span>
      <div>
        <p className="font-medium text-foreground">{titulo}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
