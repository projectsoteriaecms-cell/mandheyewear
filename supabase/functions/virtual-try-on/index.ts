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
  usedFrameReference: boolean;
};

const json = (body: unknown, status = 200, extraHeaders: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });

const stripDataUrlPrefix = (maybeDataUrl: string) =>
  maybeDataUrl.includes("base64,") ? maybeDataUrl.split("base64,")[1] : maybeDataUrl;

/**
 * Fetches a frame image from URL and converts it to base64
 */
const fetchFrameImageAsBase64 = async (imageUrl: string): Promise<{ base64: string; mimeType: string } | null> => {
  try {
    console.log("Fetching frame reference image:", imageUrl);
    const response = await fetch(imageUrl, { 
      headers: { "Accept": "image/*" },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      console.warn("Failed to fetch frame image:", response.status);
      return null;
    }
    
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    
    console.log("Frame image fetched successfully, size:", uint8Array.length);
    return { base64, mimeType: contentType.split(";")[0] };
  } catch (error) {
    console.warn("Error fetching frame image:", error);
    return null;
  }
};

const buildPrompt = (frameDetails: TryOnRequest["frameDetails"], hasFrameReference: boolean) => {
  const frameDescription = [
    frameDetails.name,
    frameDetails.color && `in ${frameDetails.color} color`,
    frameDetails.style && `${frameDetails.style} style`,
  ]
    .filter(Boolean)
    .join(" ");

  if (hasFrameReference) {
    // Enhanced prompt when we have the actual frame image
    return `You are an expert eyewear designer and photo editor.

IMPORTANT: You have been provided with TWO images:
1. FIRST IMAGE: The exact eyeglasses frame that must be applied (reference frame)
2. SECOND IMAGE: The user's front-facing face photo

Your task:
- Apply the EXACT glasses from the first image onto the person in the second image
- You MUST replicate the exact frame design from the reference - same shape, color, material appearance, temple style, and all design details
- Do NOT create a different frame design or modify the frame appearance
- The glasses should be properly scaled to match the face width
- Position the glasses correctly on the nose bridge, aligned with the eyes
- Follow the natural perspective and lighting of the face photo
- The result should look like a real photograph, not a digital overlay
- Maintain the original photo quality and background
- Ensure the frame temples extend naturally towards the ears

Frame details for reference: ${frameDescription}

Generate a complete, photorealistic image of the person wearing the EXACT glasses from the reference image.`;
  }

  // Fallback prompt when no frame reference image is available
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
  userImageBase64: string;
  frameImageBase64?: string;
  frameImageMimeType?: string;
  prompt: string;
}): Promise<{ ok: true; data: GeneratedTryOn } | { ok: false; status: number; error: string; raw?: string }> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${opts.apiKey}`;

  // Build parts array - frame image first (if available), then user photo, then text
  const parts: any[] = [];
  
  if (opts.frameImageBase64 && opts.frameImageMimeType) {
    // Add frame reference image first
    parts.push({
      inlineData: {
        mimeType: opts.frameImageMimeType,
        data: opts.frameImageBase64,
      },
    });
  }
  
  // Add user photo
  parts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: opts.userImageBase64,
    },
  });
  
  // Add prompt text
  parts.push({ text: opts.prompt });

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
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
    data: { 
      compositeImage: img, 
      provider: "google_gemini",
      usedFrameReference: !!opts.frameImageBase64 
    },
  };
};

const callLovableAIGateway = async (opts: {
  userImageDataUrl: string;
  frameImageDataUrl?: string;
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

  // Build content array with images
  const content: any[] = [
    { type: "text", text: opts.prompt },
  ];
  
  // Add frame reference image first if available
  if (opts.frameImageDataUrl) {
    content.push({ type: "image_url", image_url: { url: opts.frameImageDataUrl } });
  }
  
  // Add user photo
  content.push({ type: "image_url", image_url: { url: opts.userImageDataUrl } });

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content,
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
    data: { 
      compositeImage: imageUrl, 
      provider: "lovable_ai",
      usedFrameReference: !!opts.frameImageDataUrl 
    },
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
      return json({ success: false, error: "User photo is required" }, 400);
    }

    if (!frameDetails?.name) {
      return json({ success: false, error: "Frame details are required" }, 400);
    }

    console.log(`Processing virtual try-on for frame: ${frameDetails.name}`);

    // Handle userPhoto: could be base64 data URL or a remote URL
    let userImageBase64: string;
    let userImageDataUrl: string;

    if (userPhoto.startsWith("http://") || userPhoto.startsWith("https://")) {
      // It's a URL - fetch it and convert to base64
      console.log("Fetching user photo from URL:", userPhoto.substring(0, 80) + "...");
      const fetched = await fetchFrameImageAsBase64(userPhoto);
      if (!fetched) {
        return json({ success: false, error: "Could not load your saved photo. Please upload a new one." }, 400);
      }
      userImageBase64 = fetched.base64;
      userImageDataUrl = `data:${fetched.mimeType};base64,${fetched.base64}`;
    } else {
      userImageBase64 = stripDataUrlPrefix(userPhoto);
      userImageDataUrl = userPhoto.startsWith("data:")
        ? userPhoto
        : `data:image/jpeg;base64,${userImageBase64}`;
    }

    // Try to fetch the frame reference image
    let frameImage: { base64: string; mimeType: string } | null = null;
    if (frameDetails.imageUrl) {
      frameImage = await fetchFrameImageAsBase64(frameDetails.imageUrl);
    }
    
    const hasFrameReference = !!frameImage;
    console.log(`Frame reference image available: ${hasFrameReference}`);

    const prompt = buildPrompt(frameDetails, hasFrameReference);
    
    const frameImageDataUrl = frameImage 
      ? `data:${frameImage.mimeType};base64,${frameImage.base64}`
      : undefined;

    // Strategy:
    // 1) Try Google Gemini directly if a key is configured (fastest for your current setup)
    // 2) If it is rate-limited (429) or has a transient 5xx, fall back to Lovable AI gateway

    let generated: GeneratedTryOn | null = null;
    let lastErr: { status: number; error: string } | null = null;

    if (GEMINI_API_KEY) {
      const primary = await callGoogleGemini({
        apiKey: GEMINI_API_KEY,
        userImageBase64,
        frameImageBase64: frameImage?.base64,
        frameImageMimeType: frameImage?.mimeType,
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
      const fallback = await callLovableAIGateway({ 
        userImageDataUrl, 
        frameImageDataUrl,
        prompt 
      });
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

    console.log("Virtual try-on generated successfully", { 
      provider: generated.provider,
      usedFrameReference: generated.usedFrameReference 
    });

    return json({
      success: true,
      compositeImage: generated.compositeImage,
      frameDetails,
      provider: generated.provider,
      usedFrameReference: generated.usedFrameReference,
    });

  } catch (error) {
    console.error("Virtual try-on error:", error);
    return json(
      { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" },
      500
    );
  }
});
