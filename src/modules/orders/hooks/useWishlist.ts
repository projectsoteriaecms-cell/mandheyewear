import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { useToast } from "@/shared/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { PUBLIC_PRODUCT_COLUMNS } from "@/modules/products";

export type WishlistItem = Tables<"wishlist"> & {
  product: Tables<"products"> | null;
};

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // product:products (*) fails outright -- the products table uses
      // column-level grants, and a wildcard select requires a grant on every
      // column. This threw on every call, so the wishlist silently rendered
      // empty regardless of what was actually saved.
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          *,
          product:products (${PUBLIC_PRODUCT_COLUMNS})
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast({
        title: "Added to Wishlist",
        description: "Item saved to your wishlist.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast({
          title: "Already in Wishlist",
          description: "This item is already in your wishlist.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add to wishlist.",
          variant: "destructive",
        });
      }
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast({
        title: "Removed",
        description: "Item removed from wishlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist.",
        variant: "destructive",
      });
    },
  });

  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const isInWishlist = wishlistItems.some(
        (item) => item.product_id === productId
      );

      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(productId);
      } else {
        await addToWishlist.mutateAsync(productId);
      }
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistQuery.data?.some((item) => item.product_id === productId) ?? false;
  };

  const wishlistItems = wishlistQuery.data || [];
  const wishlistCount = wishlistItems.length;

  return {
    wishlistItems,
    wishlistCount,
    isLoading: wishlistQuery.isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
  };
};