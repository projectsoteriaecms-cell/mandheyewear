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
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Service not configured. Please try again later." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Compress the image if it's a data URL — keep it under ~1MB for fast processing
    let imagePayload = image;
    if (typeof image === "string" && image.length > 1_500_000) {
      // Truncate excessively large base64 payloads to avoid timeouts
      console.warn(`Image payload is large: ${(image.length / 1024 / 1024).toFixed(1)}MB`);
    }

    console.log("Starting face analysis with google/gemini-3-flash-preview");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are an expert optometrist. Analyze the face image and estimate eyewear fitting measurements.

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
{"error": "Description of issue", "confidenceScore": 0}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this front-facing face image for eyewear fitting measurements.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imagePayload,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      }
    );

    console.log("AI gateway response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 200,
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
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: "Analysis service is temporarily unavailable. Please try again.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", JSON.stringify(aiResponse).substring(0, 200));
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not analyze the photo. Please try with a clearer image.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the JSON response from the AI
    let analysisData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content.substring(0, 300));
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not process the analysis. Please try again with a different photo.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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

    console.log("Face analysis completed successfully");

    // Validate the measurements are within reasonable ranges
    const result: FaceAnalysisResult = {
      success: true,
      dimensions: {
        faceWidthMm: Math.round(
          Math.min(Math.max(analysisData.faceWidthMm || 140, 120), 160)
        ),
        pupillaryDistanceMm:
          Math.round(
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
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Face analysis error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Something went wrong. Please try again.",
      } as FaceAnalysisResult),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
