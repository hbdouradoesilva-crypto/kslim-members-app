import type { ReactNode } from "react";
import { TabBar } from "./tab-bar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh w-full bg-[oklch(0.96_0.008_40)]">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background shadow-[0_0_60px_-30px_rgba(0,0,0,0.15)]">
        <main className="flex-1 pb-4">{children}</main>
        <TabBar />
      </div>
    </div>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="px-6 pt-8 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-2 font-display text-[28px] leading-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
    </header>
  );
}
