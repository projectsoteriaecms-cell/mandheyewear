import { useState } from "react";
import { cn } from "@/lib/utils";

// Import placeholder images
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const placeholderImages = [frame1, frame2, frame3, frame4];

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
  productId,
}: ProductImageGalleryProps) => {
  // Generate placeholder images based on product ID
  const getPlaceholders = () => {
    const startIndex = productId.charCodeAt(0) % placeholderImages.length;
    return [
      placeholderImages[startIndex],
      placeholderImages[(startIndex + 1) % placeholderImages.length],
      placeholderImages[(startIndex + 2) % placeholderImages.length],
      placeholderImages[(startIndex + 3) % placeholderImages.length],
    ];
  };

  const images = mainImage
    ? [mainImage, ...(additionalImages || [])]
    : getPlaceholders();

  const [selectedImage, setSelectedImage] = useState(0);

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

      {/* Thumbnail Gallery */}
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
