import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Briefcase, MapPin, Clock, Search, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  closing_date: string | null;
  created_at: string;
}

const Index = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) setJobs(data);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Career Opportunities
          </h1>
          <p className="text-lg opacity-90 mb-8 font-light">
            Join our team at St. Luke's and make a difference
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by title, department, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-card text-foreground border-0 shadow-lg text-base"
            />
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No jobs found</h2>
            <p className="text-muted-foreground">Check back later for new openings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} open position{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <CardTitle className="text-lg text-foreground">{job.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">{job.employment_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </span>
                      )}
                      {job.closing_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Closes: {format(new Date(job.closing_date), "MMM dd, yyyy")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Posted: {format(new Date(job.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {job.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} St. Luke's. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
