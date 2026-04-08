import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { product_id, image_url, batch } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Batch mode: process multiple products
    if (batch && Array.isArray(batch)) {
      const results: { product_id: string; success: boolean; error?: string }[] = [];

      for (const item of batch) {
        try {
          const overlayUrl = await segmentFrame(item.image_url, LOVABLE_API_KEY);
          if (overlayUrl) {
            // Upload to storage
            const storedUrl = await uploadOverlay(supabase, item.product_id, overlayUrl);
            // Update frame_attributes
            await upsertOverlayUrl(supabase, item.product_id, storedUrl);
            results.push({ product_id: item.product_id, success: true });
          } else {
            results.push({ product_id: item.product_id, success: false, error: "No overlay generated" });
          }
        } catch (e) {
          results.push({ product_id: item.product_id, success: false, error: e.message });
        }
        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 1500));
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single mode
    if (!product_id || !image_url) {
      return new Response(JSON.stringify({ error: "product_id and image_url required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const overlayUrl = await segmentFrame(image_url, LOVABLE_API_KEY);
    if (!overlayUrl) {
      return new Response(JSON.stringify({ error: "Failed to generate overlay" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storedUrl = await uploadOverlay(supabase, product_id, overlayUrl);
    await upsertOverlayUrl(supabase, product_id, storedUrl);

    return new Response(JSON.stringify({ success: true, ar_overlay_url: storedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("segment-frame-image error:", e);
    const status = e.message?.includes("Rate limit") ? 429 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function segmentFrame(imageUrl: string, apiKey: string): Promise<string | null> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a product image segmentation tool for eyewear. Given this image of eyeglasses/sunglasses, generate a NEW image showing ONLY the frame itself — front-facing, no background, no case, no packaging, no display stand. The frame should be isolated on a completely transparent/white background, oriented horizontally as if someone is looking straight at the wearer. Keep the original colors and details of the frame exactly as they appear. If the image shows a frame inside a case or with packaging, extract just the glasses frame. Output a clean, front-facing view of the frame only.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI gateway error:", response.status, errText);
    if (response.status === 429) throw new Error("Rate limit exceeded");
    if (response.status === 402) throw new Error("Payment required");
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  // Look for image content in the response
  const choices = data.choices || [];
  for (const choice of choices) {
    const content = choice.message?.content;
    if (typeof content === "string" && content.startsWith("data:image")) {
      return content;
    }
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url" && part.image_url?.url) {
          return part.image_url.url;
        }
        if (part.type === "image" && part.image?.url) {
          return part.image.url;
        }
      }
    }
  }

  // Check if inline_data is present (Gemini format)
  for (const choice of choices) {
    const parts = choice.message?.content;
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (part.inline_data?.data) {
          return `data:${part.inline_data.mime_type || "image/png"};base64,${part.inline_data.data}`;
        }
      }
    }
  }

  console.error("No image found in response:", JSON.stringify(data).slice(0, 500));
  return null;
}

async function uploadOverlay(
  supabase: any,
  productId: string,
  dataUrl: string
): Promise<string> {
  // Convert data URL or regular URL to blob
  let blob: Blob;

  if (dataUrl.startsWith("data:")) {
    const [header, b64] = dataUrl.split(",");
    const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
    const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    blob = new Blob([binary], { type: mime });
  } else {
    // It's a URL, fetch it
    const resp = await fetch(dataUrl);
    blob = await resp.blob();
  }

  const path = `ar-overlays/${productId}.png`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, blob, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: publicData } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  return publicData.publicUrl;
}

async function upsertOverlayUrl(
  supabase: any,
  productId: string,
  overlayUrl: string
) {
  // Check if frame_attributes row exists
  const { data: existing } = await supabase
    .from("frame_attributes")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("frame_attributes")
      .update({ ar_overlay_url: overlayUrl })
      .eq("product_id", productId);
    if (error) throw new Error(`Update failed: ${error.message}`);
  } else {
    const { error } = await supabase
      .from("frame_attributes")
      .insert({ product_id: productId, ar_overlay_url: overlayUrl });
    if (error) throw new Error(`Insert failed: ${error.message}`);
  }
}
