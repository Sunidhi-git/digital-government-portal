import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCog, Building2, Wallet, MessageSquareWarning } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { StatusBadge } from "@/components/portal/StatusBadge";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function AdminDashboard() {
  const { user, loading } = useSession();
  const [s, setS] = useState({ citizens: 0, officers: 0, apps: 0, revenue: 0, complaints: 0 });
  const [byService, setByService] = useState<any[]>([]);
  const [byStatus, setByStatus] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [c, o, a, p, cm, r] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "citizen"),
        supabase.from("officers").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("status,services(name)"),
        supabase.from("payments").select("amount,status"),
        supabase.from("complaints").select("*", { count: "exact", head: true }),
        supabase.from("applications")
          .select("id,reference_no,status,created_at,is_paid,fee_amount,services(name,department),profiles:citizen_id(full_name,email),officers:officer_id(full_name)")
          .order("created_at", { ascending: false }).limit(15),
      ]);
      setRecent((r.data as any) || []);
      const apps = (a.data as any) || [];
      const revenue = (p.data || []).filter((x) => x.status === "success").reduce((sum, x) => sum + Number(x.amount), 0);
      setS({ citizens: c.count || 0, officers: o.count || 0, apps: apps.length, revenue, complaints: cm.count || 0 });

      const byS: Record<string, number> = {};
      apps.forEach((x: any) => { const n = x.services?.name || "Unknown"; byS[n] = (byS[n] || 0) + 1; });
      setByService(Object.entries(byS).map(([name, value]) => ({ name, value })));

      const byT: Record<string, number> = {};
      apps.forEach((x: any) => { byT[x.status] = (byT[x.status] || 0) + 1; });
      setByStatus(Object.entries(byT).map(([name, value]) => ({ name, value })));
    })();
  }, []);

  if (loading) return <PortalLayout role="admin"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) return null;

  return (
    <PortalLayout role="admin">
      <PageHeader title="Administrator Console" subtitle="National overview · All departments" action={<Badge className="bg-accent/10 text-accent border-accent/30 border">Super Admin</Badge>} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Citizens" value={String(s.citizens)} icon={Users} tone="primary" />
        <StatCard label="Active Officers" value={String(s.officers)} icon={UserCog} tone="accent" />
        <StatCard label="Applications" value={String(s.apps)} icon={Building2} tone="success" />
        <StatCard label="Revenue Collected" value={`₹${s.revenue.toLocaleString("en-IN")}`} icon={Wallet} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-display font-semibold text-lg mb-1">Applications by Service</h3>
          <p className="text-xs text-muted-foreground mb-3">Live counts</p>
          <div className="h-72">
            {byService.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">No application data yet.</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={byService}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-1">Status Distribution</h3>
          <p className="text-xs text-muted-foreground mb-3">All applications</p>
          <div className="h-56">
            {byStatus.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">No data yet.</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-1.5 text-xs mt-3">
            {byStatus.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{d.name}</span>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-lg mb-1 flex items-center gap-2"><MessageSquareWarning className="h-4 w-4 text-accent" />Total Complaints</h3>
        <p className="text-3xl font-display font-bold mt-2">{s.complaints}</p>
      </Card>

      <Card className="p-6 mt-6">
        <h3 className="font-display font-semibold text-lg mb-4">Recent Applications</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No applications yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3">Reference</th><th className="py-3">Citizen</th><th className="py-3">Service</th>
                  <th className="py-3">Department</th><th className="py-3">Officer</th><th className="py-3">Paid</th>
                  <th className="py-3">Status</th><th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="py-3 font-mono text-xs">{a.reference_no}</td>
                    <td className="py-3 font-medium">{a.profiles?.full_name || "—"}</td>
                    <td className="py-3 text-muted-foreground">{a.services?.name}</td>
                    <td className="py-3 text-muted-foreground">{a.services?.department}</td>
                    <td className="py-3 text-muted-foreground">{a.officers?.full_name || "Unassigned"}</td>
                    <td className="py-3">{a.is_paid ? <Badge className="bg-success/10 text-success border-success/30 border">₹{Number(a.fee_amount).toLocaleString("en-IN")}</Badge> : <Badge variant="outline">No</Badge>}</td>
                    <td className="py-3"><StatusBadge status={a.status} /></td>
                    <td className="py-3 text-muted-foreground text-xs">{new Date(a.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PortalLayout>
  );
}
