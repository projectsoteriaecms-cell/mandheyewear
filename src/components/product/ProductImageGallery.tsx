import { ProductImageCarousel } from "./ProductImageCarousel";

interface ProductImageGalleryProps {
  mainImage: string | null;
  additionalImages: string[] | null;
  productName: string;
  productId: string;
  variant?: "pdp" | "quickview";
}

export const ProductImageGallery = ({
  mainImage,
  additionalImages,
  productName,
  variant = "pdp",
}: ProductImageGalleryProps) => {
  return (
    <ProductImageCarousel
      mainImage={mainImage}
      additionalImages={additionalImages}
      productName={productName}
      variant={variant}
    />
  );
};
