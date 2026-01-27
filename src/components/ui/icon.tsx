import type { IconWeight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Type for icon weight variants
export type IconVariant = "light" | "regular" | "bold" | "fill" | "duotone" | "thin";

export interface IconProps {
  size?: number;
  weight?: IconWeight;
  className?: string;
  active?: boolean;
  featured?: boolean;
}

/**
 * Get the appropriate icon weight based on state
 * - Default: light (minimalist, geometric)
 * - Active: bold (emphasis)
 * - Featured: duotone (two-tone depth)
 */
export const getIconWeight = (active?: boolean, featured?: boolean): IconWeight => {
  if (featured) return "duotone";
  if (active) return "bold";
  return "light";
};

/**
 * Get consistent icon styling
 */
export const getIconClassName = (className?: string, active?: boolean) => {
  return cn(
    "shrink-0 transition-all duration-200",
    active && "scale-110",
    className
  );
};

/**
 * Default icon size based on context
 */
export const IconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
} as const;

export type IconSize = keyof typeof IconSizes;
