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
  const fillColor = selected ? "hsl(var(--accent) / 0.15)" : "transparent";
  const strokeWidth = selected ? 2.5 : 2;

  const renderFrame = () => {
    switch (style) {
      case "classic":
        // Wayfarer/rectangular classic shape
        return (
          <svg viewBox="0 0 120 48" className={cn("w-full h-full", className)}>
            {/* Left lens - classic rectangular with slight curve */}
            <path
              d="M8 12 
                 Q8 8 14 8 
                 L46 8 
                 Q52 8 52 14 
                 L52 34 
                 Q52 40 44 40 
                 L16 40 
                 Q8 40 8 32 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Right lens */}
            <path
              d="M68 12 
                 Q68 8 74 8 
                 L106 8 
                 Q112 8 112 14 
                 L112 34 
                 Q112 40 104 40 
                 L76 40 
                 Q68 40 68 32 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Bridge */}
            <path
              d="M52 20 Q60 16 68 20"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Temples hint */}
            <line x1="4" y1="16" x2="8" y2="14" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <line x1="112" y1="14" x2="116" y2="16" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
          </svg>
        );

      case "modern":
        // Geometric angular modern shape
        return (
          <svg viewBox="0 0 120 48" className={cn("w-full h-full", className)}>
            {/* Left lens - angular geometric */}
            <path
              d="M6 14 
                 L14 6 
                 L50 6 
                 L54 14 
                 L54 36 
                 L46 42 
                 L14 42 
                 L6 34 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Right lens */}
            <path
              d="M66 14 
                 L70 6 
                 L106 6 
                 L114 14 
                 L114 34 
                 L106 42 
                 L74 42 
                 L66 36 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Bridge - straight modern */}
            <line x1="54" y1="18" x2="66" y2="18" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            {/* Temples */}
            <line x1="2" y1="18" x2="6" y2="16" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <line x1="114" y1="16" x2="118" y2="18" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
          </svg>
        );

      case "bold":
        // Thick oversized statement frames
        return (
          <svg viewBox="0 0 120 48" className={cn("w-full h-full", className)}>
            {/* Left lens - thick bold frame */}
            <rect
              x="4"
              y="4"
              width="50"
              height="40"
              rx="8"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 1.5}
              strokeLinejoin="round"
            />
            {/* Inner lens cutout */}
            <rect
              x="10"
              y="10"
              width="38"
              height="28"
              rx="4"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.5}
              opacity={0.3}
            />
            {/* Right lens */}
            <rect
              x="66"
              y="4"
              width="50"
              height="40"
              rx="8"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 1.5}
              strokeLinejoin="round"
            />
            {/* Inner lens cutout */}
            <rect
              x="72"
              y="10"
              width="38"
              height="28"
              rx="4"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.5}
              opacity={0.3}
            />
            {/* Bold bridge */}
            <rect x="54" y="16" width="12" height="10" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          </svg>
        );

      case "minimalist":
        // Thin wire-frame style
        return (
          <svg viewBox="0 0 120 48" className={cn("w-full h-full", className)}>
            {/* Left lens - thin wire frame oval */}
            <ellipse
              cx="28"
              cy="24"
              rx="22"
              ry="16"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.7}
            />
            {/* Right lens */}
            <ellipse
              cx="92"
              cy="24"
              rx="22"
              ry="16"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.7}
            />
            {/* Thin bridge */}
            <path
              d="M50 22 Q60 18 70 22"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.7}
              strokeLinecap="round"
            />
            {/* Delicate temples */}
            <line x1="2" y1="22" x2="6" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
            <line x1="114" y1="22" x2="118" y2="22" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} strokeLinecap="round" />
          </svg>
        );

      case "vintage":
        // Round cat-eye retro style
        return (
          <svg viewBox="0 0 120 48" className={cn("w-full h-full", className)}>
            {/* Left lens - cat-eye shape */}
            <path
              d="M8 24 
                 Q8 8 28 8 
                 Q48 8 52 4 
                 L52 12 
                 Q52 40 28 40 
                 Q8 40 8 24 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Right lens - cat-eye mirror */}
            <path
              d="M112 24 
                 Q112 8 92 8 
                 Q72 8 68 4 
                 L68 12 
                 Q68 40 92 40 
                 Q112 40 112 24 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Decorative cat-eye accent */}
            <circle cx="48" cy="8" r="3" fill={selected ? strokeColor : "none"} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            <circle cx="72" cy="8" r="3" fill={selected ? strokeColor : "none"} stroke={strokeColor} strokeWidth={strokeWidth * 0.6} />
            {/* Bridge */}
            <path
              d="M52 18 Q60 14 68 18"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
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
