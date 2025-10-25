import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error("Image data is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // System prompt for disease detection
    const systemPrompt = `You are an expert agricultural AI assistant specializing in wheat crop disease detection.

When analyzing crop images, you must:
1. Identify the disease (or state "Healthy Crop" if no disease is found)
2. Classify severity as: "healthy", "mild", or "severe"
3. Provide a brief description (2-3 sentences) in simple, farmer-friendly language
4. Provide 3-5 actionable cure steps in simple bullet points

Common wheat diseases to look for:
- Leaf Rust (brown/orange pustules on leaves)
- Yellow Rust (yellow/orange stripes on leaves)
- Stem Rust (reddish-brown pustules on stems)
- Powdery Mildew (white/grey powdery coating)
- Septoria Leaf Blotch (brown spots with yellow halos)
- Fusarium Head Blight (pink/orange discoloration on heads)

Severity guidelines:
- healthy: No visible disease symptoms, crop looks green and vibrant
- mild: Early stage infection, less than 20% of visible area affected, treatable
- severe: Advanced infection, more than 50% affected, requires urgent treatment

Respond ONLY with valid JSON in this exact format:
{
  "disease": "Disease Name or Healthy Crop",
  "severity": "healthy" | "mild" | "severe",
  "description": "Simple description in 2-3 sentences",
  "cure": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
}`;

    // Call Gemini Vision API via Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this wheat crop image and detect any diseases. Respond with JSON only.",
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    // Extract the analysis from the response
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in Gemini response");
    }

    // Parse JSON response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse JSON:", content);
      // Fallback response
      analysis = {
        disease: "Analysis Error",
        severity: "mild",
        description: "Unable to analyze the image clearly. Please take a clearer photo in good lighting.",
        cure: [
          "Ensure photo is taken in good natural light",
          "Focus on affected leaf areas",
          "Take multiple photos from different angles",
          "Consult local agricultural expert if unsure",
        ],
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
