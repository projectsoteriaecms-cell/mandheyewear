// Seed product descriptions + frame attributes from bundled JSON or uploaded payload.
// Auth: admin or super_admin only. Writes go through the user's JWT — no service_role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------- Helpers ----------
const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const m = String(v).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

const bool = (v: unknown): boolean | null => {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).trim().toLowerCase();
  if (["yes", "true", "y", "1"].includes(s)) return true;
  if (["no", "false", "n", "0"].includes(s)) return false;
  return null;
};

const parseRange = (v: unknown): [number | null, number | null] => {
  if (!v) return [null, null];
  const s = String(v).replace(/[–—]/g, "-");
  const nums = s.match(/-?\d+(\.\d+)?/g);
  if (!nums || nums.length === 0) return [null, null];
  if (nums.length === 1) return [Number(nums[0]), Number(nums[0])];
  return [Number(nums[0]), Number(nums[1])];
};

const buildDescriptionHtml = (rich: any): { text: string; html: string } | null => {
  const short = rich?.short_description ? String(rich.short_description).trim() : "";
  const bullets: string[] = Array.isArray(rich?.bullets) ? rich.bullets.filter(Boolean) : [];
  if (!short && bullets.length === 0) return null;
  const html =
    (short ? `<p>${short}</p>` : "") +
    (bullets.length
      ? `<ul>${bullets.map((b) => `<li>${String(b).trim()}</li>`).join("")}</ul>`
      : "");
  const text =
    (short ? short + "\n\n" : "") +
    (bullets.length ? bullets.map((b) => `• ${String(b).trim()}`).join("\n") : "");
  return { text, html };
};

// Build patches per SKU from rich + structured sources.
function buildPatches(rich: Record<string, any>, structured: Record<string, any>) {
  const skus = new Set<string>([...Object.keys(rich || {}), ...Object.keys(structured || {})]);
  const result: Array<{ sku: string; productPatch: Record<string, any>; framePatch: Record<string, any> }> = [];

  for (const sku of skus) {
    const r = rich?.[sku] ?? {};
    const s = structured?.[sku] ?? {};

    const productPatch: Record<string, any> = {};
    if (r.headline) productPatch.tagline = String(r.headline).trim();
    const desc = buildDescriptionHtml(r);
    if (desc) {
      productPatch.description = desc.text;
      productPatch.description_html = desc.html;
    }

    const framePatch: Record<string, any> = {};
    // From rich specs
    if (r.specs?.lens_height) framePatch.lens_height = num(r.specs.lens_height);
    if (r.specs?.total_frame_width) framePatch.total_width = num(r.specs.total_frame_width);
    if (r.specs?.lens_width) framePatch.lens_width = num(r.specs.lens_width);
    if (r.specs?.bridge_width) framePatch.bridge_size = num(r.specs.bridge_width);
    if (r.specs?.temple_length) framePatch.temple_length = num(r.specs.temple_length);
    // From rich fit
    if (r.fit?.size) framePatch.size_label = String(r.fit.size).trim();
    if (r.fit?.pd_range) {
      const [a, b] = parseRange(r.fit.pd_range);
      if (a !== null) framePatch.pd_range_min = Math.round(a);
      if (b !== null) framePatch.pd_range_max = Math.round(b);
    }
    if (r.fit?.rx_range) {
      const [a, b] = parseRange(r.fit.rx_range);
      if (a !== null) framePatch.rx_sph_min = a;
      if (b !== null) framePatch.rx_sph_max = b;
    }
    if (r.fit?.progressive !== undefined) {
      const pc = bool(r.fit.progressive);
      if (pc !== null) framePatch.progressive_compatible = pc;
    }
    if (r.fit?.frame_shape) framePatch.frame_shape = String(r.fit.frame_shape).trim();
    if (r.fit?.frame_material) framePatch.frame_material = String(r.fit.frame_material).trim();
    // From style guide
    if (r.style_guide?.face_shapes) framePatch.best_for_faces = String(r.style_guide.face_shapes).trim();
    if (r.style_guide?.occasions) framePatch.best_for_occasions = String(r.style_guide.occasions).trim();

    // Structured fallbacks
    if (framePatch.lens_width == null && s.lens_width != null) framePatch.lens_width = num(s.lens_width);
    if (framePatch.bridge_size == null && s.bridge_width != null) framePatch.bridge_size = num(s.bridge_width);
    if (framePatch.temple_length == null && s.temple_length != null) framePatch.temple_length = num(s.temple_length);
    if (framePatch.lens_height == null && s.lens_height != null) framePatch.lens_height = num(s.lens_height);
    if (framePatch.total_width == null && s.total_frame_width != null) framePatch.total_width = num(s.total_frame_width);
    if (framePatch.size_label == null && s.size_label) framePatch.size_label = String(s.size_label).trim();
    if (framePatch.frame_shape == null && s.frame_shape) framePatch.frame_shape = String(s.frame_shape).trim();
    if (framePatch.frame_material == null && s.frame_material) framePatch.frame_material = String(s.frame_material).trim();
    if (framePatch.pd_range_min == null && s.pd_range) {
      const [a, b] = parseRange(s.pd_range);
      if (a !== null) framePatch.pd_range_min = Math.round(a);
      if (b !== null) framePatch.pd_range_max = Math.round(b);
    }
    if (framePatch.rx_sph_min == null && s.rx_range) {
      const [a, b] = parseRange(s.rx_range);
      if (a !== null) framePatch.rx_sph_min = a;
      if (b !== null) framePatch.rx_sph_max = b;
    }
    if (framePatch.progressive_compatible == null && s.progressive !== undefined) {
      const pc = bool(s.progressive);
      if (pc !== null) framePatch.progressive_compatible = pc;
    }

    // Drop null/undefined
    for (const k of Object.keys(framePatch)) if (framePatch[k] == null) delete framePatch[k];

    if (Object.keys(productPatch).length === 0 && Object.keys(framePatch).length === 0) continue;
    result.push({ sku, productPatch, framePatch });
  }
  return result;
}

