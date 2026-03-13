import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Award, Users, Sparkles, Eye, Glasses } from "lucide-react";
import soteriaLogo from "@/assets/soteria-logo.png";

const About = () => {
  useSEO({
    title: "About M&H Eyewear – Our Story",
    description: "Learn about M&H Eyewear's mission to deliver premium eye care and designer frames across Nigeria. 15+ years of excellence.",
  });

  const values = [
    {
      icon: Heart,
      title: "Patient-First Care",
      description: "Your vision and comfort are our top priorities in everything we do"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Board-certified specialists and premium quality in every service"
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "Leveraging cutting-edge technology for better outcomes"
    },
    {
      icon: Users,
      title: "Community",
      description: "Building lasting relationships with the families we serve"
    }
  ];

  const stats = [
    { number: "50K+", label: "Patients Served" },
    { number: "15+", label: "Years of Excellence" },
    { number: "12", label: "Board-Certified Specialists" },
    { number: "1000+", label: "Designer Frames" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              About M&H Eyewear
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Where clinical excellence meets fashion-forward eyewear in a unified experience
            </p>
          </div>

          {/* Story Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex p-3 rounded-full bg-accent/10">
                  <Glasses className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">
                  Premium Eyewear
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  M&H Eyewear brings designer fashion to your vision needs. Our curated collection features the 
                  latest styles from premium brands, carefully selected to complement every face shape, personal 
                  style, and lifestyle requirement.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  With our revolutionary AI-powered try-on technology and expert fitting services, finding your 
                  perfect frames has never been easier. We merge fashion, function, and technology to help you 
                  look your absolute best while seeing clearly.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="inline-flex p-3 rounded-full bg-primary/10">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground">
                  Comprehensive Eye Care
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  With over 15 years of experience, our eye care division has been at the forefront of comprehensive 
                  eye health services. Our team of board-certified ophthalmologists and optometrists are dedicated to 
                  protecting and enhancing your vision through advanced diagnostics and specialized treatments.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We believe that quality eye care should be accessible, convenient, and delivered with compassion. 
                  From routine exams to complex procedures, we're here to ensure your eyes remain healthy for life.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-2">
                  <p className="text-4xl font-display font-bold text-primary">{stat.number}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Values */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Our Core Values
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-all">
                    <CardContent className="p-6 space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-secondary">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Partnership Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Our Clinical Partner
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powered by a strategic partnership with Soteria Eye Clinic
              </p>
            </div>
            <Card className="overflow-hidden border border-primary/20">
              <CardContent className="p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center p-3 shrink-0">
                    <img
                      src={soteriaLogo}
                      alt="Soteria Eye Clinic"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h3 className="text-xl font-display font-bold text-foreground">
                      Soteria Eye Clinic
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our clinical operations are powered by Soteria Eye Clinic — a trusted name in comprehensive 
                      ophthalmic and optometric care with over 15 years of experience. Together, we combine 
                      clinical expertise with fashion-forward eyewear to deliver a seamless vision care experience.
                    </p>
                    <a href="/partners" className="inline-block text-primary text-sm font-medium hover:underline">
                      View all partners →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission Statement */}
          <Card className="gradient-subtle border-2 border-primary/20">
            <CardContent className="p-8 sm:p-12">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To revolutionize the way people experience eye care and eyewear by combining clinical 
                  excellence with fashion-forward design in a seamless, technology-enabled platform that 
                  puts patient satisfaction first.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe that everyone deserves to see clearly and look confidently—and we're committed 
                  to making that a reality through innovation, expertise, and genuine care.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
