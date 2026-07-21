import { useState, useMemo } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BranchCard } from "@/components/branches/BranchCard";
import { BranchDetailDialog } from "@/components/branches/BranchDetailDialog";
import { BranchMap } from "@/components/branches/BranchMap";
import { BranchExpansionCTA } from "@/components/branches/BranchExpansionCTA";

import { Skeleton } from "@/components/ui/skeleton";
import { JsonLd } from "@/components/seo";
import { useBranches } from "@/modules/branches";
import type { Branch } from "@/modules/branches";

const DAY_MAP: Record<"weekdays" | "saturday" | "sunday", string[]> = {
  weekdays: ["Mo", "Tu", "We", "Th", "Fr"],
  saturday: ["Sa"],
  sunday: ["Su"],
};

function parseHours(label: string | null | undefined): { open: string; close: string } | null {
  if (!label) return null;
  const m = label.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*[–-]\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (!m) return null;
  const to24 = (h: string, mm: string | undefined, ap: string | undefined) => {
    let hh = parseInt(h, 10);
    const min = mm ? parseInt(mm, 10) : 0;
    if (ap) {
      const lower = ap.toLowerCase();
      if (lower === "pm" && hh < 12) hh += 12;
      if (lower === "am" && hh === 12) hh = 0;
    }
    return `${String(hh).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  };
  return { open: to24(m[1], m[2], m[3]), close: to24(m[4], m[5], m[6]) };
}

function buildOpeningHours(branch: Branch): string[] {
  const specs: string[] = [];
  (Object.keys(DAY_MAP) as Array<keyof typeof DAY_MAP>).forEach((key) => {
    const raw = (branch as any)[`hours_${key}`] as string | null;
    if (!raw || /closed/i.test(raw)) return;
    const parsed = parseHours(raw);
    if (!parsed) return;
    specs.push(`${DAY_MAP[key].join(",")} ${parsed.open}-${parsed.close}`);
  });
  return specs;
}

const Branches = () => {
  useSEO({
    title: "Our Locations – M&H Eyewear Branches in Nigeria",
    description:
      "Find an M&H Eyewear branch near you in Lagos, Delta, and Uyo. Visit us for eye exams, frame fittings, and premium eyewear.",
    canonical: "https://mandheyewear.com/branches",
  });

  const { data: branches, isLoading, error } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [highlightedBranch, setHighlightedBranch] = useState<Branch | null>(null);

  // Default map to head office
  const defaultBranch = useMemo(
    () => branches?.find((b) => b.is_head_office) ?? branches?.[0] ?? null,
    [branches]
  );

  const mapBranch = highlightedBranch ?? defaultBranch;

  const handleCardClick = (branch: Branch) => {
    setHighlightedBranch(branch);
  };

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  const branchesJsonLd = useMemo(() => {
    const items = (branches ?? []).filter((b) => b.is_active && b.is_mh_location);
    if (items.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@graph": items.map((b) => {
        const hours = buildOpeningHours(b);
        const node: Record<string, unknown> = {
          "@type": ["Optician", "LocalBusiness"],
          "@id": `https://mandheyewear.com/branches#${b.id}`,
          name: b.name,
          url: "https://mandheyewear.com/branches",
          address: {
            "@type": "PostalAddress",
            streetAddress: b.address,
            addressLocality: b.city,
            addressRegion: b.state,
            addressCountry: "NG",
          },
        };
        if (b.phone) node.telephone = b.phone;
        if (b.email) node.email = b.email;
        if (hours.length) node.openingHours = hours;
        if (b.latitude != null && b.longitude != null) {
          node.geo = {
            "@type": "GeoCoordinates",
            latitude: b.latitude,
            longitude: b.longitude,
          };
        }
        return node;
      }),
    };
  }, [branches]);

  return (
    <div className="min-h-screen bg-background">
      {branchesJsonLd && <JsonLd data={branchesJsonLd} />}
      <Navigation />

      <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  isActive={mapBranch?.id === branch.id}
                  onClick={handleCardClick}
                  onViewDetails={handleViewDetails}
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

          <BranchMap branch={mapBranch} />
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
