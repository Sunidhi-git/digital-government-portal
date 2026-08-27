import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

function Toolbar({ value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9" />
      </div>
    </div>
  );
}

export function ManageCitizens() {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setList(data || [])); }, []);
  const f = list.filter((c) => (c.full_name || "").toLowerCase().includes(q.toLowerCase()) || (c.email || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <PortalLayout role="admin">
      <PageHeader title="Manage Citizens" subtitle="All registered citizens." />
      <Card className="p-6">
        <Toolbar value={q} onChange={setQ} placeholder="Search by name or email..." />
        {f.length === 0 ? <p className="text-center py-12 text-sm text-muted-foreground">No citizens registered yet.</p> : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[700px]">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3">Name</th><th className="py-3">Email</th><th className="py-3">Aadhaar</th><th className="py-3">Phone</th><th className="py-3">Joined</th>
              </tr></thead>
              <tbody>
                {f.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="py-3 font-medium">{c.full_name || "—"}</td>
                    <td className="py-3 text-muted-foreground">{c.email}</td>
                    <td className="py-3 font-mono text-xs">{c.aadhaar || "—"}</td>
                    <td className="py-3 text-muted-foreground">{c.phone || "—"}</td>
                    <td className="py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
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

export function ManageOfficers() {
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", department: "", region: "", designation: "" });
  const [busy, setBusy] = useState(false);
  const load = () => supabase.from("officers").select("*").order("created_at", { ascending: false }).then(({ data }) => setList(data || []));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ full_name: "", email: "", password: "", department: "", region: "", designation: "" }); setOpen(true); };
  const openEdit = (o: any) => { setEditing(o); setForm({ full_name: o.full_name, email: o.email, password: "", department: o.department, region: o.region || "", designation: o.designation || "" }); setOpen(true); };

  const save = async () => {
    setBusy(true);
    if (editing) {
      const { error } = await supabase.functions.invoke("admin-create-officer", { body: { action: "update", officer_id: editing.id, full_name: form.full_name, department: form.department, region: form.region, designation: form.designation } });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Officer updated");
    } else {
      if (!form.email || !form.password || !form.full_name || !form.department) { setBusy(false); return toast.error("Fill required fields"); }
      if (form.password.length < 8) { setBusy(false); return toast.error("Password min 8 chars"); }
      const { data, error } = await supabase.functions.invoke("admin-create-officer", { body: { action: "create", ...form } });
      setBusy(false);
      if (error || (data as any)?.error) return toast.error(error?.message || (data as any)?.error);
      toast.success("Officer created");
    }
    setOpen(false); load();
  };

  const toggleActive = async (o: any) => {
    const { error } = await supabase.functions.invoke("admin-create-officer", { body: { action: "update", officer_id: o.id, is_active: !o.is_active } });
    if (error) return toast.error(error.message);
    toast.success(o.is_active ? "Deactivated" : "Activated"); load();
  };

  const remove = async (o: any) => {
    if (!confirm(`Delete officer ${o.full_name}? This removes their account.`)) return;
    const { error } = await supabase.functions.invoke("admin-create-officer", { body: { action: "delete", officer_id: o.id } });
    if (error) return toast.error(error.message);
    toast.success("Officer removed"); load();
  };

  return (
    <PortalLayout role="admin">
      <PageHeader title="Manage Officers" subtitle="Create, assign, and manage department officers." />
      <Card className="p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={openCreate} className="gradient-primary text-white"><Plus className="h-4 w-4 mr-1" />Add Officer</Button>
        </div>
        {list.length === 0 ? <p className="text-center py-12 text-sm text-muted-foreground">No officers yet. Click "Add Officer" to create one.</p> : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[700px]">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3">Name</th><th className="py-3">Email</th><th className="py-3">Department</th><th className="py-3">Region</th><th className="py-3">Status</th><th className="py-3 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="py-3 font-medium">{o.full_name}</td>
                    <td className="py-3 text-muted-foreground">{o.email}</td>
                    <td className="py-3 text-muted-foreground">{o.department}</td>
                    <td className="py-3"><Badge variant="outline">{o.region || "—"}</Badge></td>
                    <td className="py-3"><Badge className={o.is_active ? "bg-success/10 text-success border-success/30 border" : "bg-muted text-muted-foreground"}>{o.is_active ? "Active" : "Inactive"}</Badge></td>
                    <td className="py-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(o)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => toggleActive(o)}>{o.is_active ? "Deactivate" : "Activate"}</Button>
                      <Button size="sm" variant="outline" onClick={() => remove(o)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Officer" : "Add Officer"}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><label className="text-xs font-semibold">Full Name *</label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold">Email *</label>
              <Input type="email" value={form.email} disabled={!!editing} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            {!editing && (
              <div className="space-y-1.5 sm:col-span-2"><label className="text-xs font-semibold">Password * (min 8)</label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            )}
            <div className="space-y-1.5 sm:col-span-2"><label className="text-xs font-semibold">Department *</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                <option value="Ministry of External Affairs">Ministry of External Affairs</option>
                <option value="Ministry of Road Transport">Ministry of Road Transport</option>
                <option value="Revenue Department">Revenue Department</option>
                <option value="Municipal Corporation">Municipal Corporation</option>
                <option value="Income Tax Department">Income Tax Department</option>
                <option value="Election Commission">Election Commission</option>
                <option value="Social Welfare Department">Social Welfare Department</option>
                <option value="Municipal Water Board">Municipal Water Board</option>
                <option value="Electricity Board">Electricity Board</option>
                <option value="Registrar Office">Registrar Office</option>
              </select></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold">Region</label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold">Designation</label>
              <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={save} disabled={busy} className="gradient-primary text-white">{busy ? "Saving..." : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

export function ManageServices() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { supabase.from("services").select("*").order("name").then(({ data }) => setList(data || [])); }, []);
  return (
    <PortalLayout role="admin">
      <PageHeader title="Manage Services" subtitle="Government services catalog." />
      <Card className="p-6">
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-border flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.department} · ₹{s.fee} · {s.processing_days} days</p>
              </div>
              <Badge className={s.is_active ? "bg-success/10 text-success border-success/30 border" : "bg-muted"}>{s.is_active ? "Active" : "Inactive"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </PortalLayout>
  );
}

export function ManageComplaints() {
  const [list, setList] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [resp, setResp] = useState("");
  const [status, setStatus] = useState("in_progress");
  const load = () => supabase.from("complaints").select("*,profiles:citizen_id(full_name,email)").order("created_at", { ascending: false }).then(({ data }) => setList((data as any) || []));
  useEffect(() => { load(); }, []);
  const update = async () => {
    await supabase.from("complaints").update({ response: resp, status: status as any }).eq("id", active.id);
    toast.success("Updated"); setActive(null); load();
  };
  return (
    <PortalLayout role="admin">
      <PageHeader title="Complaints Management" subtitle="National grievance dashboard." />
      <Card className="p-6">
        {list.length === 0 ? <p className="text-center py-12 text-sm text-muted-foreground">No complaints filed yet.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="py-3">Reference</th><th className="py-3">Citizen</th><th className="py-3">Category</th><th className="py-3">Priority</th><th className="py-3">Status</th><th className="py-3 text-right"></th>
            </tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="py-3 font-mono text-xs">{c.reference_no}</td>
                  <td className="py-3 font-medium">{c.profiles?.full_name || "—"}</td>
                  <td className="py-3">{c.category}</td>
                  <td className="py-3"><Badge variant="outline">{c.priority}</Badge></td>
                  <td className="py-3"><StatusBadge status={c.status} /></td>
                  <td className="py-3 text-right"><Button size="sm" variant="outline" onClick={() => { setActive(c); setResp(c.response || ""); setStatus(c.status); }}>Respond</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent>
          {active && (<>
            <DialogHeader><DialogTitle>{active.reference_no} · {active.subject}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{active.description}</p>
            <Textarea rows={4} value={resp} onChange={(e) => setResp(e.target.value)} placeholder="Your response..." />
            <div className="flex gap-2">
              {["open","in_progress","resolved","closed"].map((st) => (
                <Button key={st} size="sm" variant={status === st ? "default" : "outline"} onClick={() => setStatus(st)}>{st}</Button>
              ))}
            </div>
            <DialogFooter><Button onClick={update} className="gradient-primary text-white">Save</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

export function Reports() {
  const [s, setS] = useState({ apps: 0, paid: 0, revenue: 0, complaints: 0, resolved: 0 });
  useEffect(() => {
    (async () => {
      const [a, p, c] = await Promise.all([
        supabase.from("applications").select("is_paid"),
        supabase.from("payments").select("amount,status"),
        supabase.from("complaints").select("status"),
      ]);
      setS({
        apps: a.data?.length || 0,
        paid: a.data?.filter((x: any) => x.is_paid).length || 0,
        revenue: (p.data || []).filter((x) => x.status === "success").reduce((sum, x) => sum + Number(x.amount), 0),
        complaints: c.data?.length || 0,
        resolved: c.data?.filter((x: any) => x.status === "resolved" || x.status === "closed").length || 0,
      });
    })();
  }, []);
  return (
    <PortalLayout role="admin">
      <PageHeader title="Reports & Analytics" subtitle="Live insights across all departments." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["Total Applications", s.apps],
          ["Paid Applications", s.paid],
          ["Total Revenue", `₹${s.revenue.toLocaleString("en-IN")}`],
          ["Total Complaints", s.complaints],
          ["Resolved Complaints", s.resolved],
        ].map(([l, v]) => (
          <Card key={l as string} className="p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p>
            <p className="font-display font-bold text-3xl mt-2">{v}</p>
          </Card>
        ))}
      </div>
    </PortalLayout>
  );
}

export function AdminSettings() {
  return (
    <PortalLayout role="admin">
      <PageHeader title="System Settings" subtitle="Platform-wide configuration." />
      <div className="grid lg:grid-cols-2 gap-5">
        {[
          { t: "Authentication", d: "Email/password authentication is active." },
          { t: "Database", d: "PostgreSQL with row-level security." },
          { t: "Storage", d: "Encrypted document storage bucket configured." },
          { t: "Roles", d: "Citizen, Officer, Admin — managed in user_roles table." },
        ].map((c) => (
          <Card key={c.t} className="p-6">
            <h3 className="font-display font-semibold text-lg">{c.t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
          </Card>
        ))}
      </div>
    </PortalLayout>
  );
}

// Officer extra pages — link back to main dashboard
export function OfficerQueuePage() {
  return <PortalLayout role="officer"><PageHeader title="Application Queue" subtitle="Use the dashboard to review and act on applications." /><Card className="p-6"><p className="text-sm text-muted-foreground">All pending applications appear in your dashboard.</p></Card></PortalLayout>;
}
export function OfficerVerify() {
  return <PortalLayout role="officer"><PageHeader title="Document Verification" subtitle="Open an application from the dashboard to view and verify its documents." /><Card className="p-6"><p className="text-sm text-muted-foreground">Document verification is integrated into the application review modal.</p></Card></PortalLayout>;
}
export function OfficerCitizens() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50).then(({ data }) => setList(data || [])); }, []);
  return (
    <PortalLayout role="officer">
      <PageHeader title="Citizen Records" subtitle="Browse registered citizens (read-only)." />
      <Card className="p-6">
        {list.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">No citizens yet.</p> : (
          <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
            <th className="py-3">Name</th><th className="py-3">Email</th><th className="py-3">Phone</th>
          </tr></thead>
          <tbody>{list.map((c) => (
            <tr key={c.id} className="border-b border-border hover:bg-secondary/40"><td className="py-3">{c.full_name}</td><td className="py-3 text-muted-foreground">{c.email}</td><td className="py-3 text-muted-foreground">{c.phone || "—"}</td></tr>
          ))}</tbody></table>
        )}
      </Card>
    </PortalLayout>
  );
}
export function OfficerAnalytics() {
  return <PortalLayout role="officer"><PageHeader title="Department Analytics" subtitle="Performance overview." /><Card className="p-6"><p className="text-sm text-muted-foreground">Detailed department analytics coming soon. View live counts on your dashboard.</p></Card></PortalLayout>;
}
