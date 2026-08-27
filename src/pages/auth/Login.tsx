import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter email and password");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoading(false); return toast.error(error.message); }
    // route by role
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user!.id);
    const has = (r: string) => roles?.some((x) => x.role === r);
    toast.success("Welcome back");
    nav(has("admin") ? "/admin" : has("officer") ? "/officer" : "/citizen");
  };

  return (
    <AuthShell title="Welcome back, Citizen" subtitle="Sign in to access your services and applications." badge="Citizen Login">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold h-11">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          New citizen? <Link to="/register" className="text-primary font-medium hover:underline">Create account</Link>
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <Link to="/officer-login" className="text-xs text-center text-muted-foreground hover:text-primary py-2">Officer Login →</Link>
          <Link to="/admin-login" className="text-xs text-center text-muted-foreground hover:text-primary py-2">Admin Login →</Link>
        </div>
      </form>
    </AuthShell>
  );
}
