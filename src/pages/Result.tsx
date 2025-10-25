import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, AlertCircle, CheckCircle, AlertTriangle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  disease: string;
  severity: "healthy" | "mild" | "severe";
  description: string;
  cure: string[];
}

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, image } = location.state as { result: AnalysisResult; image: string } || {};
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!result) {
      navigate("/");
      return;
    }

    // Save to history
    saveToHistory();
  }, [result]);

  const saveToHistory = async () => {
    try {
      const { error } = await supabase.from("scan_history").insert({
        disease: result.disease,
        severity: result.severity,
        description: result.description,
        cure: result.cure,
        image_data: image,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(
        `${result.disease}. ${result.description}. Treatment: ${result.cure.join('. ')}`
      );
      utterance.lang = 'hi-IN'; // Hindi voice
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Voice playback not supported on this device");
    }
  };

  if (!result) return null;

  // Theme based on severity
  const themeClasses = {
    healthy: {
      bg: "bg-[hsl(var(--healthy-bg))]",
      headerBg: "bg-[hsl(var(--healthy-bg-light))]",
      accent: "text-[hsl(var(--healthy-accent))]",
      cardBg: "bg-[hsl(var(--healthy-bg-light))]",
      textColor: "text-[hsl(var(--healthy-text))]",
      icon: CheckCircle,
      glow: "shadow-[var(--shadow-glow-healthy)]",
    },
    mild: {
      bg: "bg-[hsl(var(--mild-bg))]",
      headerBg: "bg-[hsl(var(--mild-bg-light))]",
      accent: "text-[hsl(var(--mild-accent))]",
      cardBg: "bg-[hsl(var(--mild-bg-light))]",
      textColor: "text-[hsl(var(--mild-text))]",
      icon: AlertTriangle,
      glow: "shadow-[var(--shadow-glow-mild)]",
    },
    severe: {
      bg: "bg-[hsl(var(--severe-bg))]",
      headerBg: "bg-[hsl(var(--severe-bg-light))]",
      accent: "text-[hsl(var(--severe-accent))]",
      cardBg: "bg-[hsl(var(--severe-bg-light))]",
      textColor: "text-[hsl(var(--severe-text))]",
      icon: AlertCircle,
      glow: "shadow-[var(--shadow-glow-severe)]",
    },
  };

  const theme = themeClasses[result.severity];
  const Icon = theme.icon;

  return (
    <div className={`min-h-screen ${theme.bg} theme-transition`}>
      {/* Header */}
      <header className={`p-4 flex items-center gap-4 ${theme.headerBg}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className={`rounded-full ${theme.textColor}`}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className={`text-xl font-bold ${theme.textColor}`}>Analysis Result</h1>
      </header>

      {/* Main Content */}
      <main className="px-6 py-4 space-y-6 animate-slide-up">
        {/* Image Preview */}
        <div className={`relative w-full aspect-video rounded-3xl overflow-hidden shadow-[var(--shadow-elevated)] ${theme.glow}`}>
          <img
            src={image}
            alt="Analyzed crop"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Status Card */}
        <Card className={`p-6 ${theme.cardBg} border-none space-y-4`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${theme.cardBg}`}>
              <Icon className={`w-8 h-8 ${theme.accent}`} />
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${theme.accent} mb-1`}>
                {result.disease}
              </h2>
              <p className={`text-sm uppercase tracking-wide ${theme.textColor}`}>
                {result.severity === "healthy" ? "Healthy Crop" : `${result.severity} Infection`}
              </p>
            </div>
          </div>

          <p className={`text-base leading-relaxed ${theme.textColor}`}>
            {result.description}
          </p>
        </Card>

        {/* Treatment Card */}
        {result.cure.length > 0 && (
          <Card className={`p-6 space-y-4 ${theme.cardBg} border-none`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold ${theme.textColor}`}>Treatment Steps</h3>
              <Button
                variant="outline"
                size="icon"
                onClick={speakText}
                disabled={isSpeaking}
                className={`rounded-full ${theme.textColor}`}
              >
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
              </Button>
            </div>

            <ul className="space-y-3">
              {result.cure.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-white ${theme.accent} flex items-center justify-center text-sm font-semibold`}>
                    {index + 1}
                  </span>
                  <span className={`text-base leading-relaxed ${theme.textColor}`}>{step}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Action Button */}
        <Button
          size="lg"
          onClick={() => navigate("/scan")}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-[hsl(var(--healthy-accent))] hover:bg-[hsl(var(--healthy-accent))]/90 shadow-[var(--shadow-soft)]"
        >
          <Camera className="w-6 h-6 mr-2" />
          Scan Again
        </Button>
      </main>
    </div>
  );
};

export default Result;
