import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SessionUser, Role } from "@/lib/auth";

async function loadUser(authUser: { id: string; email?: string | null }): Promise<SessionUser | null> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authUser.id);
  const order: Role[] = ["admin", "officer", "citizen"];
  const role = (order.find((r) => roles?.some((x) => x.role === r)) || "citizen") as Role;

  let name = authUser.email?.split("@")[0] || "User";
  if (role === "officer") {
    const { data } = await supabase.from("officers").select("full_name").eq("id", authUser.id).maybeSingle();
    if (data?.full_name) name = data.full_name;
  } else {
    const { data } = await supabase.from("profiles").select("full_name").eq("id", authUser.id).maybeSingle();
    if (data?.full_name) name = data.full_name;
  }
  return { id: authUser.id, role, name, email: authUser.email || "" };
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        loadUser(session.user).then((u) => { if (isMounted) { setUser(u); setLoading(false); } });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}