// Seed primary product images from bundled frame_images/ or admin-uploaded files.
// Auth: admin / super_admin only. Storage writes go through the user's JWT.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKET = "product-images";

type UploadedFile = { sku: string; filename: string; contentType?: string; dataBase64: string };

const skuFromFilename = (name: string): string | null => {
  const m = name.match(/^(MH-[A-Za-z0-9]+)/i);
  return m ? m[1].toUpperCase() : null;
};

const extFromName = (name: string): string => {
  const m = name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m ? m[1].replace("jpeg", "jpg") : "jpg";
};

const contentTypeFor = (ext: string): string => {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
};

const b64ToBytes = (b64: string): Uint8Array => {
  // strip data: prefix if present
  const clean = b64.includes(",") ? b64.split(",", 2)[1] : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function loadBundled(): Promise<Array<{ sku: string; bytes: Uint8Array; ext: string }>> {
  const dir = new URL("./frame_images/", import.meta.url);
  const out: Array<{ sku: string; bytes: Uint8Array; ext: string }> = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (!entry.isFile) continue;
      const sku = skuFromFilename(entry.name);
      if (!sku) continue;
      const ext = extFromName(entry.name);
      const bytes = await Deno.readFile(new URL(entry.name, dir));
      out.push({ sku, bytes, ext });
    }
  } catch (e) {
    console.error("loadBundled error", e);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const [adminCheck, superCheck] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    ]);
    if (!adminCheck.data && !superCheck.data) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode: "dry_run" | "commit" = body?.mode === "commit" ? "commit" : "dry_run";
    const source: "bundled" | "upload" = body?.source === "upload" ? "upload" : "bundled";
    const skipFilled: boolean = body?.skipFilled !== false;
    const target: "seed" | "anchor" | "both" =
      body?.target === "anchor" || body?.target === "both" ? body.target : "seed";
    const doSeed = target === "seed" || target === "both";
    const doAnchor = target === "anchor" || target === "both";


    // Build file list (sku, ext, bytes? only on commit for bundled; uploads always carry bytes)
    type FileEntry = { sku: string; ext: string; bytes?: Uint8Array; filename: string };
    let files: FileEntry[] = [];

    if (source === "bundled") {
      const loaded = await loadBundled();
      files = loaded.map((f) => ({ sku: f.sku, ext: f.ext, bytes: f.bytes, filename: `${f.sku}.${f.ext}` }));
    } else {
      const uploads: UploadedFile[] = Array.isArray(body?.files) ? body.files : [];
      files = uploads
        .map((u) => {
          const sku = u.sku || skuFromFilename(u.filename);
          if (!sku) return null;
          const ext = extFromName(u.filename);
          const bytes = b64ToBytes(u.dataBase64);
          return { sku: sku.toUpperCase(), ext, bytes, filename: u.filename };
        })
        .filter(Boolean) as FileEntry[];
    }

    const skus = Array.from(new Set(files.map((f) => f.sku)));
    if (skus.length === 0) {
      return new Response(
        JSON.stringify({ mode, matched: 0, unmatched: [], plan: [], wouldUpload: 0, skipped: 0, uploads: [], errors: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Lookup matching products
    const chunk = <T>(arr: T[], size: number): T[][] => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };
    const productMap = new Map<string, { id: string; sku: string; image_url: string | null; additional_images: string[] | null; primary_image_locked: boolean | null }>();
    for (const c of chunk(skus, 500)) {
      const { data, error } = await supabase
        .from("products")
        .select("id, sku, image_url, additional_images, primary_image_locked")
        .in("sku", c);
      if (error) throw error;
      for (const row of data ?? []) productMap.set(row.sku, row as any);
    }

    type PlanEntry = {
      sku: string;
      filename: string;
      action: "set_primary" | "append_additional" | "skip" | "unmatched";
      hadPrimary: boolean;
      sizeBytes: number;
    };
    const plan: PlanEntry[] = [];
    for (const f of files) {
      const prod = productMap.get(f.sku);
      if (!prod) {
        plan.push({ sku: f.sku, filename: f.filename, action: "unmatched", hadPrimary: false, sizeBytes: f.bytes?.length ?? 0 });
        continue;
      }
      const hadPrimary = !!(prod.image_url && String(prod.image_url).trim());
      let action: PlanEntry["action"];
      if (!hadPrimary) action = "set_primary";
      else if (skipFilled) action = "append_additional";
      else action = "set_primary";
      plan.push({ sku: f.sku, filename: f.filename, action, hadPrimary, sizeBytes: f.bytes?.length ?? 0 });
    }

    const unmatched = plan.filter((p) => p.action === "unmatched").map((p) => p.sku);
    const wouldUpload = plan.filter((p) => p.action === "set_primary" || p.action === "append_additional").length;

    if (mode === "dry_run") {
      return new Response(
        JSON.stringify({
          mode,
          matched: plan.length - unmatched.length,
          unmatched,
          unmatchedCount: unmatched.length,
          wouldUpload,
          plan,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // COMMIT
    const uploads: Array<{ sku: string; url: string; action: string }> = [];
    const anchorUploads: Array<{ sku: string; path: string }> = [];
    const errors: Array<{ sku: string; error: string }> = [];

    for (const f of files) {
      const prod = productMap.get(f.sku);
      if (!prod || !f.bytes) continue;
      try {
        // SEED upload (versioned path, sets/appends product image_url)
        if (doSeed) {
          const path = `seed/${f.sku}-${Date.now()}.${f.ext}`;
          const blob = new Blob([f.bytes], { type: contentTypeFor(f.ext) });
          const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
            contentType: contentTypeFor(f.ext),
            upsert: true,
          });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
          const url = pub.publicUrl;

          const hadPrimary = !!(prod.image_url && String(prod.image_url).trim());
          if (!hadPrimary || !skipFilled) {
            const { error } = await supabase.from("products").update({ image_url: url }).eq("id", prod.id);
            if (error) throw error;
            uploads.push({ sku: f.sku, url, action: "set_primary" });
            prod.image_url = url;
          } else {
            const existing = Array.isArray(prod.additional_images) ? prod.additional_images : [];
            if (!existing.includes(url)) {
              const next = [...existing, url];
              const { error } = await supabase.from("products").update({ additional_images: next }).eq("id", prod.id);
              if (error) throw error;
              prod.additional_images = next;
            }
            uploads.push({ sku: f.sku, url, action: "append_additional" });
          }
        }

        // ANCHOR upload (bucket root MH-XXX.{ext} so link-anchor-images can find it)
        // Skip products whose anchor is already locked — never overwrite the source of truth.
        if (doAnchor && !prod.primary_image_locked) {
          const anchorPath = `${f.sku}.${f.ext}`;
          const blob2 = new Blob([f.bytes], { type: contentTypeFor(f.ext) });
          const { error: anchorErr } = await supabase.storage.from(BUCKET).upload(anchorPath, blob2, {
            contentType: contentTypeFor(f.ext),
            upsert: true,
          });
          if (anchorErr) throw anchorErr;
          anchorUploads.push({ sku: f.sku, path: anchorPath });
        }
      } catch (e) {
        errors.push({ sku: f.sku, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({
        mode,
        target,
        matched: plan.length - unmatched.length,
        unmatched,
        unmatchedCount: unmatched.length,
        uploaded: uploads.length,
        anchorUploaded: anchorUploads.length,
        uploads,
        anchorUploads,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("seed-product-images error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
