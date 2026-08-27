import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Target, Eye, Sparkles, ShieldCheck, Users2, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <PublicLayout>
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="container relative py-20 text-center">
          <Badge className="bg-white/10 border-white/20 text-white">About Us</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-bold mt-4">Empowering 1.4 billion lives, digitally.</h1>
          <p className="text-white/80 max-w-2xl mx-auto mt-4">Bharat Sewa is the unified citizen services platform under the Digital India initiative — built for transparency, scale and trust.</p>
        </div>
      </section>

      <section className="container py-16 grid md:grid-cols-2 gap-6">
        <Card className="p-8">
          <Target className="h-10 w-10 text-primary mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">To bring every government service to every Indian's fingertips — fast, paperless, and verifiable.</p>
        </Card>
        <Card className="p-8">
          <Eye className="h-10 w-10 text-accent mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">A digitally empowered Bharat where governance is transparent, inclusive and citizen-first.</p>
        </Card>
      </section>

      <section className="bg-secondary/40 border-y border-border">
        <div className="container py-16">
          <div className="text-center mb-10">
            <Badge variant="outline" className="border-primary/30 text-primary">Services Offered</Badge>
            <h2 className="font-display text-3xl font-bold mt-3">A nation's needs, one platform</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { i: ShieldCheck, t: "Identity & Documents", d: "Aadhaar, PAN, Passport, Voter ID, DigiLocker." },
              { i: Users2, t: "Welfare Schemes", d: "Pensions, scholarships, ration, subsidies." },
              { i: Globe2, t: "Tax & Revenue", d: "Property tax, income tax, GST, payments." },
              { i: Sparkles, t: "Civic Services", d: "Birth, death, marriage, caste certificates." },
              { i: ShieldCheck, t: "Transport", d: "Driving license, vehicle registration, fitness." },
              { i: Users2, t: "Grievances", d: "Lodge, track and resolve complaints." },
            ].map((s) => (
              <Card key={s.t} className="p-6 hover:shadow-elegant transition-smooth">
                <s.i className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-display font-semibold text-lg">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <Card className="p-10 lg:p-14 gradient-primary text-white border-0">
          <Badge className="bg-white/10 border-white/20 text-white mb-3">Digital India</Badge>
          <h2 className="font-display text-3xl font-bold">Trust. Transparency. Transformation.</h2>
          <p className="text-white/80 mt-3 max-w-2xl">Every transaction is audit-logged, every document is digitally signed, and every citizen has equal access — regardless of geography or language.</p>
        </Card>
      </section>
    </PublicLayout>
  );
}