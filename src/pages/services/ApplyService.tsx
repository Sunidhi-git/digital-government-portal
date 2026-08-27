import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ChevronLeft, FileText, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string; code: string; name: string; department: string; description: string;
  fee: number; processing_days: number; required_docs: string[];
}

export default function ApplyService() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, loading: authLoading } = useSession();
  const [service, setService] = useState<Service | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [appType, setAppType] = useState("fresh");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [agree, setAgree] = useState(true);
  const steps = ["Personal Details", "Service Details", "Documents", "Review & Pay"];

  useEffect(() => {
    if (!id) return;
    supabase.from("services").select("*").eq("code", id).maybeSingle().then(({ data }) => setService(data as any));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
  }, [user]);

  if (authLoading) return <PortalLayout role="citizen"><Card className="p-10 text-center">Checking authentication...</Card></PortalLayout>;
  if (!user) {
    nav("/login");
    return null;
  }
  if (!service) return <PortalLayout role="citizen"><Card className="p-10 text-center">Loading service...</Card></PortalLayout>;

  const submit = async () => {
    if (!agree) return toast.error("Please agree to the declaration");
    setSubmitting(true);
    const isPaid = service.fee === 0;

    // 1. create application
    const { data: app, error } = await supabase.from("applications").insert({
      citizen_id: user!.id,
      service_id: service.id,
      fee_amount: service.fee,
      form_data: { application_type: appType, reason },
      status: "submitted",
      is_paid: isPaid,
    }).select().single();
    if (error || !app) { setSubmitting(false); return toast.error(error?.message || "Failed"); }

    // 2. upload files
    for (const [docType, file] of Object.entries(files)) {
      if (!file) continue;
      const path = `${user!.id}/${app.id}/${docType.replace(/\s+/g, "_")}_${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
      if (upErr) { toast.error(`Upload failed: ${docType}`); continue; }
      await supabase.from("documents").insert({
        citizen_id: user!.id, application_id: app.id, doc_type: docType,
        file_name: file.name, storage_path: path, size_bytes: file.size, mime_type: file.type,
      });
    }

    // 3. payment (mock success)
    if (service.fee > 0) {
      await supabase.from("payments").insert({
        citizen_id: user!.id, application_id: app.id,
        amount: service.fee, method: "UPI", status: "success",
      });
      await supabase.from("applications").update({ is_paid: true }).eq("id", app.id);
    }

    setSubmitting(false);
    toast.success(`Application submitted! Reference: ${app.reference_no}`);
    nav("/applications");
  };

  return (
    <PortalLayout role="citizen">
      <Button variant="ghost" size="sm" asChild className="mb-2"><Link to="/services"><ChevronLeft className="h-4 w-4 mr-1" />All services</Link></Button>
      <PageHeader title={`Apply: ${service.name}`} subtitle={service.department} />

      <Card className="p-5 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold ${
                step > i + 1 ? "bg-success text-success-foreground" : step === i + 1 ? "gradient-primary text-white" : "bg-secondary text-muted-foreground"
              }`}>
                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 space-y-4">
          {step === 1 && (
            <>
              <h3 className="font-display font-semibold text-lg">Personal Details</h3>
              <p className="text-xs text-muted-foreground">From your registered profile</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <RO label="Full Name" v={profile?.full_name || user?.name} />
                <RO label="Aadhaar" v={profile?.aadhaar || "—"} />
                <RO label="Email" v={user?.email} />
                <RO label="Phone" v={profile?.phone || "—"} />
                <RO label="DOB" v={profile?.dob || "—"} />
                <RO label="Gender" v={profile?.gender || "—"} />
              </div>
              <RO label="Address" v={profile?.address || "—"} />
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-display font-semibold text-lg">Service Specific Details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Application Type</Label>
                  <Select value={appType} onValueChange={setAppType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh">Fresh Application</SelectItem>
                      <SelectItem value="renewal">Renewal</SelectItem>
                      <SelectItem value="reissue">Re-issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reason / Purpose</Label>
                <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly state the purpose..." />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="font-display font-semibold text-lg">Document Upload</h3>
              <p className="text-xs text-muted-foreground">Upload PDF / JPG / PNG (max 5 MB each)</p>
              <div className="space-y-2">
                {service.required_docs.map((d) => (
                  <div key={d} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><FileText className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{d}</p>
                        <p className="text-xs text-muted-foreground truncate">{files[d]?.name || "Not uploaded"}</p>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          if (f.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
                          setFiles((p) => ({ ...p, [d]: f }));
                        }} />
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-input text-xs font-medium hover:bg-secondary">
                        <Upload className="h-3.5 w-3.5" />{files[d] ? "Change" : "Upload"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="font-display font-semibold text-lg">Review & Submit</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["Service", service.name],
                  ["Department", service.department],
                  ["Government Fee", `₹${service.fee.toLocaleString("en-IN")}`],
                  ["Processing Time", `${service.processing_days} days`],
                  ["Documents Uploaded", `${Object.values(files).filter(Boolean).length} of ${service.required_docs.length}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between p-3 rounded-lg bg-secondary/40">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border p-4 bg-primary/5">
                <p className="text-sm font-semibold mb-1">Payment</p>
                <p className="text-xs text-muted-foreground">A mock payment of ₹{service.fee.toLocaleString("en-IN")} will be processed via secure UPI gateway on submit.</p>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Checkbox id="t" checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
                <Label htmlFor="t" className="text-xs text-muted-foreground leading-relaxed">I declare that all information provided is true and accurate. I understand that providing false information is punishable under law.</Label>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" disabled={step === 1 || submitting} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 4 ? (
              <Button className="gradient-primary text-white" onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button className="bg-success hover:bg-success/90 text-success-foreground" disabled={submitting} onClick={submit}>
                {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Pay ₹{service.fee} & Submit
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6 h-fit sticky top-24">
          <h4 className="font-display font-semibold mb-3">Service Summary</h4>
          <div className="space-y-3 text-sm">
            <Row k="Government Fee" v={`₹${service.fee.toLocaleString("en-IN")}`} />
            <Row k="Processing Time" v={`${service.processing_days} days`} />
            <Row k="Documents Required" v={`${service.required_docs.length}`} />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Required Documents</p>
            <div className="flex flex-wrap gap-1">
              {service.required_docs.map((d) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
            </div>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
function RO({ label, v }: { label: string; v: any }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <Input readOnly value={v || ""} className="bg-secondary/50" />
    </div>
  );
}
