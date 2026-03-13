import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Branch } from "@/modules/branches/types";

interface BranchMapProps {
  branch: Branch | null;
}

export const BranchMap = ({ branch }: BranchMapProps) => {
  if (!branch) {
    return (
      <Card className="mb-12 overflow-hidden">
        <div className="h-96 bg-gradient-subtle flex items-center justify-center">
          <div className="text-center space-y-4">
            <MapPin className="h-16 w-16 mx-auto text-primary" />
            <p className="text-lg font-medium text-foreground">Interactive Map</p>
            <p className="text-sm text-muted-foreground">
              Select a branch to view its location
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Use coordinates if available, otherwise fall back to address search
  const lat = (branch as any).latitude;
  const lng = (branch as any).longitude;

  let mapSrc: string;
  if (lat && lng) {
    const bbox = `${lng - 0.01},${lat - 0.007},${lng + 0.01},${lat + 0.007}`;
    mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  } else {
    // Fallback: use address-based query via nominatim
    const query = encodeURIComponent(`${branch.address}, ${branch.city}, ${branch.state}, Nigeria`);
    mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=3.0,4.5,8.5,7.0&layer=mapnik`;
  }

  return (
    <Card className="mb-12 overflow-hidden">
      <div className="relative">
        {/* Branch label */}
        <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{branch.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{branch.address}</p>
        </div>

        <iframe
          key={branch.id}
          src={mapSrc}
          className="w-full h-96 border-0"
          loading="lazy"
          title={`Map showing ${branch.name}`}
          referrerPolicy="no-referrer"
        />
      </div>
    </Card>
  );
};
