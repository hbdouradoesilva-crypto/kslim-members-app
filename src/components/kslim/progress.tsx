import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  total = 21,
  label,
  className,
}: {
  value: number;
  total?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / total) * 100));
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
      ) : null}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Dia {Math.min(value, total)}</span>
        <span>{total} dias</span>
      </div>
    </div>
  );
}

export function MetricBar({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: number;
  tone?: "primary" | "success" | "info" | "warn";
}) {
  const bg = {
    primary: "bg-primary",
    success: "bg-success",
    info: "bg-info",
    warn: "bg-warn",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value}%</span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", bg)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
