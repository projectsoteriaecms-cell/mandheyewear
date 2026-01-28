/**
 * Client-side image compression utilities
 * Compresses images before upload to reduce storage costs
 */

const MAX_DIMENSION = 2000; // Max width or height
const COMPRESSION_QUALITY = 0.85; // 85% quality for good balance

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Loads an image file into an HTMLImageElement
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
const calculateDimensions = (
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } => {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

/**
 * Compresses an image file using canvas
 */
export const compressImage = async (
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
    outputFormat?: "image/jpeg" | "image/webp";
  } = {}
): Promise<CompressionResult> => {
  const {
    maxDimension = MAX_DIMENSION,
    quality = COMPRESSION_QUALITY,
    outputFormat = "image/webp",
  } = options;

  const originalSize = file.size;

  // Skip compression for very small files (under 100KB)
  if (originalSize < 100 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
    };
  }

  try {
    const img = await loadImage(file);
    const { width, height } = calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      maxDimension
    );

    // Create canvas and draw resized image
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // Clean up object URL
    URL.revokeObjectURL(img.src);

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputFormat, quality);
    });

    if (!blob) {
      throw new Error("Failed to compress image");
    }

    // If compressed is larger than original, return original
    if (blob.size >= originalSize) {
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
      };
    }

    // Create new file with appropriate extension
    const extension = outputFormat === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const compressedFile = new File([blob], `${baseName}.${extension}`, {
      type: outputFormat,
    });

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      compressionRatio: compressedFile.size / originalSize,
    };
  } catch (error) {
    console.error("Image compression failed:", error);
    // Return original file if compression fails
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
    };
  }
};

/**
 * Formats bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
