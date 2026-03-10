import { useSEO } from "@/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, Eye, Glasses, Shield, Heart, Hospital } from "lucide-react";
import soteriaLogo from "@/assets/soteria-logo.png";

const Partners = () => {
  useSEO({
    title: "Our Partners – M&H Eyewear",
    description: "M&H Eyewear partners with Soteria Eye Clinic and leading HMO providers to deliver comprehensive eye care across Nigeria.",
  });

  const hmoPartners = [
    { name: "Leadway Health", plans: ["Gold", "Platinum"], type: "HMO" },
    { name: "AXA Mansard", plans: ["Standard", "Premium"], type: "HMO" },
    { name: "Hygeia HMO", plans: ["Classic", "Premier"], type: "HMO" },
    { name: "Reliance HMO", plans: ["Essential", "Corporate"], type: "HMO" },
    { name: "Avon HMO", plans: ["Basic", "Premium"], type: "HMO" },
    { name: "Clearline HMO", plans: ["Standard", "Executive"], type: "HMO" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Handshake className="h-3.5 w-3.5 mr-1.5" />
              Our Partners
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Partners & Affiliations
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Together with our partners, we deliver world-class eye care and premium eyewear across Nigeria
            </p>
          </div>

          {/* Strategic Partner — Soteria Eye Clinic */}
          <section className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                Strategic Partner
              </h2>
              <p className="text-muted-foreground">
                Clinical excellence powered by partnership
              </p>
            </div>

            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-secondary/50 to-background">
              <CardContent className="p-8 sm:p-12">
                <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center">
                  <div className="flex justify-center">
                    <div className="w-40 h-40 rounded-2xl bg-white shadow-lg flex items-center justify-center p-4">
                      <img
                        src={soteriaLogo}
                        alt="Soteria Eye Clinic logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                        Soteria Eye Clinic
                      </h3>
                      <Badge className="bg-primary text-primary-foreground">
                        Strategic Partner
                      </Badge>
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Soteria Eye Clinic is our strategic clinical partner, providing comprehensive
                      ophthalmic and optometric services across our shared branch network. With
                      board-certified specialists and advanced diagnostic technology, Soteria brings
                      15+ years of clinical excellence to our patients.
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4 pt-2">
                      <div className="flex items-start gap-2">
                        <Eye className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Comprehensive Eye Exams</p>
                          <p className="text-xs text-muted-foreground">Full clinical diagnostics</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Specialist Consultations</p>
                          <p className="text-xs text-muted-foreground">Board-certified doctors</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Glasses className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-sm">Prescription Services</p>
                          <p className="text-xs text-muted-foreground">Seamless lens fitting</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" asChild>
                        <a href="https://soteriaeyeclinic.com" target="_blank" rel="noopener noreferrer">
                          Visit Soteria Eye Clinic →
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* HMO Partners */}
          <section className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                HMO Partners
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We accept plans from leading health maintenance organisations, making quality eye care accessible to more Nigerians
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hmoPartners.map((partner) => (
                <Card key={partner.name} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Hospital className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{partner.name}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {partner.plans.map((plan) => (
                            <Badge key={plan} variant="outline" className="text-xs">
                              {plan}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Don't see your HMO listed?{" "}
                <a href="/contact" className="text-primary underline hover:no-underline">
                  Contact us
                </a>{" "}
                to check eligibility.
              </p>
            </div>
          </section>

          {/* Partnership CTA */}
          <Card className="gradient-subtle border-2 border-primary/20">
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <Heart className="h-10 w-10 text-primary mx-auto" />
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Become a Partner
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Interested in partnering with M&H Eyewear? We're always looking to expand our
                network to bring quality eye care and eyewear to more people.
              </p>
              <Button asChild>
                <a href="/contact">Get in Touch</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Partners;
