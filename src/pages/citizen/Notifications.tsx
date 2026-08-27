import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCircle2, AlertTriangle, CreditCard, MessageSquareWarning, FileText } from "lucide-react";

export default function Notifications() {
  const { user, loading } = useSession();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [apps, pays, comps] = await Promise.all([
        supabase.from("applications").select("id,reference_no,status,updated_at,services(name)").eq("citizen_id", user.id).order("updated_at", { ascending: false }).limit(10),
        supabase.from("payments").select("id,txn_id,amount,status,created_at").eq("citizen_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("complaints").select("id,reference_no,subject,status,updated_at").eq("citizen_id", user.id).order("updated_at", { ascending: false }).limit(10),
      ]);
      const all: any[] = [];
      (apps.data || []).forEach((a: any) => all.push({
        type: "app", time: a.updated_at,
        Icon: a.status === "approved" ? CheckCircle2 : a.status === "rejected" ? AlertTriangle : FileText,
        tone: a.status === "approved" ? "success" : a.status === "rejected" ? "warning" : "primary",
        title: `${a.services?.name} · ${a.reference_no}`, body: `Status: ${a.status}`,
      }));
      (pays.data || []).forEach((p: any) => all.push({
        type: "payment", time: p.created_at, Icon: CreditCard, tone: "success",
        title: `Payment ${p.status} · ₹${Number(p.amount).toLocaleString("en-IN")}`, body: p.txn_id,
      }));
      (comps.data || []).forEach((c: any) => all.push({
        type: "complaint", time: c.updated_at, Icon: MessageSquareWarning,
        tone: c.status === "resolved" ? "success" : c.status === "in_progress" ? "primary" : "warning",
        title: `Complaint ${c.reference_no}`, body: `${c.subject} · ${c.status}`,
      }));
      all.sort((a, b) => +new Date(b.time) - +new Date(a.time));
      setItems(all);
    })();
  }, [user]);

  const toneCls: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  if (loading) return <PortalLayout role="citizen"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) return null;

  return (
    <PortalLayout role="citizen">
      <PageHeader
        title="Notifications"
        subtitle="All your government updates in one inbox."
        action={<Badge variant="outline" className="gap-1"><Bell className="h-3 w-3" />{items.length} updates</Badge>}
      />
      {items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No notifications yet. Activity from your applications, payments and complaints will appear here.</Card>
      ) : (
        <div className="space-y-3">
          {items.map((n, i) => (
            <Card key={i} className="p-4 hover:shadow-card transition-smooth">
              <div className="flex gap-4">
                <div className={`h-10 w-10 rounded-xl shrink-0 grid place-items-center ${toneCls[n.tone]}`}>
                  <n.Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold truncate">{n.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(n.time).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
