import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

export default function Complaints() {
  const { user, loading } = useSession();
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ category: "Service Delay", priority: "medium", subject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("complaints").select("*").eq("citizen_id", user.id).order("created_at", { ascending: false });
    setList(data || []);
  };
  useEffect(() => { load(); }, [user]);

  if (loading) return <PortalLayout role="citizen"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description) return toast.error("Fill subject and description");
    setSubmitting(true);
    const { data, error } = await supabase.from("complaints").insert({
      citizen_id: user!.id, ...form,
    }).select().single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(`Complaint registered: ${data.reference_no}`);
    setForm({ category: "Service Delay", priority: "medium", subject: "", description: "" });
    load();
  };

  return (
    <PortalLayout role="citizen">
      <PageHeader title="Complaints & Grievances" subtitle="Lodge a complaint and track its resolution end-to-end." />

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-display font-semibold text-lg mb-1">File a New Complaint</h3>
          <p className="text-xs text-muted-foreground mb-5">Average resolution time: 7 working days</p>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Service Delay", "Document Issue", "Officer Behaviour", "Payment Issue", "Corruption", "Other"].map((c) =>
                      <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide a detailed description..." />
            </div>
            <Button type="submit" disabled={submitting} className="gradient-primary text-white">
              <MessageSquareWarning className="h-4 w-4 mr-1" />{submitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Previous Complaints</h3>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No complaints filed yet.</p>
          ) : (
            <div className="space-y-3">
              {list.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-border hover:bg-secondary/40 transition-smooth">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-mono font-medium">{c.reference_no}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm font-medium truncate">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">{c.category}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{new Date(c.created_at).toLocaleDateString("en-IN")}</span>
                    <Badge variant="outline" className={
                      c.priority === "high" || c.priority === "critical" ? "border-destructive/40 text-destructive" :
                      c.priority === "medium" ? "border-warning/40 text-warning" : "border-border"
                    }>{c.priority}</Badge>
                  </div>
                  {c.response && <p className="mt-2 text-xs p-2 bg-secondary/60 rounded">Response: {c.response}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
}
