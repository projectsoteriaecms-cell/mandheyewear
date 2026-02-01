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

type GeneratedTryOn = {
  compositeImage: string;
  provider: "google_gemini" | "lovable_ai";
};

const json = (body: unknown, status = 200, extraHeaders: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });

const stripDataUrlPrefix = (maybeDataUrl: string) =>
  maybeDataUrl.includes("base64,") ? maybeDataUrl.split("base64,")[1] : maybeDataUrl;

const buildPrompt = (frameDetails: TryOnRequest["frameDetails"]) => {
  const frameDescription = [
    frameDetails.name,
    frameDetails.color && `in ${frameDetails.color} color`,
    frameDetails.style && `${frameDetails.style} style`,
  ]
    .filter(Boolean)
    .join(" ");

  return `You are an expert eyewear designer and photo editor.

Given this front-facing face photo, create a photorealistic image showing the person wearing eyeglasses with these specifications:
- Frame: ${frameDescription}
- The glasses should be properly scaled to match the face width
- Position the glasses correctly on the nose bridge, aligned with the eyes
- Follow the natural perspective and lighting of the original photo
- The result should look like a real photograph, not a digital overlay
- Maintain the original photo quality and background
- Ensure the frame temples extend naturally towards the ears

Important: Generate a complete, photorealistic image of the person wearing the described glasses. The output should be indistinguishable from a real photo of someone wearing glasses.`;
};

const extractInlineBase64FromGeminiGenerateContent = (result: any) => {
  const parts = result?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data && part?.inlineData?.mimeType) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

const callGoogleGemini = async (opts: {
  apiKey: string;
  imageBase64: string;
  prompt: string;
}): Promise<{ ok: true; data: GeneratedTryOn } | { ok: false; status: number; error: string; raw?: string }> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${opts.apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: opts.imageBase64,
              },
            },
            { text: opts.prompt },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["image", "text"],
        temperature: 0.4,
      },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    return {
      ok: false,
      status: resp.status,
      error:
        resp.status === 429
          ? "High demand right now. Please try again in a moment."
          : resp.status === 400
            ? "We couldn't process your photo. Please try a clear, front-facing photo with good lighting."
            : "Something went wrong with the AI service. Please try again.",
      raw: t,
    };
  }

  const result = await resp.json();
  const img = extractInlineBase64FromGeminiGenerateContent(result);
  if (!img) {
    return {
      ok: false,
      status: 422,
      error: "Unable to generate try-on image. Please try with a different photo.",
    };
  }

  return {
    ok: true,
    data: { compositeImage: img, provider: "google_gemini" },
  };
};

const callLovableAIGateway = async (opts: {
  imageDataUrl: string;
  prompt: string;
}): Promise<{ ok: true; data: GeneratedTryOn } | { ok: false; status: number; error: string; raw?: string }> => {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return {
      ok: false,
      status: 500,
      error: "AI service not configured",
    };
  }

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Use a second model/provider so we can stay available during Google quota spikes.
      model: "google/gemini-3-pro-image-preview",
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: opts.prompt },
            { type: "image_url", image_url: { url: opts.imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    return {
      ok: false,
      status: resp.status,
      error:
        resp.status === 429
          ? "High demand right now. Please try again in a moment."
          : resp.status === 402
            ? "AI credits are depleted. Please add credits to continue."
            : "Something went wrong with the AI service. Please try again.",
      raw: t,
    };
  }

  const data = await resp.json();
  const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url as string | undefined;
  if (!imageUrl) {
    return {
      ok: false,
      status: 422,
      error: "Unable to generate try-on image. Please try with a different photo.",
    };
  }

  return {
    ok: true,
    data: { compositeImage: imageUrl, provider: "lovable_ai" },
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    const { userPhoto, frameDetails }: TryOnRequest = await req.json();

    if (!userPhoto) {
      return new Response(
        JSON.stringify({ success: false, error: "User photo is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!frameDetails?.name) {
      return json({ success: false, error: "Frame details are required" }, 400);
    }

    console.log(`Processing virtual try-on for frame: ${frameDetails.name}`);

    const prompt = buildPrompt(frameDetails);

    // Prepare image inputs
    const imageBase64 = stripDataUrlPrefix(userPhoto);
    const imageDataUrl = userPhoto.startsWith("data:")
      ? userPhoto
      : `data:image/jpeg;base64,${imageBase64}`;

    // Strategy:
    // 1) Try Google Gemini directly if a key is configured (fastest for your current setup)
    // 2) If it is rate-limited (429) or has a transient 5xx, fall back to Lovable AI gateway

    let generated: GeneratedTryOn | null = null;
    let lastErr: { status: number; error: string } | null = null;

    if (GEMINI_API_KEY) {
      const primary = await callGoogleGemini({
        apiKey: GEMINI_API_KEY,
        imageBase64,
        prompt,
      });

      if (primary.ok) {
        generated = primary.data;
      } else {
        lastErr = { status: primary.status, error: primary.error };
        // Only fall back for rate limiting / transient server errors.
        if (primary.status !== 429 && (primary.status < 500 || primary.status >= 600)) {
          // Non-transient errors (e.g., 400/422) should be returned to user as-is.
          return json({ success: false, error: primary.error }, primary.status);
        }
        console.warn("Primary try-on provider failed, attempting fallback:", {
          status: primary.status,
        });
      }
    }

    if (!generated) {
      const fallback = await callLovableAIGateway({ imageDataUrl, prompt });
      if (fallback.ok) {
        generated = fallback.data;
      } else {
        lastErr = { status: fallback.status, error: fallback.error };
      }
    }

    if (!generated) {
      return json(
        {
          success: false,
          error: lastErr?.error || "Unable to generate try-on image. Please try again.",
        },
        lastErr?.status || 500
      );
    }

    console.log("Virtual try-on generated successfully", { provider: generated.provider });

    return json({
      success: true,
      compositeImage: generated.compositeImage,
      frameDetails,
      provider: generated.provider,
    });

  } catch (error) {
    console.error("Virtual try-on error:", error);
    return json(
      { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" },
      500
    );
  }
});
