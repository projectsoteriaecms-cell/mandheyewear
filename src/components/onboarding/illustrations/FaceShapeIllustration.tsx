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
  const fillColor = selected ? "hsl(var(--accent) / 0.08)" : "transparent";
  const strokeWidth = selected ? 1.8 : 1.4;
  const hairColor = selected ? "hsl(var(--accent) / 0.3)" : "currentColor";

  const renderShape = () => {
    switch (shape) {
      case "oval":
        // Oval face - balanced, slightly elongated, soft curves
        return (
          <svg viewBox="0 0 80 100" className={cn("w-full h-full", className)}>
            {/* Hair silhouette */}
            <path
              d="M20 35 Q20 12 40 10 Q60 12 60 35"
              fill={hairColor}
              opacity={0.2}
              stroke="none"
            />
            {/* Face outline - classic oval shape */}
            <path
              d="M20 38 
                 Q18 28 25 20 
                 Q32 14 40 14 
                 Q48 14 55 20 
                 Q62 28 60 38 
                 L60 55 
                 Q60 72 50 82 
                 Q44 88 40 88 
                 Q36 88 30 82 
                 Q20 72 20 55 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Ear hints */}
            <path d="M18 45 Q14 48 15 55 Q16 60 19 58" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            <path d="M62 45 Q66 48 65 55 Q64 60 61 58" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            {/* Subtle facial features */}
            <ellipse cx="32" cy="48" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <ellipse cx="48" cy="48" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <path d="M38 60 Q40 63 42 60" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} opacity={0.4} />
          </svg>
        );

      case "round":
        // Round face - equal width and length, full cheeks, soft chin
        return (
          <svg viewBox="0 0 80 100" className={cn("w-full h-full", className)}>
            {/* Hair silhouette */}
            <path
              d="M18 38 Q18 12 40 10 Q62 12 62 38"
              fill={hairColor}
              opacity={0.2}
              stroke="none"
            />
            {/* Face outline - circular, full cheeks */}
            <path
              d="M18 42 
                 Q16 30 24 20 
                 Q32 12 40 12 
                 Q48 12 56 20 
                 Q64 30 62 42 
                 L62 52 
                 Q62 70 50 78 
                 Q44 82 40 82 
                 Q36 82 30 78 
                 Q18 70 18 52 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Ear hints */}
            <path d="M16 44 Q12 48 13 54 Q14 58 17 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            <path d="M64 44 Q68 48 67 54 Q66 58 63 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            {/* Full cheek indicators */}
            <path d="M22 55 Q25 60 28 55" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.25} />
            <path d="M52 55 Q55 60 58 55" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.25} />
            {/* Subtle facial features */}
            <ellipse cx="32" cy="46" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <ellipse cx="48" cy="46" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
          </svg>
        );

      case "square":
        // Square face - strong angular jawline, wide forehead, defined angles
        return (
          <svg viewBox="0 0 80 100" className={cn("w-full h-full", className)}>
            {/* Hair silhouette */}
            <path
              d="M17 35 Q17 12 40 10 Q63 12 63 35"
              fill={hairColor}
              opacity={0.2}
              stroke="none"
            />
            {/* Face outline - angular jaw, wide structure */}
            <path
              d="M17 38 
                 Q17 26 22 18 
                 Q30 12 40 12 
                 Q50 12 58 18 
                 Q63 26 63 38 
                 L63 60 
                 Q63 68 58 74 
                 L48 84 
                 Q44 87 40 87 
                 Q36 87 32 84 
                 L22 74 
                 Q17 68 17 60 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Strong jaw accent lines */}
            <path d="M17 60 L22 74" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} opacity={0.4} />
            <path d="M63 60 L58 74" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} opacity={0.4} />
            {/* Ear hints */}
            <path d="M15 44 Q11 48 12 54 Q13 58 16 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            <path d="M65 44 Q69 48 68 54 Q67 58 64 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            {/* Subtle facial features */}
            <ellipse cx="32" cy="46" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <ellipse cx="48" cy="46" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
          </svg>
        );

      case "heart":
        // Heart face - wide forehead, high cheekbones, narrow pointed chin
        return (
          <svg viewBox="0 0 80 100" className={cn("w-full h-full", className)}>
            {/* Hair silhouette - wider at top */}
            <path
              d="M14 36 Q14 10 40 8 Q66 10 66 36"
              fill={hairColor}
              opacity={0.2}
              stroke="none"
            />
            {/* Face outline - wide forehead tapering to pointed chin */}
            <path
              d="M14 38 
                 Q14 24 22 16 
                 Q32 10 40 10 
                 Q48 10 58 16 
                 Q66 24 66 38 
                 L66 48 
                 Q66 58 58 68 
                 Q50 78 44 86 
                 Q42 90 40 90 
                 Q38 90 36 86 
                 Q30 78 22 68 
                 Q14 58 14 48 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* High cheekbone accents */}
            <path d="M18 50 Q22 54 26 50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <path d="M54 50 Q58 54 62 50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            {/* Widow's peak hint */}
            <path d="M35 14 Q40 18 45 14" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            {/* Ear hints */}
            <path d="M12 44 Q8 48 9 54 Q10 58 13 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            <path d="M68 44 Q72 48 71 54 Q70 58 67 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            {/* Subtle facial features */}
            <ellipse cx="32" cy="44" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <ellipse cx="48" cy="44" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
          </svg>
        );

      case "oblong":
        // Oblong face - longer than wide, high forehead, long straight cheeks
        return (
          <svg viewBox="0 0 80 100" className={cn("w-full h-full", className)}>
            {/* Hair silhouette */}
            <path
              d="M22 30 Q22 8 40 6 Q58 8 58 30"
              fill={hairColor}
              opacity={0.2}
              stroke="none"
            />
            {/* Face outline - elongated rectangle with soft edges */}
            <path
              d="M22 32 
                 Q22 22 28 14 
                 Q34 8 40 8 
                 Q46 8 52 14 
                 Q58 22 58 32 
                 L58 65 
                 Q58 78 50 86 
                 Q44 92 40 92 
                 Q36 92 30 86 
                 Q22 78 22 65 
                 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Long cheek lines */}
            <path d="M24 40 L24 58" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.3} opacity={0.25} />
            <path d="M56 40 L56 58" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.3} opacity={0.25} />
            {/* Ear hints */}
            <path d="M20 44 Q16 48 17 54 Q18 58 21 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            <path d="M60 44 Q64 48 63 54 Q62 58 59 56" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.6} opacity={0.5} />
            {/* Subtle facial features */}
            <ellipse cx="32" cy="44" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <ellipse cx="48" cy="44" rx="4" ry="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.4} opacity={0.3} />
            <path d="M38 58 Q40 61 42 58" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} opacity={0.4} />
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
