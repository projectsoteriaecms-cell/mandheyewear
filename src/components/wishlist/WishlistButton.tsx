import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/modules/orders/hooks/useWishlist";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "full";
  className?: string;
}

export const WishlistButton = ({
  productId,
  variant = "icon",
  className,
}: WishlistButtonProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(productId);
  const isLoading = toggleWishlist.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggleWishlist.mutate(productId);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
          className
        )}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              inWishlist ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? "secondary" : "outline"}
      className={cn("gap-2", className)}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4",
            inWishlist ? "fill-red-500 text-red-500" : ""
          )}
        />
      )}
      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
    </Button>
  );
};
