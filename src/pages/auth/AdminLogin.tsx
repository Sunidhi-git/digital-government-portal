import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminLogin() {
  const nav = useNavigate();
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: login.email, password: login.password });
    if (error) { setLoading(false); return toast.error(error.message); }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user!.id);
    setLoading(false);
    if (!roles?.some((r) => r.role === "admin")) {
      await supabase.auth.signOut();
      return toast.error("This account is not an administrator.");
    }
    toast.success("Admin authenticated");
    nav("/admin");
  };

  const doRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.name || !reg.email || reg.password.length < 8) return toast.error("Fill all fields, password ≥ 8");
    setLoading(true);
    // First admin bootstrap: only allowed if no admin exists yet
    const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
    if ((count || 0) > 0) {
      setLoading(false);
      return toast.error("An administrator already exists. Contact existing admin to be added.");
    }
    const { data, error } = await supabase.auth.signUp({
      email: reg.email, password: reg.password,
      options: { emailRedirectTo: `${window.location.origin}/admin`, data: { full_name: reg.name } },
    });
    if (error || !data.user) { setLoading(false); return toast.error(error?.message || "Sign up failed"); }
    const { error: bErr } = await supabase.rpc.invoke("bootstrap_admin");
    if (bErr) { setLoading(false); return toast.error(bErr.message); }
    setLoading(false);
    toast.success("Administrator account created");
    nav("/admin");
  };

  return (
    <AuthShell title="Administrator Console" subtitle="Highest privilege access. Audit-logged." badge="Admin Access">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Bootstrap Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={doLogin} className="space-y-4 pt-3">
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Admin Email</Label>
              <Input type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Password</Label>
              <Input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} required /></div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold h-11">
              {loading ? "Authenticating..." : "Authenticate"}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="register">
          <form onSubmit={doRegister} className="space-y-3 pt-3">
            <p className="text-xs text-muted-foreground">First-time setup only. Disabled once an admin exists.</p>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Full Name</Label>
              <Input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Email</Label>
              <Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Password (min 8)</Label>
              <Input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} /></div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold h-11">
              {loading ? "Creating..." : "Create Administrator"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      <p className="text-sm text-center text-muted-foreground pt-3">
        <Link to="/login" className="text-primary font-medium hover:underline">← Back to Citizen Login</Link>
      </p>
    </AuthShell>
  );
}
