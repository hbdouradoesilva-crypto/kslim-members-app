import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminSalesByDay } from "@/lib/admin.functions";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fn = useServerFn(adminSalesByDay);
  const { data } = useQuery({ queryKey: ["admin-sales-by-day"], queryFn: () => fn() });

  return (
    <div>
      <h1 className="font-display text-3xl">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Vendas dos últimos 30 dias.</p>

      <div className="mt-8 rounded-2xl border border-border bg-background p-5">
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={data ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#e11d74" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
