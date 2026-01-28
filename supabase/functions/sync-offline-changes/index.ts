import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SyncOperation {
  id: number;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  tempId?: string;
}

interface SyncResult {
  id: number;
  tempId?: string;
  success: boolean;
  serverId?: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { operations } = await req.json() as { operations: SyncOperation[] };

    if (!operations || !Array.isArray(operations)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid operations array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: SyncResult[] = [];

    // Process each operation
    for (const op of operations) {
      try {
        const result = await processOperation(supabase, user.id, op);
        results.push(result);
      } catch (err) {
        results.push({
          id: op.id,
          tempId: op.tempId,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const allSuccessful = results.every((r) => r.success);

    return new Response(
      JSON.stringify({
        success: allSuccessful,
        results,
        message: allSuccessful
          ? `Successfully synced ${results.length} operations`
          : `Synced with ${results.filter((r) => !r.success).length} failures`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processOperation(
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  op: SyncOperation
): Promise<SyncResult> {
  const { id, type, payload, tempId } = op;

  switch (type) {
    // ==================== CART OPERATIONS ====================
    case "cart_add": {
      const { productId, quantity = 1 } = payload as { productId: string; quantity?: number };

      // Check if item already exists
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from("cart_items")
          .update({ quantity: (existing as any).quantity + quantity })
          .eq("id", (existing as any).id)
          .select("id")
          .single();

        if (error) throw error;
        return { id, tempId, success: true, serverId: (data as any).id };
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("cart_items")
          .insert({ user_id: userId, product_id: productId, quantity })
          .select("id")
          .single();

        if (error) throw error;
        return { id, tempId, success: true, serverId: (data as any).id };
      }
    }

    case "cart_update": {
      const { cartItemId, quantity } = payload as { cartItemId: string; quantity: number };

      if (quantity <= 0) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", cartItemId)
          .eq("user_id", userId);

        if (error) throw error;
        return { id, tempId, success: true };
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId)
        .eq("user_id", userId);

      if (error) throw error;
      return { id, tempId, success: true, serverId: cartItemId };
    }

    case "cart_remove": {
      const { cartItemId } = payload as { cartItemId: string };

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId)
        .eq("user_id", userId);

      if (error) throw error;
      return { id, tempId, success: true };
    }

    case "cart_clear": {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      return { id, tempId, success: true };
    }

    // ==================== WISHLIST OPERATIONS ====================
    case "wishlist_add": {
      const { productId } = payload as { productId: string };

      // Check if already exists
      const { data: existing } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        // Already exists, consider success
        return { id, tempId, success: true, serverId: (existing as any).id };
      }

      const { data, error } = await supabase
        .from("wishlist")
        .insert({ user_id: userId, product_id: productId })
        .select("id")
        .single();

      if (error) throw error;
      return { id, tempId, success: true, serverId: (data as any).id };
    }

    case "wishlist_remove": {
      const { productId } = payload as { productId: string };

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (error) throw error;
      return { id, tempId, success: true };
    }

    // ==================== PROFILE OPERATIONS ====================
    case "profile_update": {
      const { updates } = payload as { updates: Record<string, unknown> };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);

      if (error) throw error;
      return { id, tempId, success: true };
    }

    // ==================== POLL RESPONSE OPERATIONS ====================
    case "poll_response": {
      const { pollId, response } = payload as { pollId: string; response: unknown };

      // Check if response exists
      const { data: existing } = await supabase
        .from("poll_responses")
        .select("id")
        .eq("user_id", userId)
        .eq("poll_id", pollId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("poll_responses")
          .update({ response })
          .eq("id", (existing as any).id);

        if (error) throw error;
        return { id, tempId, success: true, serverId: (existing as any).id };
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("poll_responses")
          .insert({ user_id: userId, poll_id: pollId, response })
          .select("id")
          .single();

        if (error) throw error;
        return { id, tempId, success: true, serverId: (data as any).id };
      }
    }

    // ==================== APPOINTMENT OPERATIONS ====================
    case "appointment_create": {
      const appointmentData = payload as {
        branch_id: string;
        scheduled_date: string;
        scheduled_time: string;
        service_type: string;
        notes?: string;
      };

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: userId,
          ...appointmentData,
        })
        .select("id")
        .single();

      if (error) throw error;
      return { id, tempId, success: true, serverId: (data as any).id };
    }

    case "appointment_cancel": {
      const { appointmentId } = payload as { appointmentId: string };

      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId)
        .eq("user_id", userId);

      if (error) throw error;
      return { id, tempId, success: true };
    }

    default:
      return {
        id,
        tempId,
        success: false,
        error: `Unknown operation type: ${type}`,
      };
  }
}
