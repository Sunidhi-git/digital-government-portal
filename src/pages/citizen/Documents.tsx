import { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Documents() {
  const { user, loading } = useSession();
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("documents").select("*").eq("citizen_id", user.id).order("uploaded_at", { ascending: false });
    setDocs(data || []);
  };
  useEffect(() => { load(); }, [user]);

  if (loading) return <PortalLayout role="citizen"><PageHeader title="Loading..." subtitle="" /></PortalLayout>;
  if (!user) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    setUploading(true);
    const path = `${user.id}/library/${docType.replace(/\s+/g, "_")}_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file);
    if (error) { setUploading(false); return toast.error(error.message); }
    await supabase.from("documents").insert({
      citizen_id: user.id, doc_type: docType, file_name: file.name,
      storage_path: path, size_bytes: file.size, mime_type: file.type,
    });
    setUploading(false);
    toast.success(`${docType} uploaded`);
    load();
  };

  const handleDownload = async (d: any) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(d.storage_path, 60);
    if (error || !data) return toast.error("Download failed");
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (d: any) => {
    const documentId = d.id || d.document_id;
    if (!documentId) {
      return toast.error("Unable to delete document: missing document id.");
    }

    const { error: storageErr } = await supabase.storage.from("documents").remove([d.storage_path]);
    const { error: dbErr } = await supabase.from("documents").delete().eq("id", documentId);
    if (storageErr) {
      console.error("Document storage delete failed:", storageErr);
    }
    if (dbErr) {
      return toast.error(storageErr?.message || dbErr?.message || "Failed to delete document");
    }
    setDocs((prev) => prev.filter((doc) => (doc.id || doc.document_id) !== documentId));
    toast.success("Document deleted");
  };

  const cats = ["Aadhaar Card", "PAN Card", "Address Proof", "Passport Photo", "Income Proof", "Other"];

  return (
    <PortalLayout role="citizen">
      <PageHeader title="My Documents" subtitle="Securely stored in your encrypted vault." />

      <Card className="p-6 mb-6">
        <h3 className="font-display font-semibold text-lg mb-1">Quick Upload</h3>
        <p className="text-xs text-muted-foreground mb-4">PDF / JPG / PNG · Max 5 MB</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cats.map((c) => (
            <label key={c} className="text-left p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-smooth group cursor-pointer block">
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" disabled={uploading}
                onChange={(e) => handleUpload(e, c)} />
              <Upload className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-smooth" />
              <p className="text-sm font-medium">Upload {c}</p>
              <p className="text-xs text-muted-foreground">PDF/JPG · 5 MB</p>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Stored Documents</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {docs.map((d) => (
              <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border hover:bg-secondary/40 transition-smooth">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{d.doc_type}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.file_name} · {(d.size_bytes / 1024).toFixed(0)} KB · {new Date(d.uploaded_at).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleDownload(d)}><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(d)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalLayout>
  );
}
