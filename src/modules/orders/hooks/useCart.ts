import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import type { Tables } from "@/integrations/supabase/types";
import type { LensConfig } from "@/modules/lens/components/LensConfigurator";

export type CartItem = Tables<"cart_items"> & {
  product: Tables<"products"> | null;
};

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackAddToCart } = useMetaPixel();
  const queryClient = useQueryClient();
  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      lensConfig,
    }: {
      productId: string;
      quantity?: number;
      lensConfig?: LensConfig;
    }) => {
      if (!user) throw new Error("Please log in to add items to your cart");

      // For prescription lens items, always insert a fresh row (different lens configs)
      // For plain items (no lens config), upsert by product_id
      const lensColumns = lensConfig
        ? {
            lens_type:        lensConfig.lensType,
            lens_index:       lensConfig.lensIndex,
            lens_coatings:    lensConfig.lensCoatings,
            prescription_id:  lensConfig.prescriptionId,
            prescription_data: lensConfig.prescriptionData,
            requires_fitting: lensConfig.requiresFitting,
            fitting_booked:   lensConfig.fittingBooked,
            lens_price:       lensConfig.lensPrice,
            frame_only:       lensConfig.frameOnly,
          }
        : {};

      const hasLens = !!lensConfig && lensConfig.lensType !== "frame_only";

      if (!hasLens) {
        // Upsert: increment quantity if same product already in cart without lens config
        const { data: existing } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .is("lens_type", null)
          .maybeSingle();

        if (existing) {
          const { data, error } = await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + quantity })
            .eq("id", existing.id)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      }

      // Always insert for lens-configured items (each config is unique)
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          user_id:    user.id,
          product_id: productId,
          quantity,
          ...lensColumns,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      
      supabase
        .from("products")
        .select("price")
        .eq("id", variables.productId)
        .single()
        .then(({ data: product }) => {
          if (product) {
            trackAddToCart({
              content_ids: [variables.productId],
              content_type: "product",
              value: product.price * (variables.quantity || 1),
              currency: "NGN",
            });
          }
        });
      
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Cannot Add to Cart",
        description: error.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", cartItemId);

        if (error) throw error;
        return null;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart.",
        variant: "destructive",
      });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      toast({
        title: "Removed",
        description: "Item removed from cart.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item.",
        variant: "destructive",
      });
    },
  });

  const updateCartItemLens = useMutation({
    mutationFn: async ({
      cartItemId,
      lensConfig,
    }: {
      cartItemId: string;
      lensConfig: {
        lens_type: string | null;
        lens_index: string | null;
        lens_coatings: string[] | null;
        lens_price: number;
        prescription_id: string | null;
        prescription_data: Record<string, unknown> | null;
        requires_fitting: boolean;
        fitting_booked: boolean;
        frame_only: boolean;
      };
    }) => {
      const { error } = await supabase
        .from("cart_items")
        .update(lensConfig as never)
        .eq("id", cartItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update lens selection.",
        variant: "destructive",
      });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const cartItems = cartQuery.data || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + ((item.product?.price || 0) + ((item as any).lens_price || 0)) * item.quantity,
    0
  );

  return {
    cartItems,
    cartCount,
    updateCartItemLens,
    cartTotal,
    isLoading: cartQuery.isLoading,
    canAddToCart: !!user,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
};