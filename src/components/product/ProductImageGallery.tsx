import { ProductImageCarousel, type Frame3DAttributes } from "./ProductImageCarousel";

interface ProductImageGalleryProps {
  mainImage: string | null;
  additionalImages: string[] | null;
  productName: string;
  productId: string;
  variant?: "pdp" | "quickview";
  /** Frame measurements/shape for the interactive 3D viewer */
  frame3D?: Frame3DAttributes | null;
  /** Whether the primary image is locked (manual anchor) — currently informational only */
  isAnchorLocked?: boolean;
}

export const ProductImageGallery = ({
  mainImage,
  additionalImages,
  productName,
  variant = "pdp",
  frame3D = null,
}: ProductImageGalleryProps) => {
  return (
    <ProductImageCarousel
      mainImage={mainImage}
      additionalImages={additionalImages}
      productName={productName}
      variant={variant}
      frame3D={frame3D}
    />
  );
};
