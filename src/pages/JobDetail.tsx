import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Briefcase, MapPin, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  closing_date: string | null;
  created_at: string;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id!)
        .single();
      if (!error && data) setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const checkApplication = async () => {
      const { data } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setHasApplied(true);
    };
    checkApplication();
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold mb-4">Job not found</h2>
          <Link to="/"><Button>Back to Jobs</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to all jobs
        </Link>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {job.department && (
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.department}</span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">{job.employment_type}</Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
              {job.closing_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Closing: {format(new Date(job.closing_date), "MMMM dd, yyyy")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Posted: {format(new Date(job.created_at), "MMMM dd, yyyy")}
              </span>
            </div>

            {job.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">Job Description</h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {job.description}
                </div>
              </div>
            )}

            {job.requirements && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">Requirements</h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              {hasApplied ? (
                <div className="bg-accent/10 text-accent p-4 rounded-lg text-center font-medium">
                  ✓ You have already applied for this position
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (!user) {
                      navigate("/auth");
                    } else {
                      navigate(`/apply/${job.id}`);
                    }
                  }}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetail;
