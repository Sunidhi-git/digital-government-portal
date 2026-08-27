import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Wallet, MessageSquareWarning, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default function CitizenDashboard() {
  const { user, loading } = useSession();
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [pays, setPays] = useState<any[]>([]);
  const [openComplaints, setOpenComplaints] = useState(0);

  useEffect(() => {
    if (!loading && !user) nav("/login");
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("applications").select("id,reference_no,status,created_at,fee_amount,services(name)").eq("citizen_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }) => setApps((data as any) || []));
    supabase.from("payments").select("*").eq("citizen_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }) => setPays(data || []));
    supabase.from("complaints").select("id", { count: "exact", head: true }).eq("citizen_id", user.id).neq("status", "closed").then(({ count }) => setOpenComplaints(count || 0));
  }, [user]);

  if (loading) return <PortalLayout role="citizen"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) return null;

  const formatDate = (value: string | undefined | null) => {
    if (!value) return "Not added";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN");
  };

  const fields = [profile?.full_name, profile?.aadhaar, profile?.dob, profile?.gender, profile?.email || user.email, profile?.phone, profile?.address];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  const totalPaid = pays.filter((p) => p.status === "success").reduce((s, p) => s + Number(p.amount), 0);
  const pending = apps.filter((a) => a.status === "submitted" || a.status === "under_review" || a.status === "more_info").length;

  const name = profile?.full_name || user.name;

  return (
    <PortalLayout role="citizen">
      <PageHeader
        title={`Namaste, ${name.split(" ")[0]} 👋`}
        subtitle="Here's what's happening with your government services."
        action={
          <Button asChild className="gradient-primary text-white"><Link to="/services">Apply for Service <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <Card className="lg:col-span-1 p-6 relative overflow-hidden gradient-primary text-white border-0">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-14 w-14 ring-2 ring-white/30">
                <AvatarFallback className="bg-white/15 text-white text-lg font-semibold">
                  {name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display font-bold text-lg">{name}</p>
                <Badge className="bg-success text-success-foreground border-0 text-[10px] mt-0.5"><ShieldCheck className="h-3 w-3 mr-1" />Citizen Verified</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Row k="Aadhaar" v={profile?.aadhaar || "Not added"} />
              <Row k="Email" v={profile?.email || user.email} />
              <Row k="Phone" v={profile?.phone || "Not added"} />
              <Row k="DOB" v={formatDate(profile?.dob)} />
            </div>
            <div className="mt-5 pt-4 border-t border-white/15">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-white/80">Profile Completeness</p>
                <p className="text-xs font-semibold">{completeness}%</p>
              </div>
              <Progress value={completeness} className="h-1.5 bg-white/15" />
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard label="Total Applications" value={String(apps.length)} icon={FileText} tone="primary" />
          <StatCard label="Pending Actions" value={String(pending)} icon={Activity} tone="warning" />
          <StatCard label="Total Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} icon={Wallet} tone="success" />
          <StatCard label="Open Complaints" value={String(openComplaints)} icon={MessageSquareWarning} tone="accent" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Recent Applications</h3>
            <Link to="/applications" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {apps.length === 0 ? (
            <Empty msg="No applications yet" cta="Apply for a service" to="/services" />
          ) : (
            <div className="space-y-3">
              {apps.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-smooth">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.services?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{a.reference_no}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Recent Payments</h3>
            <Link to="/payments" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {pays.length === 0 ? (
            <Empty msg="No payments yet" />
          ) : (
            <div className="space-y-3">
              {pays.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.method} payment</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.txn_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹{Number(p.amount).toLocaleString("en-IN")}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/70">{k}</span>
      <span className="font-medium font-mono truncate max-w-[60%] text-right">{v}</span>
    </div>
  );
}
function Empty({ msg, cta, to }: { msg: string; cta?: string; to?: string }) {
  return (
    <div className="text-center py-10 border border-dashed border-border rounded-lg">
      <p className="text-sm text-muted-foreground">{msg}</p>
      {cta && to && <Button asChild size="sm" variant="link" className="mt-1"><Link to={to}>{cta}</Link></Button>}
    </div>
  );
}
