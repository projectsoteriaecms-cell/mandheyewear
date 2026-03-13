import { useState } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BranchCard } from "@/components/branches/BranchCard";
import { BranchDetailDialog } from "@/components/branches/BranchDetailDialog";
import { BranchMapPlaceholder } from "@/components/branches/BranchMapPlaceholder";
import { BranchExpansionCTA } from "@/components/branches/BranchExpansionCTA";
import { useBranches } from "@/modules/branches/hooks/useBranches";
import { Skeleton } from "@/components/ui/skeleton";
import type { Branch } from "@/modules/branches/types";

const Branches = () => {
  useSEO({
    title: "Our Locations – M&H Eyewear Branches in Nigeria",
    description:
      "Find an M&H Eyewear branch near you in Lagos, Delta, and Uyo. Visit us for eye exams, frame fittings, and premium eyewear.",
  });

  const { data: branches, isLoading, error } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-3">
              Our Locations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find an M&H Eyewear location across Lagos, Delta and Uyo
            </p>
          </div>

          {/* Branch Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">
                Failed to load branch locations. Please try again later.
              </p>
            </div>
          ) : branches && branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onClick={setSelectedBranch}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No branch locations available at this time.
              </p>
            </div>
          )}

          <BranchMapPlaceholder />
          <BranchExpansionCTA />
        </div>
      </div>

      <BranchDetailDialog
        branch={selectedBranch}
        open={!!selectedBranch}
        onOpenChange={(open) => !open && setSelectedBranch(null)}
      />

      <Footer />
    </div>
  );
};

export default Branches;
