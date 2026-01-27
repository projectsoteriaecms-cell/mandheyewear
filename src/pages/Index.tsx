import { Sparkles } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FeaturedFrames } from "@/components/storefront";
import {
  HeroSection,
  CategoryCards,
  QuizPromo,
  VirtualTryOn,
  TrustBadges,
  Newsletter,
} from "@/components/home";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:h-[104px]" />

      {/* Hero Section */}
      <HeroSection />

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

      {/* Newsletter Signup */}
      <Newsletter />

      {/* Chat Assistant Launcher */}
      <button 
        className="fixed bottom-6 right-6 p-4 rounded-full bg-accent text-accent-foreground shadow-gold hover:shadow-xl transition-all z-40"
        aria-label="Open chat assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      <Footer />
    </div>
  );
};

export default Index;
