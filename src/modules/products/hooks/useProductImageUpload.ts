import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { compressImage, formatBytes } from "../lib/image-compression";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const useProductImageUpload = () => {
  const queryClient = useQueryClient();

  const invalidateImageQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, or WebP images.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 7MB limit.";
    }
    return null;
  };

  const getFileExtension = (file: File): string => {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    return mimeToExt[file.type] || "jpg";
  };

  const uploadProductImage = async (
    productId: string,
    file: File,
    isPrimary: boolean
  ): Promise<string | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return null;
    }

    try {
      // Compress image before upload
      const { file: compressedFile, originalSize, compressedSize, compressionRatio } = 
        await compressImage(file, {
          maxDimension: 2000,
          quality: 0.85,
          outputFormat: "image/webp",
        });

      // Log compression results
      if (compressionRatio < 1) {
        console.log(
          `Image compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${Math.round((1 - compressionRatio) * 100)}% reduction)`
        );
      }

      const ext = compressedFile.type === "image/webp" ? "webp" : getFileExtension(compressedFile);
      const filename = isPrimary ? `main.${ext}` : `additional-${Date.now()}.${ext}`;
      const path = `${productId}/${filename}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      // Update product record
      if (isPrimary) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: publicUrl })
          .eq("id", productId);

        if (updateError) throw updateError;
      } else {
        // Get current additional images and append
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("additional_images")
          .eq("id", productId)
          .single();

        if (fetchError) throw fetchError;

        const currentImages = product?.additional_images || [];
        const updatedImages = [...currentImages, publicUrl];

        const { error: updateError } = await supabase
          .from("products")
          .update({ additional_images: updatedImages })
          .eq("id", productId);

        if (updateError) throw updateError;
      }

      invalidateImageQueries();
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const uploadMultipleImages = async (
    productId: string,
    files: File[]
  ): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const url = await uploadProductImage(productId, file, false);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    invalidateImageQueries();
    return uploadedUrls;
  };

  const deleteProductImage = async (
    productId: string,
    imageUrl: string,
    isPrimary: boolean
  ): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) return false;
      const path = urlParts[1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (deleteError) throw deleteError;

      // Update product record
      if (isPrimary) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: null })
          .eq("id", productId);

        if (updateError) throw updateError;
      } else {
        // Remove from additional images array
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("additional_images")
          .eq("id", productId)
          .single();

        if (fetchError) throw fetchError;

        const currentImages = product?.additional_images || [];
        const updatedImages = currentImages.filter((url: string) => url !== imageUrl);

        const { error: updateError } = await supabase
          .from("products")
          .update({ additional_images: updatedImages })
          .eq("id", productId);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
      return false;
    }
  };

  const uploadBulkImagesBySku = async (
    files: File[],
    products: { id: string; sku: string }[]
  ): Promise<{ matched: number; failed: number }> => {
    let matched = 0;
    let failed = 0;

    for (const file of files) {
      // Extract SKU from filename (e.g., "MH-RND-001.jpg" -> "MH-RND-001")
      const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const product = products.find(
        (p) => p.sku.toLowerCase() === filenameWithoutExt.toLowerCase()
      );

      if (product) {
        const url = await uploadProductImage(product.id, file, true);
        if (url) {
          matched++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
    }

    return { matched, failed };
  };

  return {
    uploadProductImage,
    uploadMultipleImages,
    deleteProductImage,
    uploadBulkImagesBySku,
    validateFile,
  };
};
