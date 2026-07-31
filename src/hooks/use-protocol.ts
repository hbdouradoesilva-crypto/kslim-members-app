import { useEffect, useState, useCallback, useRef } from "react";
import { PROTOCOLO } from "@/data/protocol";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const LEGACY_KEY = "kslim:progress:v1";

type State = {
  completedDays: number[];
  streak: number;
  lastCompletedISO: string | null;
  startedISO: string;
};

const INIT: State = {
  completedDays: [],
  streak: 0,
  lastCompletedISO: null,
  startedISO: new Date().toISOString(),
};

function readLegacy(): Partial<State> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isYesterdayOrToday(iso: string | null): "today" | "yesterday" | "other" {
  if (!iso) return "other";
  const last = new Date(iso);
  const now = new Date();
  const diff = Math.floor(
    (new Date(now.toDateString()).getTime() - new Date(last.toDateString()).getTime()) /
      86400000,
  );
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  return "other";
}

type Row = {
  user_id: string;
  completed_days: number[] | null;
  streak: number | null;
  last_completed_at: string | null;
  started_at: string | null;
};

function rowToState(row: Row): State {
  return {
    completedDays: row.completed_days ?? [],
    streak: row.streak ?? 0,
    lastCompletedISO: row.last_completed_at ?? null,
    startedISO: row.started_at ?? new Date().toISOString(),
  };
}

async function persist(userId: string, s: State) {
  const { error } = await supabase.from("user_progress").upsert({
    user_id: userId,
    completed_days: s.completedDays,
    streak: s.streak,
    last_completed_at: s.lastCompletedISO,
    started_at: s.startedISO,
  });
  if (error) console.error("persist progress", error);
}

export function useProtocol() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>(INIT);
  const [hydrated, setHydrated] = useState(false);
  const migratedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState(INIT);
      setHydrated(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("user_progress")
        .select("user_id, completed_days, streak, last_completed_at, started_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setState(rowToState(data as Row));
        setHydrated(true);
        return;
      }

      // No DB row: try migrating from legacy localStorage.
      const legacy = readLegacy();
      const seed: State = legacy && !migratedRef.current
        ? {
            completedDays: legacy.completedDays ?? [],
            streak: legacy.streak ?? 0,
            lastCompletedISO: legacy.lastCompletedISO ?? null,
            startedISO: legacy.startedISO ?? new Date().toISOString(),
          }
        : { ...INIT, startedISO: new Date().toISOString() };

      migratedRef.current = true;
      await persist(user.id, seed);
      try { localStorage.removeItem(LEGACY_KEY); } catch {}
      if (cancelled) return;
      setState(seed);
      setHydrated(true);
    })();

    return () => { cancelled = true; };
  }, [user, authLoading]);

  const currentDay = Math.min(state.completedDays.length + 1, 21);

  const status = useCallback(
    (dia: number): "concluido" | "disponivel" | "bloqueado" => {
      if (state.completedDays.includes(dia)) return "concluido";
      if (dia === currentDay) return "disponivel";
      return "bloqueado";
    },
    [state.completedDays, currentDay],
  );

  const complete = useCallback((dia: number) => {
    setState((s) => {
      if (s.completedDays.includes(dia)) return s;
      const rel = isYesterdayOrToday(s.lastCompletedISO);
      const nextStreak = rel === "yesterday" || rel === "today" ? s.streak + 1 : 1;
      const next: State = {
        ...s,
        completedDays: [...s.completedDays, dia].sort((a, b) => a - b),
        streak: nextStreak,
        lastCompletedISO: new Date().toISOString(),
      };
      if (user) persist(user.id, next);
      return next;
    });
  }, [user]);

  const reset = useCallback(() => {
    const next = { ...INIT, startedISO: new Date().toISOString() };
    setState(next);
    if (user) persist(user.id, next);
  }, [user]);

  // Métricas por foco (0-100)
  const metrics = (() => {
    const totals: Record<string, number> = { linfatico: 0, core: 0, mobilidade: 0, postura: 0, cintura: 0, gluteo: 0 };
    const maxes: Record<string, number> = { ...totals };
    for (const m of PROTOCOLO) for (const f of m.foco) maxes[f] += 1;
    for (const dia of state.completedDays) {
      const m = PROTOCOLO.find((x) => x.dia === dia);
      if (m) for (const f of m.foco) totals[f] += 1;
    }
    const result: Record<string, number> = {};
    for (const k of Object.keys(totals)) result[k] = maxes[k] ? Math.round((totals[k] / maxes[k]) * 100) : 0;
    return result;
  })();

  const overall = Math.round((state.completedDays.length / 21) * 100);

  return { state, hydrated, currentDay, status, complete, reset, metrics, overall };
}
