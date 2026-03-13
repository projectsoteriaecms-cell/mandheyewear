import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/shared/hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";

export interface FaceDimensions {
  faceWidthMm: number;
  pupillaryDistanceMm: number;
  bridgeWidthMm: number;
  templeWidthMm: number;
  faceShape: string;
  confidenceScore: number;
}

export const useFaceMeasurement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dimensions, setDimensions] = useState<FaceDimensions | null>(null);

  const analyzeFace = useCallback(async (imageBase64: string): Promise<FaceDimensions | null> => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to use face analysis.",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-face", {
        body: { image: imageBase64 },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || "Face analysis failed");
      }

      const faceDimensions: FaceDimensions = {
        faceWidthMm: data.faceWidthMm,
        pupillaryDistanceMm: data.pupillaryDistanceMm,
        bridgeWidthMm: data.bridgeWidthMm,
        templeWidthMm: data.templeWidthMm,
        faceShape: data.faceShape,
        confidenceScore: data.confidenceScore,
      };

      // Save to user_measurements table
      await supabase.from("user_measurements").insert({
        user_id: user.id,
        measurement_type: "ai_face_scan",
        face_width_mm: faceDimensions.faceWidthMm,
        pupillary_distance_mm: faceDimensions.pupillaryDistanceMm,
        bridge_width_mm: faceDimensions.bridgeWidthMm,
        temple_width_mm: faceDimensions.templeWidthMm,
        face_shape: faceDimensions.faceShape,
        confidence_score: faceDimensions.confidenceScore,
        image_url: null,
        raw_analysis: data,
      });

      // Update profile with face dimensions
      await supabase
        .from("profiles")
        .update({
          face_dimensions: {
            faceWidthMm: faceDimensions.faceWidthMm,
            pupillaryDistanceMm: faceDimensions.pupillaryDistanceMm,
            bridgeWidthMm: faceDimensions.bridgeWidthMm,
            templeWidthMm: faceDimensions.templeWidthMm,
            faceShape: faceDimensions.faceShape,
          },
        })
        .eq("user_id", user.id);

      setDimensions(faceDimensions);

      toast({
        title: "Face Analysis Complete",
        description: `Detected ${faceDimensions.faceShape} face shape with ${Math.round(faceDimensions.confidenceScore * 100)}% confidence.`,
      });

      return faceDimensions;
    } catch (err) {
      console.error("Face analysis error:", err);
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "Could not analyze face. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, toast]);

  return {
    analyzeFace,
    isAnalyzing,
    dimensions,
  };
};