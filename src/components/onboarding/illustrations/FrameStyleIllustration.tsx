import { cn } from "@/lib/utils";

interface FrameStyleIllustrationProps {
  style: "classic" | "modern" | "bold" | "minimalist" | "vintage";
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
        // Classic Wayfarer style - iconic trapezoidal shape
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            {/* Left lens - wayfarer trapezoid */}
            <path
              d="M6 16 
                 L12 10 
                 L52 10 
                 L58 16 
                 L58 38 
                 Q58 46 50 46 
                 L18 46 
                 Q8 46 6 38 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Right lens - wayfarer trapezoid */}
            <path
              d="M82 16 
                 L88 10 
                 L128 10 
                 L134 16 
                 L134 38 
                 Q134 46 126 46 
                 L94 46 
                 Q84 46 82 38 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Bridge - keyhole style */}
            <path
              d="M58 22 
                 Q64 18 70 18 
                 Q76 18 82 22"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Temple arms */}
            <path d="M6 20 L2 18 L0 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <path d="M134 20 L138 18 L140 20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            {/* Hinge details */}
            <circle cx="8" cy="22" r="2" fill={accentFill} opacity={selected ? 0.6 : 0.3} />
            <circle cx="132" cy="22" r="2" fill={accentFill} opacity={selected ? 0.6 : 0.3} />
          </svg>
        );

      case "modern":
        // Modern rectangular/geometric - clean angular lines
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            {/* Left lens - sharp rectangle */}
            <rect
              x="6"
              y="12"
              width="54"
              height="32"
              rx="4"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Right lens - sharp rectangle */}
            <rect
              x="80"
              y="12"
              width="54"
              height="32"
              rx="4"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Bridge - straight modern bar */}
            <rect
              x="60"
              y="24"
              width="20"
              height="4"
              rx="2"
              fill={accentFill}
              opacity={selected ? 0.5 : 0.3}
            />
            <line x1="60" y1="26" x2="80" y2="26" stroke={strokeColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
            {/* Temple arms - modern straight */}
            <line x1="6" y1="22" x2="0" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            <line x1="134" y1="22" x2="140" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            {/* Subtle nose pads */}
            <ellipse cx="62" cy="32" rx="2" ry="3" fill={accentFill} opacity={selected ? 0.4 : 0.2} />
            <ellipse cx="78" cy="32" rx="2" ry="3" fill={accentFill} opacity={selected ? 0.4 : 0.2} />
          </svg>
        );

      case "bold":
        // Bold oversized - thick chunky frames
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            {/* Left lens - thick oversized */}
            <rect
              x="4"
              y="6"
              width="58"
              height="44"
              rx="10"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 1.6}
              strokeLinejoin="round"
            />
            {/* Inner lens cutout left */}
            <rect
              x="12"
              y="14"
              width="42"
              height="28"
              rx="6"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.4}
              opacity={0.3}
            />
            {/* Right lens - thick oversized */}
            <rect
              x="78"
              y="6"
              width="58"
              height="44"
              rx="10"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 1.6}
              strokeLinejoin="round"
            />
            {/* Inner lens cutout right */}
            <rect
              x="86"
              y="14"
              width="42"
              height="28"
              rx="6"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.4}
              opacity={0.3}
            />
            {/* Bold bridge */}
            <rect
              x="62"
              y="18"
              width="16"
              height="14"
              rx="4"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 1.2}
            />
            {/* Thick temple arms */}
            <rect x="0" y="18" width="6" height="8" rx="2" fill={accentFill} opacity={selected ? 0.5 : 0.3} />
            <rect x="134" y="18" width="6" height="8" rx="2" fill={accentFill} opacity={selected ? 0.5 : 0.3} />
          </svg>
        );

      case "minimalist":
        // Minimalist wire frame - thin elegant rimless/semi-rimless
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            {/* Left lens - thin oval wire */}
            <ellipse
              cx="32"
              cy="28"
              rx="26"
              ry="18"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.6}
            />
            {/* Right lens - thin oval wire */}
            <ellipse
              cx="108"
              cy="28"
              rx="26"
              ry="18"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.6}
            />
            {/* Delicate bridge - thin curved */}
            <path
              d="M58 26 Q70 20 82 26"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.6}
              strokeLinecap="round"
            />
            {/* Thin temple wires */}
            <line x1="6" y1="24" x2="0" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
            <line x1="134" y1="24" x2="140" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
            {/* Subtle nose pad arms */}
            <path d="M58 28 L64 34" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.5} />
            <path d="M82 28 L76 34" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.5} />
            {/* Tiny nose pads */}
            <circle cx="65" cy="36" r="2" fill={accentFill} opacity={selected ? 0.5 : 0.25} />
            <circle cx="75" cy="36" r="2" fill={accentFill} opacity={selected ? 0.5 : 0.25} />
          </svg>
        );

      case "vintage":
        // Vintage cat-eye / round retro style
        return (
          <svg viewBox="0 0 140 56" className={cn("w-full h-full", className)}>
            {/* Left lens - cat-eye shape with upswept corners */}
            <path
              d="M10 28 
                 Q10 14 22 10 
                 Q36 8 48 8 
                 L56 6 
                 L56 14 
                 Q56 20 54 28 
                 Q54 42 40 46 
                 Q26 48 16 44 
                 Q10 40 10 28 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Right lens - cat-eye mirror */}
            <path
              d="M130 28 
                 Q130 14 118 10 
                 Q104 8 92 8 
                 L84 6 
                 L84 14 
                 Q84 20 86 28 
                 Q86 42 100 46 
                 Q114 48 124 44 
                 Q130 40 130 28 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Decorative cat-eye accents */}
            <circle cx="54" cy="10" r="4" fill={selected ? accentFill : "none"} stroke={strokeColor} strokeWidth={strokeWidth * 0.7} />
            <circle cx="86" cy="10" r="4" fill={selected ? accentFill : "none"} stroke={strokeColor} strokeWidth={strokeWidth * 0.7} />
            {/* Bridge - vintage curved */}
            <path
              d="M56 22 Q70 16 84 22"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Temple arms - classic curved */}
            <path d="M10 24 Q6 22 2 24 L0 26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <path d="M130 24 Q134 22 138 24 L140 26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            {/* Rhinestone/stud details on cat-eye tips */}
            <circle cx="55" cy="9" r="1.5" fill={accentFill} opacity={selected ? 0.8 : 0.4} />
            <circle cx="85" cy="9" r="1.5" fill={accentFill} opacity={selected ? 0.8 : 0.4} />
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
