import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/modules/orders/hooks/useWishlist";
import { useCart } from "@/modules/orders/hooks/useCart";
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react";

// Import placeholder images
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const placeholderImages = [frame1, frame2, frame3, frame4];

const getPlaceholderImage = (productId: string) => {
  const index = productId.charCodeAt(0) % placeholderImages.length;
  return placeholderImages[index];
};

export const WishlistSection = () => {
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            My Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          My Wishlist ({wishlistItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {wishlistItems.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Your wishlist is empty
            </p>
            <Button variant="hero" asChild>
              <Link to="/shop">Browse Eyewear</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link to={`/product/${item.product_id}`}>
                  <div className="aspect-square bg-secondary relative overflow-hidden">
                    <img
                      src={
                        item.product?.image_url ||
                        getPlaceholderImage(item.product_id)
                      }
                      alt={item.product?.name || "Product"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-3">
                  <Link
                    to={`/product/${item.product_id}`}
                    className="font-medium text-sm line-clamp-1 hover:text-primary"
                  >
                    {item.product?.name}
                  </Link>
                  <p className="text-accent font-bold text-sm mt-1">
                    ₦{(item.product?.price || 0).toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="hero"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        if (item.product_id) {
                          addToCart.mutate({ productId: item.product_id });
                        }
                      }}
                      disabled={addToCart.isPending}
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromWishlist.mutate(item.product_id)}
                      disabled={removeFromWishlist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
