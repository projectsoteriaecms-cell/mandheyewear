import { cn } from "@/lib/utils";

interface FrameStyleIllustrationProps {
  style: string;
  selected?: boolean;
  className?: string;
}

export const FrameStyleIllustration = ({ 
  style, 
  selected = false,
  className 
}: FrameStyleIllustrationProps) => {
  const strokeColor = selected ? "hsl(var(--accent))" : "currentColor";
  const fillColor = selected ? "hsl(var(--accent) / 0.12)" : "transparent";
  const accentFill = selected ? "hsl(var(--accent))" : "currentColor";
  const strokeWidth = selected ? 2.2 : 1.8;

  const renderFrame = () => {
    switch (style) {
      case "classic":
      case "rectangular":
        // Rectangular / Classic
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <rect x="6" y="12" width="54" height="32" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="80" y="12" width="54" height="32" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="60" y1="26" x2="80" y2="26" stroke={strokeColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
            <line x1="6" y1="22" x2="0" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="134" y1="22" x2="140" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          </svg>
        );

      case "cat eye":
        // Cat Eye with upswept corners
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <path
              d="M10 28 Q10 14 22 10 Q36 8 48 8 L56 6 L56 14 Q56 20 54 28 Q54 42 40 46 Q26 48 16 44 Q10 40 10 28 Z"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <path
              d="M130 28 Q130 14 118 10 Q104 8 92 8 L84 6 L84 14 Q84 20 86 28 Q86 42 100 46 Q114 48 124 44 Q130 40 130 28 Z"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <path d="M56 22 Q70 16 84 22" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d="M10 24 Q6 22 2 24 L0 26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <path d="M130 24 Q134 22 138 24 L140 26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <circle cx="55" cy="9" r="1.5" fill={accentFill} opacity={selected ? 0.8 : 0.4} />
            <circle cx="85" cy="9" r="1.5" fill={accentFill} opacity={selected ? 0.8 : 0.4} />
          </svg>
        );

      case "round":
        // Round frames
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <circle cx="33" cy="28" r="22" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="107" cy="28" r="22" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M55 24 Q70 18 85 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="11" y1="22" x2="0" y2="20" stroke={strokeColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" />
            <line x1="129" y1="22" x2="140" y2="20" stroke={strokeColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" />
          </svg>
        );

      case "square":
        // Square frames
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <rect x="6" y="8" width="52" height="40" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="82" y="8" width="52" height="40" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="58" y1="26" x2="82" y2="26" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="6" y1="22" x2="0" y2="20" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="134" y1="22" x2="140" y2="20" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          </svg>
        );

      case "aviator":
        // Aviator teardrop
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <path
              d="M8 18 Q8 8 20 8 L50 8 Q58 8 58 18 L58 28 Q58 48 33 48 Q8 48 8 28 Z"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <path
              d="M82 18 Q82 8 94 8 L120 8 Q132 8 132 18 L132 28 Q132 48 107 48 Q82 48 82 28 Z"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <line x1="58" y1="18" x2="82" y2="18" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="8" y1="16" x2="0" y2="14" stroke={strokeColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" />
            <line x1="132" y1="16" x2="140" y2="14" stroke={strokeColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" />
          </svg>
        );

      case "geometric":
        // Geometric hexagonal
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <polygon
              points="18,10 48,10 58,28 48,46 18,46 8,28"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <polygon
              points="92,10 122,10 132,28 122,46 92,46 82,28"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <line x1="58" y1="28" x2="82" y2="28" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="8" y1="24" x2="0" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" />
            <line x1="132" y1="24" x2="140" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.7} strokeLinecap="round" />
          </svg>
        );

      // Legacy support for old style names
      case "modern":
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <rect x="6" y="12" width="54" height="32" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="80" y="12" width="54" height="32" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="60" y1="26" x2="80" y2="26" stroke={strokeColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
            <line x1="6" y1="22" x2="0" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="134" y1="22" x2="140" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          </svg>
        );

      case "bold":
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <rect x="4" y="6" width="58" height="44" rx="10" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth * 1.6} strokeLinejoin="round" />
            <rect x="78" y="6" width="58" height="44" rx="10" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth * 1.6} strokeLinejoin="round" />
            <rect x="62" y="18" width="16" height="14" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth * 1.2} />
            <rect x="0" y="18" width="6" height="8" rx="2" fill={accentFill} opacity={selected ? 0.5 : 0.3} />
            <rect x="134" y="18" width="6" height="8" rx="2" fill={accentFill} opacity={selected ? 0.5 : 0.3} />
          </svg>
        );

      case "minimalist":
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <ellipse cx="32" cy="28" rx="26" ry="18" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <ellipse cx="108" cy="28" rx="26" ry="18" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <path d="M58 26 Q70 20 82 26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} strokeLinecap="round" />
            <line x1="6" y1="24" x2="0" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
            <line x1="134" y1="24" x2="140" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
          </svg>
        );

      case "vintage":
        // Same as cat eye for backward compat
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            <path
              d="M10 28 Q10 14 22 10 Q36 8 48 8 L56 6 L56 14 Q56 20 54 28 Q54 42 40 46 Q26 48 16 44 Q10 40 10 28 Z"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <path
              d="M130 28 Q130 14 118 10 Q104 8 92 8 L84 6 L84 14 Q84 20 86 28 Q86 42 100 46 Q114 48 124 44 Q130 40 130 28 Z"
              fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round"
            />
            <path d="M56 22 Q70 16 84 22" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d="M10 24 Q6 22 2 24 L0 26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <path d="M130 24 Q134 22 138 24 L140 26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "transition-all duration-300",
      selected && "scale-105",
      className
    )}>
      {renderFrame()}
    </div>
  );
};
