import { Images, CheckCircle, Warning } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";

interface ImageStatsCardsProps {
  stats: {
    total: number;
    withPrimary: number;
    missingPrimary: number;
    complete: number;
    isLoading: boolean;
  };
  filteredStats: {
    total: number;
    withPrimary: number;
    missingPrimary: number;
    complete: number;
  } | null;
}

export const ImageStatsCards = ({ stats, filteredStats }: ImageStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Images className="h-4 w-4" />
          Total Products
        </div>
        <p className="text-2xl font-bold mt-1">
          {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : (filteredStats?.total ?? stats.total)}
        </p>
      </div>
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          With Images
        </div>
        <p className="text-2xl font-bold mt-1 text-green-600">
          {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : (filteredStats?.withPrimary ?? stats.withPrimary)}
        </p>
      </div>
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Warning className="h-4 w-4 text-amber-500" />
          Missing Primary
        </div>
        <p className="text-2xl font-bold mt-1 text-amber-600">
          {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : (filteredStats?.missingPrimary ?? stats.missingPrimary)}
        </p>
      </div>
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <CheckCircle className="h-4 w-4 text-primary" />
          Complete (5+ images)
        </div>
        <p className="text-2xl font-bold mt-1 text-primary">
          {stats.isLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : (filteredStats?.complete ?? stats.complete)}
        </p>
      </div>
    </div>
  );
};
