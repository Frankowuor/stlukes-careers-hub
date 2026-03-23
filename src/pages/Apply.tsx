import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, CheckCircle2, FileText } from "lucide-react";

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
}

const DOCUMENT_FIELDS = [
  { key: "cover_letter", label: "Cover Letter", required: true },
  { key: "resume", label: "Resume / CV", required: true },
  { key: "degree_cert", label: "Degree Certificate", required: false },
  { key: "highschool_cert", label: "High School Certificate", required: false },
  { key: "other_testimonials", label: "Other Testimonials", required: false },
] as const;

const Apply = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<Record<string, FileUploadState>>(() => {
    const initial: Record<string, FileUploadState> = {};
    DOCUMENT_FIELDS.forEach((f) => {
      initial[f.key] = { file: null, uploading: false, uploaded: false };
    });
    return initial;
  });

  useEffect(() => {
    const fetchJob = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("title")
        .eq("id", jobId!)
        .single();
      if (data) setJobTitle(data.title);
    };
    fetchJob();
  }, [jobId]);

  const handleFileChange = (key: string, file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [key]: { ...prev[key], file, uploaded: false },
    }));
  };

  const uploadFile = async (key: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${jobId}/${key}.${ext}`;

    const { error } = await supabase.storage
      .from("documents")
      .upload(path, file, { upsert: true });

    if (error) {
      toast({ title: "Upload failed", description: `${key}: ${error.message}`, variant: "destructive" });
      return null;
    }
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !jobId) return;

    // Validate required files
    for (const field of DOCUMENT_FIELDS) {
      if (field.required && !files[field.key].file) {
        toast({ title: "Missing file", description: `${field.label} is required.`, variant: "destructive" });
        return;
      }
    }

    setLoading(true);

    try {
      const urls: Record<string, string | null> = {};

      for (const field of DOCUMENT_FIELDS) {
        const f = files[field.key].file;
        if (f) {
          const url = await uploadFile(field.key, f);
          if (!url && field.required) {
            setLoading(false);
            return;
          }
          urls[field.key] = url;
        } else {
          urls[field.key] = null;
        }
      }

      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        user_id: user.id,
        cover_letter_url: urls.cover_letter,
        resume_url: urls.resume,
        degree_cert_url: urls.degree_cert,
        highschool_cert_url: urls.highschool_cert,
        other_testimonials_url: urls.other_testimonials,
      });

      if (error) throw error;

      toast({ title: "Application submitted!", description: "Your application has been received successfully." });
      navigate("/my-applications");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to job
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Apply: {jobTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {DOCUMENT_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="relative">
                    <label className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(field.key, e.target.files?.[0] || null)}
                      />
                      {files[field.key].file ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                          <span className="text-sm text-foreground truncate">{files[field.key].file!.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload (PDF, DOC, JPG, PNG)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ))}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Apply;
