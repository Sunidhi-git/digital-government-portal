import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Search, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function Applications() {
  const { user, loading } = useSession();
  const [apps, setApps] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("applications")
      .select("id,reference_no,status,created_at,remarks,services(name),officers:officer_id(full_name)")
      .eq("citizen_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setApps((data as any) || []));
  }, [user]);

  if (loading) return <PortalLayout role="citizen"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) return null;

  const filtered = apps.filter((a) =>
    a.reference_no.toLowerCase().includes(q.toLowerCase()) ||
    (a.services?.name || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PortalLayout role="citizen">
      <PageHeader
        title="My Applications"
        subtitle="Complete history of your government service requests."
        action={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applications..." className="pl-9" />
          </div>
        }
      />
      <Card className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-3">No applications yet.</p>
            <Button asChild className="gradient-primary text-white"><Link to="/services">Apply for Service</Link></Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 font-semibold">Reference No.</th>
                  <th className="py-3 font-semibold">Service</th>
                  <th className="py-3 font-semibold">Submitted</th>
                  <th className="py-3 font-semibold">Officer</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="py-3 font-mono text-xs">{a.reference_no}</td>
                    <td className="py-3 font-medium">{a.services?.name}</td>
                    <td className="py-3 text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 text-muted-foreground">{a.officers?.full_name || "—"}</td>
                    <td className="py-3"><StatusBadge status={a.status} /></td>
                    <td className="py-3 text-right">
                      <Button asChild size="sm" variant="ghost"><Link to={`/track?ref=${a.reference_no}`}>Track <ExternalLink className="h-3 w-3 ml-1" /></Link></Button>
                    </td>
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
