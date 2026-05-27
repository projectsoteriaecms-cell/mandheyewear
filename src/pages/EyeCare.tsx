import { useSEO } from "@/shared/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Activity, Droplet, Glasses, Stethoscope, Users, Calendar } from "lucide-react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { buildBookingWhatsAppUrl } from "@/shared/lib/whatsappBooking";
import { JsonLd } from "@/components/seo";

const EyeCare = () => {
  useSEO({
    title: "Eye Care Services – Eye Exams & Vision Tests | M&H Eyewear",
    description: "Comprehensive eye care: eye exams, vision tests, contact lens fitting, glaucoma testing. Book your appointment at M&H Eyewear Nigeria today.",
    canonical: "https://mandheyewear.com/eye-care",
  });

  const services = [
    {
      icon: Eye,
      title: "Comprehensive Eye Exams",
      description: "Complete evaluation of your eye health and vision, including refraction, eye pressure testing, and retinal examination. Recommended annually for adults.",
      duration: "45-60 minutes",
      price: "From ₦25,000"
    },
    {
      icon: Activity,
      title: "Diabetic Eye Screening",
      description: "Specialized screening to detect diabetic retinopathy and other diabetes-related eye conditions. Essential for managing long-term eye health.",
      duration: "30-45 minutes",
      price: "From ₦20,000"
    },
    {
      icon: Droplet,
      title: "Glaucoma Testing",
      description: "Advanced diagnostic testing to detect glaucoma early, including tonometry, visual field testing, and optic nerve imaging.",
      duration: "30 minutes",
      price: "From ₦15,000"
    },
    {
      icon: Glasses,
      title: "Contact Lens Fitting",
      description: "Professional fitting and training for contact lenses, including measurement of corneal curvature and personalized lens selection.",
      duration: "60 minutes",
      price: "From ₦30,000"
    },
    {
      icon: Users,
      title: "Pediatric Eye Care",
      description: "Specialized eye exams for children, including vision development assessment, amblyopia screening, and school-readiness evaluations.",
      duration: "45 minutes",
      price: "From ₦20,000"
    },
    {
      icon: Stethoscope,
      title: "Specialty Consultations",
      description: "Expert consultations for complex eye conditions, including cataracts, macular degeneration, dry eye syndrome, and more.",
      duration: "60-90 minutes",
      price: "From ₦35,000"
    }
  ];

  const features = [
    "Board-Certified Ophthalmologists & Optometrists",
    "State-of-the-Art Diagnostic Equipment",
    "Same-Day Emergency Eye Care",
    "HMO & Health Insurance Accepted",
    "Convenient Online Booking",
    "Flexible Appointment Scheduling"
  ];

  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@graph": services.map((s) => ({
      "@type": "MedicalProcedure",
      name: s.title,
      description: s.description,
      procedureType: "https://schema.org/DiagnosticProcedure",
      provider: {
        "@type": "Optician",
        name: "M&H Eyewear",
        url: "https://mandheyewear.com",
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={servicesJsonLd} />
      <Navigation />
      
      
      <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              M&H Eye Care Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Comprehensive eye health services backed by clinical excellence and advanced technology
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book an Appointment
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white">
                <a href={buildBookingWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                  <WhatsappLogo weight="fill" className="mr-2 h-5 w-5" />
                  Book via WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-muted-foreground">
                            <strong className="text-foreground">Duration:</strong> {service.duration}
                          </span>
                          <span className="text-accent font-semibold">{service.price}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/booking">Learn More & Book</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features */}
          <Card className="mb-16 bg-gradient-subtle">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-8">
                Why Choose M&H Eye Care
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-foreground">{feature}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insurance Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Card>
              <CardContent className="p-8 space-y-4">
                <h3 className="text-2xl font-display font-bold text-foreground">
                  Insurance & Payment
                </h3>
                <p className="text-muted-foreground">
                  We accept most major HMO and health insurance plans. 
                  Our team will work with you to maximize your benefits and minimize out-of-pocket costs.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Flexible payment plans available</li>
                  <li>• Major HMO plans accepted</li>
                  <li>• Transparent pricing with no hidden fees</li>
                  <li>• Insurance verification before your visit</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 space-y-4">
                <h3 className="text-2xl font-display font-bold text-foreground">
                  What to Expect
                </h3>
                <p className="text-muted-foreground">
                  Your visit begins with a thorough assessment of your vision and eye health. 
                  Our specialists use advanced diagnostic technology to ensure accurate results.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Detailed patient history review</li>
                  <li>• Comprehensive eye examination</li>
                  <li>• Personalized treatment recommendations</li>
                  <li>• Prescription updates when needed</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Card className="gradient-hero overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                Ready to Schedule Your Visit?
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Book your comprehensive eye exam today and take the first step toward optimal eye health
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/booking">
                    Book Appointment
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-[#25D366] border-[#25D366] text-white hover:bg-[#1ebe5a] hover:text-white"
                  asChild
                >
                  <a href={buildBookingWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                    <WhatsappLogo weight="fill" className="mr-2 h-5 w-5" />
                    Book via WhatsApp
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white text-white hover:bg-white hover:text-primary"
                  asChild
                >
                  <Link to="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EyeCare;
