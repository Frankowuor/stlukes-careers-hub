import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Briefcase, FileText } from "lucide-react";
import logo from "@/assets/stlukes-logo.png";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="St. Luke's" className="h-10 w-auto" />
            <span className="font-bold text-lg text-foreground hidden sm:block" style={{ fontFamily: "'Playfair Display', serif" }}>
              E-Recruitment
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/">
              <Button variant={isActive("/") ? "default" : "ghost"} size="sm" className="gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </Button>
            </Link>
            {user && (
              <Link to="/my-applications">
                <Button variant={isActive("/my-applications") ? "default" : "ghost"} size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">My Applications</span>
                </Button>
              </Link>
            )}
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
