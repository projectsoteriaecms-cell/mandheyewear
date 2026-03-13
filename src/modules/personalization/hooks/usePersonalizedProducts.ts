import { useMemo } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "./useProfile";
import { useProducts, Product } from "@/modules/products/hooks/useProducts";
import type { QuizPreferences } from "@/components/onboarding/quiz-constants";

interface FaceDimensions {
  faceWidthMm?: number;
  pupillaryDistanceMm?: number;
  bridgeWidthMm?: number;
  templeWidthMm?: number;
  faceShape?: string;
}

export interface ScoredProduct extends Product {
  matchScore: number;
  matchReasons: string[];
  fitIndicator?: "perfect" | "good" | "narrow" | "wide" | null;
}

// Budget IDs → price_tier values (canonical IDs from quiz-constants)
const BUDGET_MAPPING: Record<string, string[]> = {
  under_50k: ["budget"],
  "50k_150k": ["standard", "premium"],
  "150k_300k": ["premium", "luxury"],
  over_300k: ["luxury"],
  budget: ["budget"],
  standard: ["standard", "premium"],
  premium: ["premium", "luxury"],
  luxury: ["luxury"],
  "under 50k": ["budget"],
  "50-150k": ["standard", "premium"],
  "150-300k": ["premium", "luxury"],
  "over 300k": ["luxury"],
};

const parseFrameWidth = (frameWidth: string | null): number | null => {
  if (!frameWidth) return null;
  const match = frameWidth.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const parseBridgeSize = (bridgeSize: string | null): number | null => {
  if (!bridgeSize) return null;
  const match = bridgeSize.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

export const usePersonalizedProducts = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: products = [], isLoading: productsLoading } = useProducts(undefined, true);

  const preferences = profile?.frame_preferences as QuizPreferences | null;
  const faceDimensions = profile?.face_dimensions as FaceDimensions | null;
  const hasPreferences = preferences && Object.keys(preferences).length > 0;
  const hasMeasurements = faceDimensions && Object.keys(faceDimensions).length > 0;

  const frameShapes = preferences?.frameShape || (preferences as any)?.frameStyle || [];
  const materials = preferences?.material || [];

  const scoredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.map((product): ScoredProduct => {
      let score = 0;
      const reasons: string[] = [];
      let fitIndicator: ScoredProduct["fitIndicator"] = null;

      if (frameShapes.length && product.style) {
        const productStyleLower = product.style.toLowerCase();
        const matchedShape = frameShapes.find((shape: string) =>
          productStyleLower.includes(shape.toLowerCase())
        );
        if (matchedShape) {
          score += 30;
          reasons.push(`${matchedShape.charAt(0).toUpperCase() + matchedShape.slice(1)} frame`);
        }
      }

      if (preferences?.budget && product.price_tier) {
        const budgetKey = preferences.budget.toLowerCase();
        const allowedTiers = BUDGET_MAPPING[budgetKey] || [];
        if (allowedTiers.includes(product.price_tier)) {
          score += 30;
          reasons.push("Within your budget");
        }
      }

      if (materials.length && product.material) {
        const productMaterialLower = product.material.toLowerCase();
        const matchedMaterial = materials.find((mat: string) =>
          productMaterialLower.includes(mat.toLowerCase())
        );
        if (matchedMaterial) {
          score += 20;
          reasons.push(`${matchedMaterial.charAt(0).toUpperCase() + matchedMaterial.slice(1)} material`);
        }
      }

      if (preferences?.gender && product.gender) {
        const productGender = product.gender.toLowerCase();
        const prefGender = preferences.gender.toLowerCase();
        if (
          productGender === prefGender ||
          productGender === "unisex" ||
          prefGender === "unisex"
        ) {
          score += 5;
        }
      }

      if (hasMeasurements && faceDimensions?.faceWidthMm && product.frame_width) {
        const productWidth = parseFrameWidth(product.frame_width);
        if (productWidth) {
          const userWidth = faceDimensions.faceWidthMm;
          const diff = Math.abs(productWidth - userWidth);

          if (diff <= 2) {
            score += 20;
            fitIndicator = "perfect";
            reasons.push("Perfect frame width fit");
          } else if (diff <= 5) {
            score += 12;
            fitIndicator = "good";
            reasons.push("Good frame width fit");
          } else if (productWidth < userWidth - 5) {
            score += 3;
            fitIndicator = "narrow";
          } else if (productWidth > userWidth + 5) {
            score += 3;
            fitIndicator = "wide";
          }
        }
      }

      if (hasMeasurements && faceDimensions?.bridgeWidthMm && product.bridge_size) {
        const productBridge = parseBridgeSize(product.bridge_size);
        if (productBridge) {
          const userBridge = faceDimensions.bridgeWidthMm;
          const diff = Math.abs(productBridge - userBridge);

          if (diff <= 2) {
            score += 10;
            reasons.push("Good bridge fit");
          } else if (diff <= 4) {
            score += 5;
          }
        }
      }

      return {
        ...product,
        matchScore: Math.min(score, 100),
        matchReasons: reasons,
        fitIndicator,
      };
    });
  }, [products, preferences, faceDimensions, hasMeasurements, frameShapes, materials]);

  const recommendedProducts = useMemo(() => {
    return [...scoredProducts]
      .filter((p) => p.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [scoredProducts]);

  const topPicks = useMemo(() => {
    return recommendedProducts.slice(0, 8);
  }, [recommendedProducts]);

  const getProductScore = (productId: string): ScoredProduct | undefined => {
    return scoredProducts.find((p) => p.id === productId);
  };

  return {
    scoredProducts,
    recommendedProducts,
    topPicks,
    getProductScore,
    hasPreferences,
    hasMeasurements,
    isLoading: profileLoading || productsLoading,
  };
};