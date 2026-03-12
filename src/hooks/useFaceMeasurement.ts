import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/shared/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface FaceDimensions {
  faceWidthMm: number;
  pupillaryDistanceMm: number;
  bridgeWidthMm: number;
  templeWidthMm: number;
  faceShape: string;
  confidenceScore: number;
  scanDate: string;
}

export interface FaceAnalysisResult {
  success: boolean;
  dimensions?: FaceDimensions;
  error?: string;
}

export const useFaceMeasurement = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FaceAnalysisResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const analyzeImage = async (imageBase64: string): Promise<FaceAnalysisResult> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-face", {
        body: { image: imageBase64 },
      });

      if (error) {
        throw new Error(error.message || "Failed to analyze face");
      }

      if (!data.success) {
        throw new Error(data.error || "Face analysis failed");
      }

      const dimensions: FaceDimensions = {
        faceWidthMm: data.dimensions.faceWidthMm,
        pupillaryDistanceMm: data.dimensions.pupillaryDistanceMm,
        bridgeWidthMm: data.dimensions.bridgeWidthMm,
        templeWidthMm: data.dimensions.templeWidthMm,
        faceShape: data.dimensions.faceShape,
        confidenceScore: data.dimensions.confidenceScore,
        scanDate: new Date().toISOString(),
      };

      // Save measurement to user_measurements table
      const { error: insertError } = await supabase.from("user_measurements").insert({
        user_id: user.id,
        measurement_type: "face_scan",
        face_width_mm: dimensions.faceWidthMm,
        pupillary_distance_mm: dimensions.pupillaryDistanceMm,
        bridge_width_mm: dimensions.bridgeWidthMm,
        temple_width_mm: dimensions.templeWidthMm,
        face_shape: dimensions.faceShape,
        confidence_score: dimensions.confidenceScore,
        raw_analysis: data.rawAnalysis || null,
      });

      if (insertError) {
        console.error("Failed to save measurement:", insertError);
      }

      // Update profile with face dimensions
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          face_dimensions: {
            faceWidthMm: dimensions.faceWidthMm,
            pupillaryDistanceMm: dimensions.pupillaryDistanceMm,
            bridgeWidthMm: dimensions.bridgeWidthMm,
            templeWidthMm: dimensions.templeWidthMm,
            faceShape: dimensions.faceShape,
            confidenceScore: dimensions.confidenceScore,
            scanDate: dimensions.scanDate,
          },
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
      }

      const analysisResult = { success: true, dimensions };
      setResult(analysisResult);
      return analysisResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      const analysisResult = { success: false, error: errorMessage };
      setResult(analysisResult);
      return analysisResult;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const captureFromVideo = async (videoElement: HTMLVideoElement): Promise<string> => {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    ctx.drawImage(videoElement, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const reset = () => {
    setResult(null);
    setIsAnalyzing(false);
  };

  return {
    analyzeImage,
    captureFromVideo,
    isAnalyzing,
    result,
    reset,
  };
};
