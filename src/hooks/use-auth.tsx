import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // BYPASS: Immediately simulate a successful login for any user
    setSession({ access_token: "mock_token", refresh_token: "mock", expires_in: 999999, expires_at: 999999, token_type: "bearer", user: { id: "mock_user", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "" } });
    setProfile({ user_id: "mock_user", full_name: "Visitante", email: "visitante@teste.com", is_active: true });
    setRoles(["aluno"]);
    setLoading(false);
  }, []);

  const value: AuthState = {
    session: { access_token: "mock_token", refresh_token: "mock", expires_in: 999999, expires_at: 999999, token_type: "bearer", user: { id: "mock_user", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "" } },
    user: { id: "mock_user", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "" } as User,
    profile: { user_id: "mock_user", full_name: "Visitante", email: "visitante@teste.com", is_active: true },
    roles: ["aluno"],
    isAdmin: false,
    loading: false,
    signOut: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
