import { cn } from "@/lib/utils";

interface FaceShapeIllustrationProps {
  shape: "oval" | "round" | "square" | "heart" | "oblong";
  selected?: boolean;
  className?: string;
}

export const FaceShapeIllustration = ({ 
  shape, 
  selected = false,
  className 
}: FaceShapeIllustrationProps) => {
  const strokeColor = selected ? "hsl(var(--accent))" : "currentColor";
  const fillColor = selected ? "hsl(var(--accent) / 0.1)" : "transparent";
  const strokeWidth = selected ? 2 : 1.5;

  const renderShape = () => {
    switch (shape) {
      case "oval":
        return (
          <svg viewBox="0 0 64 80" className={cn("w-full h-full", className)}>
            {/* Oval face - elongated egg shape */}
            <ellipse
              cx="32"
              cy="40"
              rx="22"
              ry="30"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Subtle jawline curve */}
            <path
              d="M15 50 Q32 72 49 50"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.6}
              opacity={0.4}
            />
          </svg>
        );

      case "round":
        return (
          <svg viewBox="0 0 64 80" className={cn("w-full h-full", className)}>
            {/* Round face - circular with soft features */}
            <ellipse
              cx="32"
              cy="40"
              rx="25"
              ry="26"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Soft chin curve */}
            <path
              d="M14 48 Q32 68 50 48"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.6}
              opacity={0.4}
            />
          </svg>
        );

      case "square":
        return (
          <svg viewBox="0 0 64 80" className={cn("w-full h-full", className)}>
            {/* Square face - angular jawline */}
            <path
              d="M12 20 
                 Q12 12 20 12 
                 L44 12 
                 Q52 12 52 20 
                 L52 52 
                 Q52 56 50 58 
                 L42 66 
                 Q36 70 32 70 
                 Q28 70 22 66 
                 L14 58 
                 Q12 56 12 52 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Strong jawline accent */}
            <path
              d="M14 52 L22 64 Q32 68 42 64 L50 52"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.6}
              opacity={0.4}
            />
          </svg>
        );

      case "heart":
        return (
          <svg viewBox="0 0 64 80" className={cn("w-full h-full", className)}>
            {/* Heart face - wider forehead tapering to chin */}
            <path
              d="M10 28 
                 Q10 12 32 12 
                 Q54 12 54 28 
                 L54 38 
                 Q54 48 46 56 
                 L38 64 
                 Q32 72 32 72 
                 Q32 72 26 64 
                 L18 56 
                 Q10 48 10 38 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Wide forehead line */}
            <path
              d="M14 26 Q32 18 50 26"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.6}
              opacity={0.4}
            />
          </svg>
        );

      case "oblong":
        return (
          <svg viewBox="0 0 64 80" className={cn("w-full h-full", className)}>
            {/* Oblong face - vertically elongated */}
            <path
              d="M16 18 
                 Q16 8 32 8 
                 Q48 8 48 18 
                 L48 58 
                 Q48 72 32 72 
                 Q16 72 16 58 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Elongated sides accent */}
            <path
              d="M18 30 L18 50"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.5}
              opacity={0.3}
            />
            <path
              d="M46 30 L46 50"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.5}
              opacity={0.3}
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
      {renderShape()}
    </div>
  );
};
