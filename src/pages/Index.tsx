import { Sparkle } from "@phosphor-icons/react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FeaturedFrames } from "@/components/storefront";
import {
  HeroSection,
  CategoryCards,
  QuickDiscovery,
  QuizPromo,
  VirtualTryOn,
  TrustBadges,
} from "@/components/home";
import { useSEO } from "@/hooks/useSEO";
import { JsonLd } from "@/components/seo";

const Index = () => {
  useSEO({
    title: "M&H Eyewear – Premium Eye Care & Designer Frames in Nigeria",
    description: "See Better. Look Better. Book eye exams, shop designer frames, and try on glasses with AI. Premium eye care and eyewear across Nigeria.",
  });

  return (
    <div className="min-h-screen bg-background">
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

      {/* Hero Section */}
      <HeroSection />

      {/* Quick Discovery Section */}
      <QuickDiscovery />

      {/* Category Cards */}
      <CategoryCards />

      {/* Style Quiz Promotion */}
      <QuizPromo />

      {/* Featured Frames - Dynamic from Database */}
      <FeaturedFrames />

      {/* Virtual Try-On Feature */}
      <VirtualTryOn />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Chat Assistant Launcher */}
      <button 
        className="fixed bottom-6 right-6 p-4 rounded-full bg-accent text-accent-foreground shadow-gold hover:shadow-xl hover:scale-110 transition-all z-40 animate-float-slow"
        aria-label="Open chat assistant"
      >
        <Sparkle weight="duotone" className="h-6 w-6" />
      </button>

      <Footer />
    </div>
  );
};

export default Index;
