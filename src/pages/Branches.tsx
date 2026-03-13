import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BranchCard } from "@/components/branches/BranchCard";
import { BranchMapPlaceholder } from "@/components/branches/BranchMapPlaceholder";
import { BranchExpansionCTA } from "@/components/branches/BranchExpansionCTA";
import { useBranches } from "@/modules/branches/hooks/useBranches";
import { Skeleton } from "@/components/ui/skeleton";

const Branches = () => {
  useSEO({
    title: "Our Locations – M&H Eyewear Branches in Nigeria",
    description: "Find an M&H Eyewear branch near you in Lagos, Delta, and Uyo. Visit us for eye exams, frame fittings, and premium eyewear.",
  });

  const { data: branches, isLoading, error } = useBranches();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-3">
              Our Locations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find an M&H Eyewear location across Lagos, Delta and Uyo
            </p>
          </div>

          {/* Branch Cards - visible immediately */}
          <div className="space-y-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-6 border rounded-lg space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full max-w-md" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">
                  Failed to load branch locations. Please try again later.
                </p>
              </div>
            ) : branches && branches.length > 0 ? (
              branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No branch locations available at this time.
                </p>
              </div>
            )}
          </div>

          <BranchMapPlaceholder />

          <BranchExpansionCTA />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Branches;
