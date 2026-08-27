import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Clock, IndianRupee, FileCheck2 } from "lucide-react";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string; code: string; name: string; department: string; description: string;
  fee: number; processing_days: number; required_docs: string[]; icon: string;
}

export default function Services() {
  const { user } = useSession();
  const [q, setQ] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").eq("is_active", true).order("name").then(({ data }) => {
      setServices((data as any) || []); setLoading(false);
    });
  }, []);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(q.toLowerCase()) || s.department.toLowerCase().includes(q.toLowerCase())
  );

  const Body = (
    <>
      <PageHeader
        title="Government Services"
        subtitle={loading ? "Loading services..." : `Browse and apply from ${services.length} services across departments.`}
        action={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services..." className="pl-9" />
          </div>
        }
      />

      {!loading && filtered.length === 0 && (
        <Card className="p-10 text-center text-muted-foreground">No services found.</Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => {
          const Icon = (Icons as any)[s.icon] || Icons.FileText;
          return (
            <Card key={s.id} className="p-6 hover:shadow-elegant hover:-translate-y-1 transition-smooth border-border/60 group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl gradient-primary text-white grid place-items-center group-hover:scale-110 transition-smooth">
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[10px]">{s.department.split(" ").slice(-1)}</Badge>
              </div>
              <h3 className="font-display font-semibold text-lg">{s.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{s.department}</p>
              <p className="text-sm text-muted-foreground flex-1">{s.description}</p>

              <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground"><IndianRupee className="h-3 w-3 text-primary" />₹{s.fee.toLocaleString("en-IN")}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3 text-primary" />{s.processing_days} days</div>
              </div>

              <div className="text-xs mb-4">
                <p className="text-muted-foreground mb-1.5 flex items-center gap-1"><FileCheck2 className="h-3 w-3" />Required documents</p>
                <div className="flex flex-wrap gap-1">
                  {s.required_docs.slice(0, 3).map((d) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                  {s.required_docs.length > 3 && <Badge variant="secondary" className="text-[10px]">+{s.required_docs.length - 3}</Badge>}
                </div>
              </div>

              <Button asChild className="gradient-primary text-white mt-auto"><Link to={`/apply/${s.code}`}>Apply Now <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
            </Card>
          );
        })}
      </div>
    </>
  );

  return user ? <PortalLayout role={user.role}>{Body}</PortalLayout> : <PublicLayout><div className="container py-10">{Body}</div></PublicLayout>;
}
