import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProducts, Product } from "@/hooks/useProducts";

interface FramePreferences {
  faceShape?: string;
  frameStyle?: string[];
  colors?: string[];
  usage?: string[];
  budget?: string;
}

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

// Style mapping from quiz options to product styles
const STYLE_MAPPING: Record<string, string[]> = {
  classic: ["rectangular", "aviator", "wayfarer"],
  modern: ["rectangular", "square", "geometric"],
  bold: ["cat-eye", "oversized", "butterfly"],
  minimalist: ["rectangular", "rimless", "round"],
  vintage: ["round", "wayfarer", "cat-eye", "browline"],
};

// Color mapping from quiz options to product colors
const COLOR_MAPPING: Record<string, string[]> = {
  black: ["black", "matte black", "glossy black"],
  tortoise: ["tortoise", "havana", "brown", "amber"],
  gold: ["gold", "rose gold", "bronze"],
  silver: ["silver", "gunmetal", "chrome"],
  blue: ["blue", "navy", "transparent blue"],
  clear: ["clear", "transparent", "crystal"],
};

// Budget mapping from quiz options to price tiers
const BUDGET_MAPPING: Record<string, string[]> = {
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
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const preferences = profile?.frame_preferences as FramePreferences | null;
  const faceDimensions = profile?.face_dimensions as FaceDimensions | null;
  const hasPreferences = preferences && Object.keys(preferences).length > 0;
  const hasMeasurements = faceDimensions && Object.keys(faceDimensions).length > 0;

  const scoredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.map((product): ScoredProduct => {
      let score = 0;
      const reasons: string[] = [];
      let fitIndicator: ScoredProduct["fitIndicator"] = null;

      // Color matching (20 points)
      if (preferences?.colors?.length && product.color) {
        const productColorLower = product.color.toLowerCase();
        const matchedColor = preferences.colors.find((prefColor) => {
          const mappedColors = COLOR_MAPPING[prefColor.toLowerCase()] || [prefColor.toLowerCase()];
          return mappedColors.some((c) => productColorLower.includes(c));
        });
        if (matchedColor) {
          score += 20;
          reasons.push(`Matches your ${matchedColor} preference`);
        }
      }

      // Style matching (20 points)
      if (preferences?.frameStyle?.length && product.style) {
        const productStyleLower = product.style.toLowerCase();
        const matchedStyle = preferences.frameStyle.find((prefStyle) => {
          const mappedStyles = STYLE_MAPPING[prefStyle.toLowerCase()] || [prefStyle.toLowerCase()];
          return mappedStyles.some((s) => productStyleLower.includes(s));
        });
        if (matchedStyle) {
          score += 20;
          reasons.push(`Suits your ${matchedStyle} style`);
        }
      }

      // Budget matching (20 points)
      if (preferences?.budget && product.price_tier) {
        const budgetKey = preferences.budget.toLowerCase();
        const allowedTiers = BUDGET_MAPPING[budgetKey] || [];
        if (allowedTiers.includes(product.price_tier)) {
          score += 20;
          reasons.push("Within your budget");
        }
      }

      // Frame width fit (25 points)
      if (hasMeasurements && faceDimensions?.faceWidthMm && product.frame_width) {
        const productWidth = parseFrameWidth(product.frame_width);
        if (productWidth) {
          const userWidth = faceDimensions.faceWidthMm;
          const diff = Math.abs(productWidth - userWidth);
          
          if (diff <= 2) {
            score += 25;
            fitIndicator = "perfect";
            reasons.push("Perfect frame width fit");
          } else if (diff <= 5) {
            score += 15;
            fitIndicator = "good";
            reasons.push("Good frame width fit");
          } else if (productWidth < userWidth - 5) {
            score += 5;
            fitIndicator = "narrow";
          } else if (productWidth > userWidth + 5) {
            score += 5;
            fitIndicator = "wide";
          }
        }
      }

      // Bridge fit (15 points)
      if (hasMeasurements && faceDimensions?.bridgeWidthMm && product.bridge_size) {
        const productBridge = parseBridgeSize(product.bridge_size);
        if (productBridge) {
          const userBridge = faceDimensions.bridgeWidthMm;
          const diff = Math.abs(productBridge - userBridge);
          
          if (diff <= 2) {
            score += 15;
            reasons.push("Good bridge fit");
          } else if (diff <= 4) {
            score += 8;
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
  }, [products, preferences, faceDimensions, hasMeasurements]);

  const recommendedProducts = useMemo(() => {
    return [...scoredProducts]
      .filter((p) => p.matchScore >= 40)
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
