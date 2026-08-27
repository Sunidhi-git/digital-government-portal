import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    aadhaar: "", name: "", dob: "", gender: "", email: "", phone: "", address: "", password: "", confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Please fill required fields");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar.replace(/\s/g, ""))) return toast.error("Aadhaar must be exactly 12 digits");
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) return toast.error("Phone must be a valid 10-digit Indian mobile number");
    if (form.dob) {
      const d = new Date(form.dob);
      const today = new Date(); today.setHours(0,0,0,0);
      if (d > today) return toast.error("Date of birth cannot be in the future");
      const age = (today.getTime() - d.getTime()) / (1000*60*60*24*365.25);
      if (age < 1 || age > 120) return toast.error("Please enter a valid date of birth");
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/citizen`,
        data: {
          full_name: form.name,
          phone: form.phone,
          aadhaar: form.aadhaar,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Registration successful! Welcome to Bharat Sewa.");
    nav("/citizen");
  };

  return (
    <AuthShell title="Create your citizen account" subtitle="Aadhaar-based registration. Takes less than 2 minutes." badge="Citizen Registration">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Aadhaar Number (12 digits)" placeholder="XXXXXXXXXXXX" value={form.aadhaar} onChange={(v: string) => set("aadhaar", v.replace(/\D/g,"").slice(0,12))} maxLength={12} />
          <Field label="Full Name *" placeholder="As per Aadhaar" value={form.name} onChange={(v: string) => set("name", v)} />
          <Field label="Date of Birth" type="date" value={form.dob} onChange={(v: string) => set("dob", v)} max={new Date().toISOString().split("T")[0]} />
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
          <Field label="Email *" type="email" placeholder="you@example.com" value={form.email} onChange={(v: string) => set("email", v)} />
          <Field label="Phone (10 digits)" placeholder="9876543210" value={form.phone} onChange={(v: string) => set("phone", v.replace(/\D/g,"").slice(0,10))} maxLength={10} />
        </div>
        <Field label="Address" placeholder="House, street, city, state, pincode" value={form.address} onChange={(v: string) => set("address", v)} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Password * (min 8 chars)" type="password" value={form.password} onChange={(v: string) => set("password", v)} />
          <Field label="Confirm Password *" type="password" value={form.confirm} onChange={(v: string) => set("confirm", v)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full gradient-primary text-white font-semibold h-11 shadow-md hover:opacity-95">
          {loading ? "Creating account..." : "Register & Continue"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, max, maxLength }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <Input type={type} placeholder={placeholder} value={value} max={max} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
