import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface ProductImageGalleryProps {
  mainImage: string | null;
  additionalImages: string[] | null;
  productName: string;
  productId: string;
}

export const ProductImageGallery = ({
  mainImage,
  additionalImages,
  productName,
}: ProductImageGalleryProps) => {
  // Only use actual product images - no mixing with other products
  const hasImages = mainImage || (additionalImages && additionalImages.length > 0);
  const images = mainImage
    ? [mainImage, ...(additionalImages || [])]
    : additionalImages || [];

  const [selectedImage, setSelectedImage] = useState(0);

  // No images - show placeholder state
  if (!hasImages) {
    return (
      <div className="space-y-4">
        <div className="aspect-square rounded-lg overflow-hidden bg-secondary flex flex-col items-center justify-center text-muted-foreground">
          <ImageOff className="h-16 w-16 mb-3 opacity-50" />
          <p className="text-sm font-medium">No images available</p>
          <p className="text-xs mt-1">Product images coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
        <img
          src={images[selectedImage]}
          alt={`${productName} - View ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Gallery - only show if multiple images of the SAME product */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                selectedImage === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
