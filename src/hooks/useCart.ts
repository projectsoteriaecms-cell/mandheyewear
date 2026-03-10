import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import type { Tables } from "@/integrations/supabase/types";

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
    }: {
      productId: string;
      quantity?: number;
    }) => {
      if (!user) throw new Error("Please log in to add items to your cart");

      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
      
      // Track AddToCart event for Meta Pixel
      // Fetch product price for tracking
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
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return {
    cartItems,
    cartCount,
    cartTotal,
    isLoading: cartQuery.isLoading,
    canAddToCart: !!user,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
};
