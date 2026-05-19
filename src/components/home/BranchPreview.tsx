import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useBranches } from "@/hooks/useBranches";

export const BranchPreview = () => {
  const { data: branches, isLoading } = useBranches();
  
  const displayBranches = (branches || []).filter(b => b.is_active).slice(0, 3);

  if (isLoading || displayBranches.length === 0) return null;

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">
            Our Locations
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            Find a Branch Near You
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visit any of our conveniently located branches across Nigeria
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {displayBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover-lift transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin weight="duotone" className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-foreground">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground">{branch.address}</p>
                  <p className="text-sm text-muted-foreground">{branch.city}, {branch.state}</p>
                  {branch.phone && (
                    <p className="text-sm text-primary font-medium">{branch.phone}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/branches" className="flex items-center gap-2">
              View All Locations
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
