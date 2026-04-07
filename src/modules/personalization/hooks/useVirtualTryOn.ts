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

export type TryOnAngle = "front" | "three_quarter_left" | "three_quarter_right";

export interface TryOnResult {
  success: boolean;
  compositeImage?: string;
  error?: string;
  frameDetails?: FrameDetails;
  timestamp: number;
  usedFrameReference?: boolean;
}

export interface MultiAngleResults {
  front?: string;
  left?: string;
  right?: string;
}

export const useVirtualTryOn = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<TryOnResult | null>(null);
  const [savedTryOns, setSavedTryOns] = useState<TryOnResult[]>([]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [multiAngleResults, setMultiAngleResults] = useState<MultiAngleResults>({});
  const [isGeneratingAngles, setIsGeneratingAngles] = useState(false);

  const generateSingleAngle = useCallback(async (
    photo: string,
    frameDetails: FrameDetails,
    angle: TryOnAngle = "front"
  ): Promise<TryOnResult> => {
    try {
      const { data, error } = await supabase.functions.invoke("virtual-try-on", {
        body: {
          userPhoto: photo,
          frameDetails: {
            name: frameDetails.name,
            color: frameDetails.color,
            style: frameDetails.style,
            imageUrl: frameDetails.imageUrl,
          },
          angle,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to generate try-on.",
          timestamp: Date.now(),
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || "Unable to generate try-on image.",
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        compositeImage: data.compositeImage,
        frameDetails,
        timestamp: Date.now(),
        usedFrameReference: data.usedFrameReference ?? false,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred",
        timestamp: Date.now(),
      };
    }
  }, []);

  const generateTryOn = useCallback(async (
    photo: string,
    frameDetails: FrameDetails
  ): Promise<TryOnResult> => {
    setIsGenerating(true);
    setCurrentResult(null);
    setMultiAngleResults({});

    try {
      const result = await generateSingleAngle(photo, frameDetails, "front");

      setCurrentResult(result);

      if (result.success) {
        setSavedTryOns((prev) => [result, ...prev].slice(0, 10));
        toast.success("Try-on generated successfully!");
      } else {
        toast.error(result.error);
      }

      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [generateSingleAngle]);

  const generateMultiAngle = useCallback(async (
    photo: string,
    frameDetails: FrameDetails
  ) => {
    // First generate front view
    const frontResult = await generateTryOn(photo, frameDetails);

    if (!frontResult.success || !frontResult.compositeImage) return;

    // Set front in multi-angle
    setMultiAngleResults({ front: frontResult.compositeImage });
    setIsGeneratingAngles(true);

    // Generate left and right in parallel (background)
    const generateSide = async (angle: TryOnAngle, key: "left" | "right") => {
      const result = await generateSingleAngle(photo, frameDetails, angle);
      if (result.success && result.compositeImage) {
        setMultiAngleResults((prev) => ({ ...prev, [key]: result.compositeImage }));
      }
    };

    try {
      await Promise.allSettled([
        generateSide("three_quarter_left", "left"),
        generateSide("three_quarter_right", "right"),
      ]);
    } finally {
      setIsGeneratingAngles(false);
    }
  }, [generateTryOn, generateSingleAngle]);

  const clearResult = useCallback(() => {
    setCurrentResult(null);
    setMultiAngleResults({});
    setIsGeneratingAngles(false);
  }, []);

  const clearHistory = useCallback(() => {
    setSavedTryOns([]);
  }, []);

  const setPhoto = useCallback((photo: string | null) => {
    setUserPhoto(photo);
    if (photo !== userPhoto) {
      setCurrentResult(null);
      setMultiAngleResults({});
    }
  }, [userPhoto]);

  const removeFromHistory = useCallback((timestamp: number) => {
    setSavedTryOns((prev) => prev.filter((r) => r.timestamp !== timestamp));
  }, []);

  return {
    isGenerating,
    currentResult,
    savedTryOns,
    userPhoto,
    multiAngleResults,
    isGeneratingAngles,
    
    generateTryOn,
    generateMultiAngle,
    generateSingleAngle,
    clearResult,
    clearHistory,
    setPhoto,
    removeFromHistory,
  };
};
