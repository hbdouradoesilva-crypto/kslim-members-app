import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: string[];
  isAdmin: boolean;
  hasPurchase: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setHasPurchase(false);
      return;
    }

    const [{ data: profileData }, { data: rolesData }, { data: purchaseData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, full_name, email, is_active")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("purchases").select("id").eq("user_id", user.id).limit(1),
    ]);

    setProfile(profileData ?? null);
    setRoles((rolesData ?? []).map((r) => r.role));
    setHasPurchase((purchaseData?.length ?? 0) > 0);
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadUserData(data.session?.user ?? null);
      if (active) setLoading(false);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadUserData(nextSession?.user ?? null);
    });

    void init();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserData]);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRoles([]);
    setHasPurchase(false);
    window.location.href = "/login";
  }

  const isAdmin = roles.includes("admin");
  const value: AuthState = {
    session,
    user: session?.user ?? null,
    profile,
    roles,
    isAdmin,
    hasPurchase: isAdmin || hasPurchase,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
