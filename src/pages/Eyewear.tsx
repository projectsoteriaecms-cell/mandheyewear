import { useSEO } from "@/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowSquareOut } from "@phosphor-icons/react";
import mhLogo from "@/assets/mh-logo.png";

const Eyewear = () => {
  useSEO({
    title: "Eyewear – Soteria Eye Clinic",
    description: "Visit our partner M&H Eyewear for premium designer frames and fashion eyewear. Get your prescription from Soteria, then find your perfect frames.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Hero */}
          <div className="mb-12">
            <Badge variant="secondary" className="mb-4">
              <ArrowSquareOut className="h-3.5 w-3.5 mr-1.5" />
              Partner Eyewear
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Premium Eyewear by M&H
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Looking for designer frames? Our strategic partner M&H Eyewear offers a curated collection 
              of premium frames with AI-powered virtual try-on.
            </p>
          </div>

          {/* M&H Card */}
          <Card className="border-2 border-accent/20 mb-8">
            <CardContent className="p-8 sm:p-12 space-y-6">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-secondary flex items-center justify-center p-4">
                <img src={mhLogo} alt="M&H Eyewear" className="w-full h-full object-contain" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-display font-bold text-foreground">M&H Eyewear</h2>
                <p className="text-muted-foreground leading-relaxed">
                  M&H Eyewear brings together designer fashion and precision optics. Browse hundreds of 
                  premium frames, try them on virtually with AI, and find the perfect match for your style 
                  and prescription.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <a href="https://www.mandheyewear.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Shop M&H Eyewear
                    <ArrowSquareOut weight="bold" className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/booking">Book Eye Exam First</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            Get your prescription from Soteria Eye Clinic, then visit M&H Eyewear to find your perfect frames.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Eyewear;
