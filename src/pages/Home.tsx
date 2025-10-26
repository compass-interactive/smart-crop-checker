import { useState } from "react";
import { Camera, History, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const content = {
    en: {
      title: "WheatSure",
      subtitle: "AI-Powered Crop Disease Detection",
      scan: "Scan Crop",
      history: "My Crop Health",
      description: "Take a photo of your wheat crop to instantly detect diseases and get treatment recommendations",
    },
    hi: {
      title: "वीटशोर",
      subtitle: "एआई से फसल रोग पहचान",
      scan: "फसल स्कैन करें",
      history: "मेरी फसल स्वास्थ्य",
      description: "अपनी गेहूं की फसल की फोटो लें और तुरंत रोग की पहचान और उपचार प्राप्त करें",
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--healthy-bg))] to-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="WheatSure logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="rounded-full"
        >
          {language === "en" ? "हिं" : "EN"}
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-center space-y-6 max-w-md animate-slide-up">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[hsl(var(--healthy-accent))] to-[hsl(var(--healthy-glow))] rounded-3xl flex items-center justify-center shadow-[var(--shadow-elevated)] animate-pulse-glow">
            <img src="/logo.png" alt="WheatSure logo" className="w-16 h-16 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">{t.title}</h2>
            <p className="text-lg text-muted-foreground">{t.subtitle}</p>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed">
            {t.description}
          </p>

          <div className="space-y-3 pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/scan")}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-[hsl(var(--healthy-accent))] hover:bg-[hsl(var(--healthy-accent))]/90 shadow-[var(--shadow-soft)] transition-all hover:scale-105"
            >
              <Camera className="w-6 h-6 mr-2" />
              {t.scan}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/history")}
              className="w-full h-14 text-lg font-semibold rounded-2xl border-2 border-[hsl(var(--healthy-accent))] text-[hsl(var(--healthy-accent))] hover:bg-[hsl(var(--healthy-accent))]/10"
            >
              <History className="w-6 h-6 mr-2" />
              {t.history}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Powered by AI • Made for Farmers</p>
      </footer>
    </div>
  );
};

export default Home;
