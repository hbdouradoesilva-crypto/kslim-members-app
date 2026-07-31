import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Configurações</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajustes gerais do app. Novas configurações aparecerão aqui.
      </p>

      <div className="mt-8 space-y-3 rounded-2xl border border-border bg-background p-5">
        <Row label="Nome do app" value="K-Slim" />
        <Row label="Provedor de pagamento" value="Cakto" />
        <Row label="Webhook público" value="/api/public/webhooks/cakto" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
