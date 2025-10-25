import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[hsl(var(--healthy-bg))] to-background">
      <div className="text-center space-y-6 px-6 max-w-md">
        <div className="w-24 h-24 mx-auto bg-[hsl(var(--mild-bg))] rounded-3xl flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-[hsl(var(--mild-accent))]" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Page Not Found</p>
          <p className="text-base text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => window.location.href = "/"}
          className="h-14 px-8 text-lg font-semibold rounded-2xl bg-[hsl(var(--healthy-accent))] hover:bg-[hsl(var(--healthy-accent))]/90"
        >
          <Home className="w-5 h-5 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