async function loadBundled(): Promise<{ rich: any; structured: any }> {
  const dir = new URL(".", import.meta.url);
  const rich = JSON.parse(await Deno.readTextFile(new URL("./frame_descriptions.json", dir)));
  const structured = JSON.parse(await Deno.readTextFile(new URL("./frame_data.json", dir)));
  return { rich, structured };
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

    let rich: any = {};
    let structured: any = {};
    if (source === "bundled") {
      const loaded = await loadBundled();
      rich = loaded.rich;
      structured = loaded.structured;
    } else {
      rich = body?.payload?.rich ?? body?.payload ?? {};
      structured = body?.payload?.structured ?? {};
    }

    const patches = buildPatches(rich, structured);
    const allSkus = patches.map((p) => p.sku);
    if (allSkus.length === 0) {
      return new Response(JSON.stringify({ mode, matched: 0, unmatched: [], changes: [], skipped: 0, committed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch matching products in chunks (in() limit safety)
    const chunk = <T>(arr: T[], size: number): T[][] => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };
    const productMap = new Map<string, { id: string; description: string | null; tagline: string | null }>();
    for (const c of chunk(allSkus, 500)) {
      const { data, error } = await supabase
        .from("products")
        .select("id, sku, description, tagline")
        .in("sku", c);
      if (error) throw error;
      for (const row of data ?? []) productMap.set(row.sku, row);
    }

    // Fetch existing frame_attributes for the matched products
    const productIds = Array.from(productMap.values()).map((p) => p.id);
    const frameMap = new Map<string, Record<string, any>>();
    for (const c of chunk(productIds, 500)) {
      const { data, error } = await supabase
        .from("frame_attributes")
        .select(
          "product_id, lens_height, total_width, lens_width, bridge_size, temple_length, size_label, pd_range_min, pd_range_max, rx_sph_min, rx_sph_max, progressive_compatible, frame_shape, frame_material, best_for_faces, best_for_occasions"
        )
        .in("product_id", c);
      if (error) throw error;
      for (const row of data ?? []) frameMap.set(row.product_id, row);
    }

    const unmatched: string[] = [];
    const changes: Array<{
      sku: string;
      product_id: string;
      productChanges: Record<string, { from: any; to: any }>;
      frameChanges: Record<string, { from: any; to: any }>;
      skipped: boolean;
    }> = [];

    for (const p of patches) {
      const prod = productMap.get(p.sku);
      if (!prod) {
        unmatched.push(p.sku);
        continue;
      }
      const existingFrame = frameMap.get(prod.id) ?? {};
      const productChanges: Record<string, { from: any; to: any }> = {};
      const frameChanges: Record<string, { from: any; to: any }> = {};

      const filled = (v: any) => v !== null && v !== undefined && String(v).trim() !== "";

      for (const [k, v] of Object.entries(p.productPatch)) {
        const cur = (prod as any)[k];
        if (skipFilled && filled(cur)) continue;
        if (cur !== v) productChanges[k] = { from: cur ?? null, to: v };
      }
      for (const [k, v] of Object.entries(p.framePatch)) {
        const cur = (existingFrame as any)[k];
        if (skipFilled && filled(cur)) continue;
        if (cur !== v) frameChanges[k] = { from: cur ?? null, to: v };
      }
      const skipped = Object.keys(productChanges).length === 0 && Object.keys(frameChanges).length === 0;
      changes.push({ sku: p.sku, product_id: prod.id, productChanges, frameChanges, skipped });
    }

    if (mode === "dry_run") {
      return new Response(
        JSON.stringify({
          mode,
          matched: changes.length,
          unmatched,
          unmatchedCount: unmatched.length,
          wouldChange: changes.filter((c) => !c.skipped).length,
          skipped: changes.filter((c) => c.skipped).length,
          changes,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // COMMIT
    let productsUpdated = 0;
    let framesUpserted = 0;
    const errors: Array<{ sku: string; error: string }> = [];

    for (const c of changes) {
      if (c.skipped) continue;
      try {
        if (Object.keys(c.productChanges).length > 0) {
          const patch: Record<string, any> = {};
          for (const [k, v] of Object.entries(c.productChanges)) patch[k] = v.to;
          const { error } = await supabase.from("products").update(patch).eq("id", c.product_id);
          if (error) throw error;
          productsUpdated++;
        }
        if (Object.keys(c.frameChanges).length > 0) {
          const patch: Record<string, any> = { product_id: c.product_id };
          for (const [k, v] of Object.entries(c.frameChanges)) patch[k] = v.to;
          const existing = frameMap.get(c.product_id);
          if (existing) {
            const { error } = await supabase
              .from("frame_attributes")
              .update(patch)
              .eq("product_id", c.product_id);
            if (error) throw error;
          } else {
            const { error } = await supabase.from("frame_attributes").insert(patch);
            if (error) throw error;
          }
          framesUpserted++;
        }
      } catch (e) {
        errors.push({ sku: c.sku, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({
        mode,
        matched: changes.length,
        unmatched,
        unmatchedCount: unmatched.length,
        productsUpdated,
        framesUpserted,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("seed-product-descriptions error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
