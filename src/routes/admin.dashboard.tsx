import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Dashboard() {
  const fetchStats = useServerFn(adminStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats(),
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Visão geral da operação.</p>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{(error as Error).message}</p>}
      {data && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card label="Usuários ativos" value={data.activeUsers.toString()} />
            <Card label="Vendas totais" value={data.totalPurchases.toString()} />
            <Card label="Receita 30 dias" value={fmtBRL(data.mrrCents)} />
          </div>

          <section className="mt-10">
            <h2 className="font-display text-xl">Atividades recentes</h2>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-background">
              {data.logs.length === 0 && (
                <p className="p-5 text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
              )}
              {data.logs.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.action}</p>
                    {l.target && <p className="truncate text-xs text-muted-foreground">{l.target}</p>}
                  </div>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
