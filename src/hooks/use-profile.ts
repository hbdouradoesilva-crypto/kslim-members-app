import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const LEGACY_KEY = "kslim:profile:v1";

export type Profile = {
  nome: string;
  objetivo: "desinchar" | "afinar" | "leveza" | null;
  onboarded: boolean;
};

const INIT: Profile = { nome: "", objetivo: null, onboarded: false };

type Row = {
  user_id: string;
  nome: string | null;
  objetivo: string | null;
  onboarded: boolean;
};

function readLegacy(): Partial<Profile> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile>(INIT);
  const [hydrated, setHydrated] = useState(false);
  const migratedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(INIT);
      setHydrated(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("user_profile_prefs")
        .select("user_id, nome, objetivo, onboarded")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        const row = data as Row;
        setProfile({
          nome: row.nome ?? "",
          objetivo: (row.objetivo as Profile["objetivo"]) ?? null,
          onboarded: !!row.onboarded,
        });
        setHydrated(true);
        return;
      }

      // No DB row — try migrating from legacy localStorage.
      const legacy = readLegacy();
      if (legacy && !migratedRef.current) {
        migratedRef.current = true;
        const seed: Profile = {
          nome: legacy.nome ?? "",
          objetivo: (legacy.objetivo as Profile["objetivo"]) ?? null,
          onboarded: !!legacy.onboarded,
        };
        await supabase.from("user_profile_prefs").upsert({
          user_id: user.id,
          nome: seed.nome || null,
          objetivo: seed.objetivo,
          onboarded: seed.onboarded,
        });
        try { localStorage.removeItem(LEGACY_KEY); } catch {}
        if (cancelled) return;
        setProfile(seed);
      } else {
        setProfile(INIT);
      }
      setHydrated(true);
    })();

    return () => { cancelled = true; };
  }, [user, authLoading]);

  const save = useCallback(async (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    if (user) {
      const { error } = await supabase
        .from("user_profile_prefs")
        .upsert({
          user_id: user.id,
          nome: next.nome || null,
          objetivo: next.objetivo,
          onboarded: next.onboarded,
        });
      if (error) {
        console.error("save profile prefs", error);
        throw error;
      }
    }
    return next;
  }, [user, profile]);

  return { profile, hydrated, save };
}
