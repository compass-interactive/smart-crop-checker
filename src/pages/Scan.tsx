import { useState, useRef } from "react";
import { Camera, Upload, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Scan = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = async (file: File) => {
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setCapturedImage(base64Image);
      
      // Analyze image
      await analyzeImage(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-crop", {
        body: { image: imageData },
      });

      if (error) {
        if (error.message.includes("429") || error.message.includes("rate limit")) {
          toast.error("Too many requests. Please try again later.");
        } else if (error.message.includes("402") || error.message.includes("payment")) {
          toast.error("Service usage limit reached. Please contact support.");
        } else {
          toast.error("Analysis failed. Please try again.");
        }
        console.error("Analysis error:", error);
        return;
      }

      // Navigate to result with the analysis data
      navigate("/result", { state: { result: data, image: imageData } });
    } catch (error) {
      console.error("Error during analysis:", error);
      toast.error("Failed to analyze image. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
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
        <h1 className="text-xl font-bold">Scan Your Crop</h1>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 space-y-8">
        {/* Camera Preview / Captured Image */}
        <div className="relative w-full aspect-[4/3] bg-muted rounded-3xl overflow-hidden shadow-[var(--shadow-elevated)]">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured crop"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Take a photo or upload from gallery
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-[hsl(var(--healthy-accent))]" />
                <p className="text-lg font-semibold">Analyzing your crop...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            size="lg"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isAnalyzing}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-[hsl(var(--healthy-accent))] hover:bg-[hsl(var(--healthy-accent))]/90 shadow-[var(--shadow-soft)]"
          >
            <Camera className="w-6 h-6 mr-2" />
            Take Photo
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="w-full h-14 text-lg font-semibold rounded-2xl border-2 border-[hsl(var(--healthy-accent))] text-[hsl(var(--healthy-accent))] hover:bg-[hsl(var(--healthy-accent))]/10"
          >
            <Upload className="w-6 h-6 mr-2" />
            Upload from Gallery
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-soft)] border border-border">
          <h3 className="font-semibold mb-3">Tips for Best Results:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Take photo in good natural light</li>
            <li>• Focus on affected leaf area</li>
            <li>• Ensure image is clear and not blurry</li>
            <li>• Include at least 2-3 leaves in frame</li>
          </ul>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleImageCapture(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageCapture(e.target.files[0])}
          className="hidden"
        />
      </main>
    </div>
  );
};

export default Scan;
