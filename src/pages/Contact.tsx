import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  return (
    <PublicLayout>
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="container relative py-16 text-center">
          <Badge className="bg-white/10 border-white/20 text-white">Contact</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-bold mt-3">We're here to help</h1>
          <p className="text-white/80 max-w-xl mx-auto mt-3">24×7 helpdesk across 22 official languages.</p>
        </div>
      </section>

      <section className="container py-16 grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8">
          <h2 className="font-display text-2xl font-bold mb-1">Send us a message</h2>
          <p className="text-sm text-muted-foreground mb-6">Our team typically replies within 24 hours.</p>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Message sent! Reference ID: BS-MSG-92013"); }}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Full Name</Label><Input placeholder="Your name" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Email</Label><Input type="email" placeholder="you@example.com" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Phone</Label><Input placeholder="+91" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold">Subject</Label><Input placeholder="Application help" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-semibold">Message</Label><Textarea rows={5} placeholder="Tell us how we can help..." /></div>
            <Button type="submit" className="gradient-primary text-white font-semibold">Send Message</Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-6"><Phone className="h-7 w-7 text-primary mb-2" /><p className="font-semibold">Toll-free Helpdesk</p><p className="text-sm text-muted-foreground">1800-XXX-1947</p><p className="text-xs text-muted-foreground mt-1">24×7 · 22 languages</p></Card>
          <Card className="p-6"><Mail className="h-7 w-7 text-primary mb-2" /><p className="font-semibold">Email Support</p><p className="text-sm text-muted-foreground">support@bharatsewa.gov.in</p></Card>
          <Card className="p-6"><MapPin className="h-7 w-7 text-primary mb-2" /><p className="font-semibold">Head Office</p><p className="text-sm text-muted-foreground">Electronics Niketan,<br/>6 CGO Complex, New Delhi - 110003</p></Card>
          <Card className="p-6 border-destructive/40 bg-destructive/5"><AlertTriangle className="h-7 w-7 text-destructive mb-2" /><p className="font-semibold text-destructive">Emergency Support</p><p className="text-sm text-muted-foreground">112 (National Emergency)</p><p className="text-sm text-muted-foreground">1930 (Cybercrime)</p></Card>
          <Card className="p-6"><Clock className="h-7 w-7 text-primary mb-2" /><p className="font-semibold">Office Hours</p><p className="text-sm text-muted-foreground">Mon-Sat · 9:00 AM – 6:00 PM IST</p></Card>
        </div>
      </section>
    </PublicLayout>
  );
}