import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  status: string;
  created_at: string;
  jobs: {
    title: string;
    department: string;
    location: string;
  };
}

const statusColors: Record<string, string> = {
  submitted: "bg-primary/10 text-primary",
  reviewing: "bg-secondary/80 text-secondary-foreground",
  shortlisted: "bg-accent/10 text-accent",
  rejected: "bg-destructive/10 text-destructive",
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id, status, created_at, jobs(title, department, location)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setApplications(data as unknown as Application[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          My Applications
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
            <p className="text-muted-foreground">Browse open positions and apply.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{app.jobs.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.jobs.department} • {app.jobs.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(app.created_at), "MMM dd, yyyy")}
                      </span>
                      <Badge className={statusColors[app.status] || ""}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
