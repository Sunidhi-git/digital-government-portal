import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function OfficerLogin() {
  const nav = useNavigate();
  const [login, setLogin] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.email || !login.password) return toast.error("Please enter email and password");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: login.email, password: login.password });
      if (error) { setLoading(false); return toast.error(error.message); }

      // Existing officer accounts may still have the default citizen role.
      // If an officer record exists for this user, safely promote before checking access.
      await supabase.rpc.invoke("promote_self_to_officer").catch(() => {});

      const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", data.user!.id);
      if (roleError) throw roleError;
      setLoading(false);
      if (!roles?.some((r) => r.role === "officer")) {
        await supabase.auth.signOut();
        return toast.error("This account is not an officer. Use the citizen login.");
      }
      toast.success("Authenticated as Officer");
      nav("/officer");
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || "Login failed");
    }
  };

  return (
    <AuthShell title="Government Officer Sign-In" subtitle="Restricted access. Accounts are issued by the Administrator only." badge="Officer Portal">
      <form onSubmit={doLogin} className="space-y-4 pt-3">
        <div className="space-y-1.5"><Label className="text-xs font-semibold">Email</Label>
          <Input type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required /></div>
        <div className="space-y-1.5"><Label className="text-xs font-semibold">Password</Label>
          <Input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required /></div>
        <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold h-11">
          {loading ? "Signing in..." : "Secure Sign In"}
        </Button>
      </form>
      <p className="text-xs text-center text-muted-foreground pt-4">
        Officer accounts cannot be self-registered. Contact your Administrator to request access.
      </p>
      <p className="text-sm text-center text-muted-foreground pt-2">
        <Link to="/login" className="text-primary font-medium hover:underline">← Back to Citizen Login</Link>
      </p>
    </AuthShell>
  );
}
