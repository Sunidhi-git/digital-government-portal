import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user, loading } = useSession();
  const [form, setForm] = useState({ full_name: "", aadhaar: "", phone: "", dob: "", gender: "", address: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({
        full_name: data.full_name || "", aadhaar: data.aadhaar || "", phone: data.phone || "",
        dob: data.dob || "", gender: data.gender || "", address: data.address || "", email: data.email || user.email,
      });
      setLoaded(true);
    });
  }, [user]);

  if (loading) return <PortalLayout role="citizen"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) { window.location.href = "/login"; return null; }

  const save = async () => {
    if (!user) return;
    if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar.replace(/\s/g, ""))) return toast.error("Aadhaar must be exactly 12 digits");
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) return toast.error("Phone must be a valid 10-digit Indian mobile number");
    if (form.dob) {
      const d = new Date(form.dob);
      const today = new Date(); today.setHours(0,0,0,0);
      if (d > today) return toast.error("Date of birth cannot be in the future");
    }
    setSaving(true);
    const payload = {
      id: user.id,
      full_name: form.full_name || null,
      aadhaar: form.aadhaar || null,
      phone: form.phone || null,
      dob: form.dob || null,
      gender: form.gender || null,
      address: form.address || null,
      email: form.email || user.email,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated successfully");
  };

  return (
    <PortalLayout role="citizen">
      <PageHeader title="My Profile" subtitle="Update your personal details. These are pre-filled when applying for services." />
      <Card className="p-6 max-w-3xl">
        {!loaded ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full Name" value={form.full_name} onChange={(v) => set("full_name", v)} />
              <Field label="Aadhaar Number (12 digits)" value={form.aadhaar} onChange={(v) => set("aadhaar", v.replace(/\D/g,"").slice(0,12))} placeholder="XXXXXXXXXXXX" maxLength={12} />
              <Field label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
              <Field label="Phone (10 digits)" value={form.phone} onChange={(v) => set("phone", v.replace(/\D/g,"").slice(0,10))} placeholder="9876543210" maxLength={10} />
              <Field label="Date of Birth" value={form.dob} onChange={(v) => set("dob", v)} type="date" max={new Date().toISOString().split("T")[0]} />
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Gender</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address</Label>
              <Textarea rows={3} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House, street, city, state, pincode" />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={save} disabled={saving} className="gradient-primary text-white">
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save Changes
              </Button>
            </div>
          </div>
        )}
      </Card>
    </PortalLayout>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, max, maxLength }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} max={max} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}