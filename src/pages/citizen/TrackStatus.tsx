import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, FileSearch, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";

export default function TrackStatus() {
  const { user, loading: authLoading } = useSession();
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") || "");
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ref) return;
    setLoading(true);
    const { data, error } = await supabase.from("applications")
      .select("*,services(name,department,processing_days),officers:officer_id(full_name,department)")
      .eq("reference_no", ref).maybeSingle();
    setLoading(false);
    if (error || !data) return toast.error("Application not found");
    setApp(data);
  };

  useEffect(() => { if (params.get("ref")) search(); }, []);

  const Body = (
    <>
      <PageHeader title="Track Application Status" subtitle="Get real-time updates on your government applications." />

      <Card className="p-6 mb-6">
        <form className="flex gap-2" onSubmit={search}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="e.g. BS-2026-123456" value={ref} onChange={(e) => setRef(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="gradient-primary text-white">{loading ? "..." : "Track"}</Button>
        </form>
      </Card>

      {app && (
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-muted-foreground">Application Reference</p>
                <p className="font-mono font-semibold text-lg">{app.reference_no}</p>
                <p className="text-sm text-muted-foreground">{app.services?.name}</p>
              </div>
              <Badge className={
                app.status === "approved" ? "bg-success/10 text-success border-success/30 border" :
                app.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/30 border" :
                "bg-primary/10 text-primary border-primary/30 border"
              }>{app.status}</Badge>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
              <Step active={true} done={true} t="Application Submitted" d={new Date(app.created_at).toLocaleString("en-IN")} desc={`Application ${app.reference_no} received.`} />
              <Step active={app.status !== "submitted"} done={["under_review","approved","rejected","more_info"].includes(app.status)} t="Under Review" d={app.officer_id ? "Assigned to officer" : "Awaiting assignment"} desc="Officer is reviewing the application and documents." />
              <Step active={app.status === "approved" || app.status === "rejected"} done={app.status === "approved" || app.status === "rejected"} t={app.status === "rejected" ? "Rejected" : "Approved"} d={app.status === "approved" || app.status === "rejected" ? new Date(app.updated_at).toLocaleString("en-IN") : "Pending"} desc={app.remarks || "Decision pending"} />
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <h4 className="font-display font-semibold mb-3">Officer Remarks</h4>
              {app.remarks ? (
                <div className="text-sm border-l-2 border-primary pl-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><MessageSquare className="h-3 w-3" />{app.officers?.full_name || "Officer"}</div>
                  <p className="mt-1">{app.remarks}</p>
                </div>
              ) : <p className="text-sm text-muted-foreground">No remarks yet.</p>}
            </Card>

            <Card className="p-6">
              <h4 className="font-display font-semibold mb-3">Quick Info</h4>
              <div className="space-y-2 text-sm">
                <Row k="Department" v={app.services?.department} />
                <Row k="Officer" v={app.officers?.full_name || "Unassigned"} />
                <Row k="Submitted" v={new Date(app.created_at).toLocaleDateString("en-IN")} />
                <Row k="Fees Paid" v={app.is_paid ? `₹${Number(app.fee_amount).toLocaleString("en-IN")}` : "Pending"} />
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );

  return user ? <PortalLayout role={user.role}>{Body}</PortalLayout> : <PublicLayout><div className="container py-10">{Body}</div></PublicLayout>;
}

function Step({ active, done, t, d, desc }: any) {
  const Icon = done ? CheckCircle2 : active ? FileSearch : Clock;
  return (
    <div className="relative pb-6 last:pb-0">
      <div className={`absolute -left-[18px] h-5 w-5 rounded-full grid place-items-center ${
        done ? "bg-success text-success-foreground" :
        active ? "gradient-primary text-white animate-pulse-glow" : "bg-secondary text-muted-foreground"
      }`}>
        <Icon className="h-3 w-3" />
      </div>
      <p className="font-semibold">{t}</p>
      <p className="text-xs text-muted-foreground">{d}</p>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}
function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v || "—"}</span></div>;
}
