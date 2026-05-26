import { ProductImageCarousel, type Frame3DAttributes } from "./ProductImageCarousel";

interface ProductImageGalleryProps {
  mainImage: string | null;
  additionalImages: string[] | null;
  productName: string;
  productId: string;
  variant?: "pdp" | "quickview";
  /** When true the first (primary/locked anchor) image spins 360° */
  isAnchorLocked?: boolean;
  /** Frame measurements/shape for the interactive 3D viewer */
  frame3D?: Frame3DAttributes | null;
}

export const ProductImageGallery = ({
  mainImage,
  additionalImages,
  productName,
  variant = "pdp",
  isAnchorLocked = false,
  frame3D = null,
}: ProductImageGalleryProps) => {
  return (
    <ProductImageCarousel
      mainImage={mainImage}
      additionalImages={additionalImages}
      productName={productName}
      variant={variant}
      isAnchorLocked={isAnchorLocked}
      frame3D={frame3D}
    />
  );
};
