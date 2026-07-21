import { MapPin, Eye } from "lucide-react";
import type { Branch } from "@/modules/branches";

interface BranchCardProps {
  branch: Branch;
  isActive?: boolean;
  onClick: (branch: Branch) => void;
  onViewDetails: (branch: Branch) => void;
}

const gradients = [
  "from-[hsl(220,30%,15%)] via-[hsl(220,25%,22%)] to-[hsl(220,20%,12%)]",
  "from-[hsl(200,30%,14%)] via-[hsl(200,25%,20%)] to-[hsl(200,20%,11%)]",
  "from-[hsl(240,25%,16%)] via-[hsl(240,20%,22%)] to-[hsl(240,15%,12%)]",
  "from-[hsl(180,20%,14%)] via-[hsl(180,18%,20%)] to-[hsl(180,15%,11%)]",
  "from-[hsl(260,25%,16%)] via-[hsl(260,20%,22%)] to-[hsl(260,15%,13%)]",
];

export const BranchCard = ({ branch, isActive, onClick, onViewDetails }: BranchCardProps) => {
  const gradientIndex =
    branch.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    gradients.length;

  return (
    <button
      onClick={() => onClick(branch)}
      className={`
        relative w-full aspect-[4/3] rounded-2xl overflow-hidden
        bg-gradient-to-br ${gradients[gradientIndex]}
        group cursor-pointer transition-all duration-300
        hover:scale-[1.03] hover:shadow-2xl
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] shadow-xl" : ""}
      `}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      {/* Badges */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {branch.is_head_office && (
          <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider rounded-full">
            Head Office
          </span>
        )}
        {branch.is_mh_location && (
          <span className="px-2.5 py-1 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-wider rounded-full">
            Flagship
          </span>
        )}
      </div>

      {/* View Details button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(branch);
        }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          hover:bg-white/20 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title="View Details"
      >
        <Eye className="h-4 w-4 text-white" />
      </button>

      {/* Content — centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2 leading-tight">
          {branch.name}
        </h2>
        <p className="text-white/70 text-sm max-w-[220px] leading-relaxed">
          {branch.address}
        </p>
        <p className="text-white/50 text-xs mt-1">
          {branch.city}, {branch.state}
        </p>
      </div>

      {/* Bottom icon */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <MapPin className={`h-5 w-5 transition-opacity ${isActive ? "text-primary opacity-100" : "text-primary opacity-80 group-hover:opacity-100"}`} />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};
