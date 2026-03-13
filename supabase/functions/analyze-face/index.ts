import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ success: false, error: "No image provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Gemini with vision capabilities for face analysis
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "system",
              content: `You are an expert optometrist and facial measurement specialist. Analyze the provided face image and estimate facial measurements for eyewear fitting.

Use the average human iris diameter (11.7mm) as a reference scale for measurements.

Respond ONLY with a valid JSON object in this exact format:
{
  "faceWidthMm": <number between 120-160>,
  "pupillaryDistanceMm": <number between 54-74>,
  "bridgeWidthMm": <number between 14-24>,
  "templeWidthMm": <number between 125-155>,
  "faceShape": "<one of: oval, round, square, heart, oblong, diamond>",
  "confidenceScore": <number between 0.0-1.0>,
  "analysisNotes": "<brief notes about the analysis>"
}

Guidelines:
- faceWidthMm: Temple-to-temple width, typically 130-150mm for adults
- pupillaryDistanceMm: Distance between pupil centers, typically 58-68mm for adults
- bridgeWidthMm: Width at nose bridge, typically 16-22mm
- templeWidthMm: Full temple length including hinge area
- confidenceScore: How confident you are in the measurements (0.5-1.0)

If the image is not suitable for analysis (no face detected, poor quality, face not front-facing), respond with:
{
  "error": "Description of the issue",
  "confidenceScore": 0
}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this face image and provide the facial measurements for eyewear fitting. The image should show a front-facing view of the face.",
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
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Service temporarily unavailable. Please try again later.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze image");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI model");
    }

    // Parse the JSON response from the AI
    let analysisData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results");
    }

    // Check if AI returned an error
    if (analysisData.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: analysisData.error,
        } as FaceAnalysisResult),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate the measurements are within reasonable ranges
    const result: FaceAnalysisResult = {
      success: true,
      dimensions: {
        faceWidthMm: Math.round(
          Math.min(Math.max(analysisData.faceWidthMm || 140, 120), 160)
        ),
        pupillaryDistanceMm: Math.round(
          Math.min(Math.max(analysisData.pupillaryDistanceMm || 63, 54), 74) * 10
        ) / 10,
        bridgeWidthMm: Math.round(
          Math.min(Math.max(analysisData.bridgeWidthMm || 18, 14), 24)
        ),
        templeWidthMm: Math.round(
          Math.min(Math.max(analysisData.templeWidthMm || 140, 125), 155)
        ),
        faceShape: analysisData.faceShape || "oval",
        confidenceScore: Math.min(
          Math.max(analysisData.confidenceScore || 0.7, 0),
          1
        ),
      },
      rawAnalysis: analysisData,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Face analysis error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      } as FaceAnalysisResult),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
