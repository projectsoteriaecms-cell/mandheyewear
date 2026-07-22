import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

import { useSEO } from "@/shared/hooks/useSEO";
import { JsonLd } from "@/components/seo";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";
import { BrowsingRecommendations } from "@/components/shop/BrowsingRecommendations";
import { FeaturedFrames, HeroSection, MarqueeTicker, EditorialGrid, CategoryCards, TestimonialSection, DualCtaSection, TrustBadges, ScrollProgress } from "@/modules/storefront";
import { TryOnPromoDialog } from "@/components/try-on";
import { useAuth } from "@/modules/auth";

const Index = () => {
  const { isAuthenticated } = useAuth();

  useSEO({
    title: "M&H Eyewear – Premium Eye Care & Designer Frames in Nigeria",
    description: "See Better. Look Better. Book eye exams, shop designer frames, and try on glasses with AI. Premium eye care and eyewear across Nigeria.",
  });

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <ScrollProgress />
      <Navigation />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "M&H Eyewear",
        url: "https://mandheyewear.com",
        logo: "https://mandheyewear.com/og-image.png",
        description: "Premium eye care services and designer eyewear in Nigeria.",
        contactPoint: { "@type": "ContactPoint", telephone: "08063363506", contactType: "customer service" },
      }} />
      
      {/* Spacer for fixed navigation */}
      <div className="h-28 lg:h-[160px]" />

      <HeroSection />
      <MarqueeTicker />
      
      <EditorialGrid />
      <CategoryCards />
      
      {/* Personalized sections for logged-in users */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecentlyViewed />
          <BrowsingRecommendations />
        </div>
      )}
      
      <TestimonialSection />
      <FeaturedFrames />
      <DualCtaSection />
      <TrustBadges />

      <Footer />
      <TryOnPromoDialog />
    </div>
  );
};

export default Index;
