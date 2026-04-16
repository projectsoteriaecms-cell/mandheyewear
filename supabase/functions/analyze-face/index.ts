import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FaceAnalysisResult {
  success: boolean;
  dimensions?: {
    faceWidthMm: number;
    pupillaryDistanceMm: number;
    bridgeWidthMm: number;
    templeWidthMm: number;
    faceShape: string;
    confidenceScore: number;
  };
  rawAnalysis?: Record<string, unknown>;
  error?: string;
}

const SYSTEM_PROMPT = `You are an expert optometrist. Analyze the face image and estimate eyewear fitting measurements.

Use the average human iris diameter (11.7mm) as a reference scale.

Respond ONLY with valid JSON:
{
  "faceWidthMm": <120-160>,
  "pupillaryDistanceMm": <54-74>,
  "bridgeWidthMm": <14-24>,
  "templeWidthMm": <125-155>,
  "faceShape": "<oval|round|square|heart|oblong|diamond>",
  "confidenceScore": <0.0-1.0>
}

If the image is unsuitable, respond with:
{"error": "Description of issue", "confidenceScore": 0}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Manual auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ success: false, error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Service not configured. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data and mime type from data URL
    let base64Data: string;
    let mimeType = "image/jpeg";
    if (typeof image === "string" && image.startsWith("data:")) {
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = image.split(",")[1] || image;
      }
    } else {
      base64Data = image;
    }

    if (base64Data.length > 2_000_000) {
      console.warn(`Image payload is large: ${(base64Data.length / 1024 / 1024).toFixed(1)}MB`);
    }

    console.log("Starting face analysis with gemini-2.5-flash (direct API)");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: "Analyze this front-facing face image for eyewear fitting measurements." },
                { inlineData: { mimeType, data: base64Data } },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 500 },
        }),
      }
    );

    console.log("Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: "Analysis service is temporarily unavailable. Please try again." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiResponse = await response.json();
    const content = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No content in Gemini response:", JSON.stringify(geminiResponse).substring(0, 200));
      return new Response(
        JSON.stringify({ success: false, error: "Could not analyze the photo. Please try with a clearer image." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from response
    let analysisData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (_parseError) {
      console.error("Failed to parse Gemini response:", content.substring(0, 300));
      return new Response(
        JSON.stringify({ success: false, error: "Could not process the analysis. Please try again with a different photo." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (analysisData.error) {
      return new Response(
        JSON.stringify({ success: false, error: analysisData.error } as FaceAnalysisResult),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Face analysis completed successfully");

    const result: FaceAnalysisResult = {
      success: true,
      dimensions: {
        faceWidthMm: Math.round(Math.min(Math.max(analysisData.faceWidthMm || 140, 120), 160)),
        pupillaryDistanceMm: Math.round(Math.min(Math.max(analysisData.pupillaryDistanceMm || 63, 54), 74) * 10) / 10,
        bridgeWidthMm: Math.round(Math.min(Math.max(analysisData.bridgeWidthMm || 18, 14), 24)),
        templeWidthMm: Math.round(Math.min(Math.max(analysisData.templeWidthMm || 140, 125), 155)),
        faceShape: analysisData.faceShape || "oval",
        confidenceScore: Math.min(Math.max(analysisData.confidenceScore || 0.7, 0), 1),
      },
      rawAnalysis: analysisData,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Face analysis error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Something went wrong. Please try again." } as FaceAnalysisResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
