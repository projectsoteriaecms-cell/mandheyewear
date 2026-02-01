import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FrameDetails {
  id: string;
  name: string;
  color?: string;
  style?: string;
  imageUrl?: string;
  price?: number;
  sku?: string;
}

export interface TryOnResult {
  success: boolean;
  compositeImage?: string;
  error?: string;
  frameDetails?: FrameDetails;
  timestamp: number;
  usedFrameReference?: boolean;
}

export const useVirtualTryOn = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<TryOnResult | null>(null);
  const [savedTryOns, setSavedTryOns] = useState<TryOnResult[]>([]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const generateTryOn = useCallback(async (
    photo: string,
    frameDetails: FrameDetails
  ): Promise<TryOnResult> => {
    setIsGenerating(true);
    setCurrentResult(null);

    try {
      console.log("Starting virtual try-on for:", frameDetails.name);

      const { data, error } = await supabase.functions.invoke("virtual-try-on", {
        body: {
          userPhoto: photo,
          frameDetails: {
            name: frameDetails.name,
            color: frameDetails.color,
            style: frameDetails.style,
            imageUrl: frameDetails.imageUrl,
          },
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        const result: TryOnResult = {
          success: false,
          error: error.message || "Failed to generate try-on. Please try again.",
          timestamp: Date.now(),
        };
        setCurrentResult(result);
        toast.error(result.error);
        return result;
      }

      if (!data.success) {
        const result: TryOnResult = {
          success: false,
          error: data.error || "Unable to generate try-on image.",
          timestamp: Date.now(),
        };
        setCurrentResult(result);
        toast.error(result.error);
        return result;
      }

      const result: TryOnResult = {
        success: true,
        compositeImage: data.compositeImage,
        frameDetails: frameDetails,
        timestamp: Date.now(),
        usedFrameReference: data.usedFrameReference ?? false,
      };

      setCurrentResult(result);
      setSavedTryOns((prev) => [result, ...prev].slice(0, 10)); // Keep last 10
      toast.success("Try-on generated successfully!");

      return result;
    } catch (err) {
      console.error("Virtual try-on error:", err);
      const result: TryOnResult = {
        success: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred",
        timestamp: Date.now(),
      };
      setCurrentResult(result);
      toast.error(result.error);
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setCurrentResult(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSavedTryOns([]);
  }, []);

  const setPhoto = useCallback((photo: string | null) => {
    setUserPhoto(photo);
    // Clear results when photo changes
    if (photo !== userPhoto) {
      setCurrentResult(null);
    }
  }, [userPhoto]);

  const removeFromHistory = useCallback((timestamp: number) => {
    setSavedTryOns((prev) => prev.filter((r) => r.timestamp !== timestamp));
  }, []);

  return {
    // State
    isGenerating,
    currentResult,
    savedTryOns,
    userPhoto,
    
    // Actions
    generateTryOn,
    clearResult,
    clearHistory,
    setPhoto,
    removeFromHistory,
  };
};
