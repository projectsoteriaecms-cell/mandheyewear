import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TryOnRequest {
  userPhoto: string; // base64 image
  frameDetails: {
    name: string;
    color?: string;
    style?: string;
    imageUrl?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userPhoto, frameDetails }: TryOnRequest = await req.json();

    if (!userPhoto) {
      return new Response(
        JSON.stringify({ success: false, error: "User photo is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!frameDetails?.name) {
      return new Response(
        JSON.stringify({ success: false, error: "Frame details are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing virtual try-on for frame: ${frameDetails.name}`);

    // Prepare the base64 image data (remove data URL prefix if present)
    const imageData = userPhoto.includes("base64,") 
      ? userPhoto.split("base64,")[1] 
      : userPhoto;

    // Build the prompt for frame overlay generation
    const frameDescription = [
      frameDetails.name,
      frameDetails.color && `in ${frameDetails.color} color`,
      frameDetails.style && `${frameDetails.style} style`,
    ].filter(Boolean).join(" ");

    const prompt = `You are an expert eyewear designer and photo editor. 

Given this front-facing face photo, create a photorealistic image showing the person wearing eyeglasses with these specifications:
- Frame: ${frameDescription}
- The glasses should be properly scaled to match the face width
- Position the glasses correctly on the nose bridge, aligned with the eyes
- Follow the natural perspective and lighting of the original photo
- The result should look like a real photograph, not a digital overlay
- Maintain the original photo quality and background
- Ensure the frame temples extend naturally towards the ears

Important: Generate a complete, photorealistic image of the person wearing the described glasses. The output should be indistinguishable from a real photo of someone wearing glasses.`;

    // Call Gemini API with image generation capability
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageData,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["image", "text"],
            temperature: 0.4,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      
      // Check for specific error types
      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "High demand right now. Please try again in a moment." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (geminiResponse.status === 400) {
        // Often means the image couldn't be processed
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "We couldn't process your photo. Please try a clear, front-facing photo with good lighting." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Something went wrong with the AI service. Please try again." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await geminiResponse.json();
    console.log("Gemini response received");

    // Extract the generated image from the response
    const parts = result.candidates?.[0]?.content?.parts || [];
    let generatedImage: string | null = null;
    let textResponse: string | null = null;

    for (const part of parts) {
      if (part.inlineData) {
        generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        textResponse = part.text;
      }
    }

    if (!generatedImage) {
      // If no image was generated, check if there's an error in the text response
      console.log("No image generated, text response:", textResponse);
      
      // Try alternative: use imagen or return helpful error
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: textResponse || "Unable to generate try-on image. Please try with a different photo.",
          details: "The AI could not create the frame overlay. Try using a clearer front-facing photo."
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Virtual try-on generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        compositeImage: generatedImage,
        frameDetails: frameDetails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
