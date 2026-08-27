import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, FileSearch, Clock, Download } from "lucide-react";
import { toast } from "sonner";

export default function OfficerDashboard() {
  const { user, loading } = useSession();
  const [apps, setApps] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [active, setActive] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [remarks, setRemarks] = useState("");
  const [department, setDepartment] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    // Load officer's department
    const { data: off } = await supabase.from("officers").select("department").eq("id", user.id).maybeSingle();
    const dept = off?.department || null;
    setDepartment(dept);

    // Only paid applications or zero-fee services, scoped to officer's department
    let query = supabase.from("applications")
      .select("id,reference_no,status,created_at,remarks,form_data,fee_amount,is_paid,services!inner(name,department),profiles:citizen_id(full_name,email,phone)")
      .order("created_at", { ascending: false }).limit(100);
    if (dept) query = query.eq("services.department", dept);
    const { data } = await query;
    const arr = ((data as any) || []).filter((app: any) => app.is_paid || Number(app.fee_amount) === 0);
    setApps(arr);
    setStats({
      pending: arr.filter((a: any) => ["submitted", "under_review", "more_info"].includes(a.status)).length,
      approved: arr.filter((a: any) => a.status === "approved").length,
      rejected: arr.filter((a: any) => a.status === "rejected").length,
      total: arr.length,
    });
  };
  useEffect(() => { if (user) load(); }, [user]);

  const open = async (app: any) => {
    setActive(app); setRemarks(app.remarks || "");
    const { data } = await supabase.from("documents").select("*").eq("application_id", app.id);
    setDocs(data || []);
  };

  const decide = async (status: "approved" | "rejected" | "under_review") => {
    if (!active) return;
    const { error } = await supabase.from("applications").update({
      status, remarks, officer_id: user!.id,
    }).eq("id", active.id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    setActive(null); load();
  };

  const downloadDoc = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (loading) return <PortalLayout role="officer"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) return null;

  return (
    <PortalLayout role="officer">
      <PageHeader title="Officer Workspace" subtitle="Review applications, verify documents and take action." />
      {department && (
        <div className="mb-4 text-xs text-muted-foreground">
          Showing paid applications for <span className="font-semibold text-foreground">{department}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending" value={String(stats.pending)} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={String(stats.approved)} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={String(stats.rejected)} icon={XCircle} tone="destructive" />
        <StatCard label="Total Reviewed" value={String(stats.total)} icon={FileSearch} tone="primary" />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Application Queue</h3>
          <Badge variant="outline">{apps.length} total</Badge>
        </div>
        {apps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No applications in the system yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="py-3">Reference</th><th className="py-3">Citizen</th><th className="py-3">Service</th>
                  <th className="py-3">Submitted</th><th className="py-3">Paid</th><th className="py-3">Status</th><th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((q) => (
                  <tr key={q.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="py-3 font-mono text-xs">{q.reference_no}</td>
                    <td className="py-3 font-medium">{q.profiles?.full_name || "—"}</td>
                    <td className="py-3 text-muted-foreground">{q.services?.name}</td>
                    <td className="py-3 text-muted-foreground">{new Date(q.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="py-3">{q.is_paid ? <Badge className="bg-success/10 text-success border-success/30 border">Paid</Badge> : <Badge variant="outline">No</Badge>}</td>
                    <td className="py-3"><StatusBadge status={q.status} /></td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => open(q)}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader><DialogTitle>Review {active.reference_no}</DialogTitle></DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <Card className="p-4 bg-secondary/40 space-y-1 text-sm">
                  <Row k="Citizen" v={active.profiles?.full_name} />
                  <Row k="Email" v={active.profiles?.email} />
                  <Row k="Phone" v={active.profiles?.phone} />
                  <Row k="Service" v={active.services?.name} />
                  <Row k="Type" v={active.form_data?.application_type} />
                  <Row k="Reason" v={active.form_data?.reason} />
                </Card>
                <div>
                  <p className="text-sm font-semibold mb-2">Documents ({docs.length})</p>
                  {docs.length === 0 ? <p className="text-xs text-muted-foreground">No documents uploaded.</p> : (
                    <div className="space-y-2">
                      {docs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-2 rounded border border-border">
                          <div className="text-sm"><p className="font-medium">{d.doc_type}</p><p className="text-xs text-muted-foreground">{d.file_name}</p></div>
                          <Button size="sm" variant="ghost" onClick={() => downloadDoc(d.storage_path)}><Download className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Officer Remarks</p>
                  <Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add your remarks..." />
                </div>
              </div>
              <DialogFooter className="gap-2 flex-wrap">
                <Button variant="outline" onClick={() => decide("under_review")}>Mark Under Review</Button>
                <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => decide("rejected")}>Reject</Button>
                <Button className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => decide("approved")}>Approve</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v || "—"}</span></div>;
}
