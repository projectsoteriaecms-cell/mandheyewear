import { Sparkle } from "@phosphor-icons/react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FeaturedFrames } from "@/modules/storefront/components/shared";
import {
  HeroSection,
  MarqueeTicker,
  EditorialGrid,
  CategoryCards,
  TestimonialSection,
  DualCtaSection,
  TrustBadges,
  PromoSlideshow,
} from "@/modules/storefront/components/home";
import { ScrollProgress } from "@/modules/storefront/components/home/ScrollProgress";
import { useSEO } from "@/shared/hooks/useSEO";
import { JsonLd } from "@/components/seo";

const Index = () => {
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
        url: "https://soteriaeyeclinic.lovable.app",
        logo: "https://soteriaeyeclinic.lovable.app/lovable-uploads/c6bc733f-cada-4635-b01a-c1aa00c8ba32.png",
        description: "Premium eye care services and designer eyewear in Nigeria.",
        contactPoint: { "@type": "ContactPoint", telephone: "08063363506", contactType: "customer service" },
      }} />
      
      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:h-[104px]" />

      <HeroSection />
      <MarqueeTicker />
      <PromoSlideshow />
      <EditorialGrid />
      <CategoryCards />
      <TestimonialSection />
      <FeaturedFrames />
      <DualCtaSection />
      <TrustBadges />

      {/* Chat Assistant Launcher */}
      <button 
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 p-4 rounded-full bg-flame text-cream shadow-flame hover:shadow-xl hover:scale-110 transition-all z-40 animate-float-slow"
        aria-label="Open chat assistant"
      >
        <Sparkle weight="duotone" className="h-6 w-6" />
      </button>

      <Footer />
    </div>
  );
};

export default Index;
