import { ProductImageCarousel } from "./ProductImageCarousel";

interface ProductImageGalleryProps {
  mainImage: string | null;
  additionalImages: string[] | null;
  productName: string;
  productId: string;
  variant?: "pdp" | "quickview";
  /** When true the first (primary/locked anchor) image spins 360° */
  isAnchorLocked?: boolean;
}

export const ProductImageGallery = ({
  mainImage,
  additionalImages,
  productName,
  variant = "pdp",
  isAnchorLocked = false,
}: ProductImageGalleryProps) => {
  return (
    <ProductImageCarousel
      mainImage={mainImage}
      additionalImages={additionalImages}
      productName={productName}
      variant={variant}
      isAnchorLocked={isAnchorLocked}
    />
  );
};
