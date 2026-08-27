import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertCircle, FileSearch } from "lucide-react";

const map: Record<string, { cls: string; Icon: any; label?: string }> = {
  // Application statuses (DB enum)
  submitted: { cls: "bg-primary/10 text-primary border-primary/30", Icon: FileSearch, label: "Submitted" },
  under_review: { cls: "bg-primary/10 text-primary border-primary/30", Icon: FileSearch, label: "Under Review" },
  approved: { cls: "bg-success/10 text-success border-success/30", Icon: CheckCircle2, label: "Approved" },
  rejected: { cls: "bg-destructive/10 text-destructive border-destructive/30", Icon: XCircle, label: "Rejected" },
  more_info: { cls: "bg-warning/10 text-warning border-warning/30", Icon: AlertCircle, label: "More Info Needed" },
  // Complaint
  open: { cls: "bg-warning/10 text-warning border-warning/30", Icon: Clock, label: "Open" },
  in_progress: { cls: "bg-primary/10 text-primary border-primary/30", Icon: Clock, label: "In Progress" },
  resolved: { cls: "bg-success/10 text-success border-success/30", Icon: CheckCircle2, label: "Resolved" },
  closed: { cls: "bg-muted text-muted-foreground border-border", Icon: CheckCircle2, label: "Closed" },
  // Payment
  pending: { cls: "bg-warning/10 text-warning border-warning/30", Icon: Clock, label: "Pending" },
  success: { cls: "bg-success/10 text-success border-success/30", Icon: CheckCircle2, label: "Success" },
  failed: { cls: "bg-destructive/10 text-destructive border-destructive/30", Icon: XCircle, label: "Failed" },
  refunded: { cls: "bg-muted text-muted-foreground border-border", Icon: AlertCircle, label: "Refunded" },
};

export function StatusBadge({ status }: { status: string }) {
  const v = map[status] || { cls: "bg-muted text-muted-foreground border-border", Icon: Clock, label: status };
  const { Icon } = v;
  return (
    <Badge variant="outline" className={`${v.cls} font-medium gap-1 capitalize`}>
      <Icon className="h-3 w-3" /> {v.label || status}
    </Badge>
  );
}
