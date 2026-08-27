import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ShieldCheck, Clock, FileCheck2, Smartphone, Users2, Award,
  BookMarked, Car, Baby, ReceiptIndianRupee, Landmark, Home as HomeIcon,
  CheckCircle2, Star, Search, FileText, CreditCard,
} from "lucide-react";

const featured = [
  { icon: BookMarked, name: "Passport", desc: "Apply or renew", color: "text-blue-600" },
  { icon: Car, name: "Driving License", desc: "Learner / Permanent", color: "text-emerald-600" },
  { icon: Baby, name: "Birth Certificate", desc: "Issue & corrections", color: "text-rose-600" },
  { icon: ReceiptIndianRupee, name: "Income Certificate", desc: "Verified proof", color: "text-amber-600" },
  { icon: Landmark, name: "Property Tax", desc: "Pay online instantly", color: "text-violet-600" },
  { icon: HomeIcon, name: "Property Cert.", desc: "EC & ownership", color: "text-cyan-600" },
];

const stats = [
  { value: "Aadhaar", label: "Verified Identity" },
  { value: "End-to-end", label: "Encryption" },
  { value: "6+", label: "Live Services" },
  { value: "24×7", label: "Always Available" },
];

const benefits = [
  { icon: ShieldCheck, title: "Secure & Verified", desc: "Aadhaar-linked authentication with end-to-end encryption." },
  { icon: Clock, title: "Save Time", desc: "No queues. Apply, pay and track 24×7 from anywhere." },
  { icon: FileCheck2, title: "Paperless", desc: "Digital documents stored in your secure vault." },
  { icon: Smartphone, title: "Mobile First", desc: "Optimized for every device — phone, tablet, desktop." },
];

const steps = [
  { n: "01", icon: Users2, t: "Register", d: "Create your free citizen account using Aadhaar details." },
  { n: "02", icon: FileText, t: "Apply", d: "Choose a service and fill the digital application form." },
  { n: "03", icon: CreditCard, t: "Pay & Submit", d: "Pay government fees securely and submit your application." },
  { n: "04", icon: Search, t: "Track", d: "Track real-time status until approval and document delivery." },
];

const achievements = [
  { value: "Digital First", label: "Modern citizen experience" },
  { value: "ISO 27001", label: "Security ready architecture" },
  { value: "WCAG AA", label: "Accessibility focused" },
  { value: "Made in India", label: "Built for Bharat" },
];

export default function Index() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(28_95%_55%_/_0.25),_transparent_50%)]" />
        <div className="container relative py-20 lg:py-28 grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
            <Badge className="bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur">
              <Star className="h-3 w-3 mr-1 fill-accent text-accent" /> A new way to access government
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              One Portal.<br />
              <span className="bg-gradient-to-r from-accent to-orange-300 bg-clip-text text-transparent">
                Every Government Service.
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl leading-relaxed">
              Apply for passport, driving license, certificates, pay taxes and track applications —
              all in one secure, transparent and paperless platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow">
                <Link to="/register">Register Now <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur text-white border-white/30 hover:bg-white/20 hover:text-white">
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-white/70">
              {["Aadhaar Linked", "Digital Vault", "256-bit SSL", "Audit Logged"].map((x) => (
                <span key={x} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" /> {x}</span>
              ))}
            </div>
          </div>

          {/* How it works mini steps */}
          <div className="lg:col-span-2 relative animate-scale-in">
            <div className="absolute -inset-4 gradient-accent opacity-20 blur-3xl rounded-3xl" />
            <Card className="relative p-6 bg-white/95 dark:bg-card/95 backdrop-blur shadow-elegant border-white/30 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Get started in 4 steps</p>
                <p className="font-display font-bold text-foreground text-lg">From signup to approved — fully online</p>
              </div>
              <div className="space-y-3">
                {steps.map((s) => (
                  <div key={s.n} className="flex gap-3 items-start p-3 rounded-xl bg-secondary/60">
                    <div className="h-10 w-10 rounded-lg gradient-primary text-white grid place-items-center shrink-0">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-primary font-semibold">{s.n}</p>
                      <p className="text-sm font-semibold text-foreground">{s.t}</p>
                      <p className="text-xs text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/10 bg-black/10 backdrop-blur">
          <div className="container py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-2xl lg:text-3xl text-white">{s.value}</p>
                <p className="text-xs text-white/70 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Featured Services</Badge>
          <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
            Most requested citizen services
          </h2>
          <p className="text-muted-foreground mt-3">
            Apply, track and receive — completely online with end-to-end transparency.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((s, i) => (
            <Card key={s.name} className="p-6 group hover:shadow-elegant hover:-translate-y-1 transition-smooth border-border/60 cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl bg-secondary grid place-items-center group-hover:scale-110 transition-smooth ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" />
              </div>
              <h3 className="font-display font-semibold text-lg">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild size="lg" variant="outline">
            <Link to="/services">View all services <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Why Bharat Sewa</Badge>
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Built on trust. Designed for Bharat.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => (
              <Card key={b.title} className="p-6 border-border/60 hover:shadow-elegant transition-smooth">
                <div className="h-12 w-12 rounded-xl gradient-primary grid place-items-center text-white mb-4">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="container py-16 relative">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {achievements.map((a) => (
              <div key={a.label}>
                <Award className="h-8 w-8 text-accent mx-auto mb-3" />
                <p className="font-display text-2xl font-bold">{a.value}</p>
                <p className="text-sm text-white/70 mt-1">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="relative overflow-hidden p-10 lg:p-14 border-0 gradient-primary text-white text-center">
          <div className="absolute inset-0 gradient-mesh opacity-40" />
          <div className="relative max-w-2xl mx-auto space-y-5">
            <Users2 className="h-10 w-10 mx-auto text-accent" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Ready to experience digital governance?</h2>
            <p className="text-white/80">Create your free citizen account in under 2 minutes.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                <Link to="/register">Register as Citizen</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}
