import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ScanRecord {
  id: string;
  disease: string;
  severity: "healthy" | "mild" | "severe";
  description: string;
  created_at: string;
  image_data: string;
}

const History = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setScans((data || []) as ScanRecord[]);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-[hsl(var(--healthy-accent))]" />;
      case "mild":
        return <AlertTriangle className="w-5 h-5 text-[hsl(var(--mild-accent))]" />;
      case "severe":
        return <AlertCircle className="w-5 h-5 text-[hsl(var(--severe-accent))]" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "healthy":
        return "text-[hsl(var(--healthy-accent))]";
      case "mild":
        return "text-[hsl(var(--mild-accent))]";
      case "severe":
        return "text-[hsl(var(--severe-accent))]";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--healthy-bg))] to-background">
      {/* Header */}
      <header className="p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">My Crop Health</h1>
      </header>

      {/* Main Content */}
      <main className="px-6 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold mb-2">No Scans Yet</p>
              <p className="text-muted-foreground">
                Start scanning your crops to see the history here
              </p>
            </div>
            <Button
              onClick={() => navigate("/scan")}
              className="mt-4 bg-[hsl(var(--healthy-accent))] hover:bg-[hsl(var(--healthy-accent))]/90"
            >
              Start Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan) => (
              <Card
                key={scan.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  navigate("/result", {
                    state: {
                      result: {
                        disease: scan.disease,
                        severity: scan.severity,
                        description: scan.description,
                        cure: [],
                      },
                      image: scan.image_data,
                    },
                  })
                }
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={scan.image_data}
                      alt={scan.disease}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-base ${getSeverityColor(scan.severity)}`}>
                        {scan.disease}
                      </h3>
                      {getSeverityIcon(scan.severity)}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {scan.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(scan.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
