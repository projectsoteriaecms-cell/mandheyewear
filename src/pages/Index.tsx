import { Link } from "react-router-dom";
import { Eye, Glasses, Sparkles, MapPin, Star, Shield, Clock, Zap, Camera, ShoppingBag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import heroEyeCare from "@/assets/hero-eye-care.jpg";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const Index = () => {
  const services = [
    {
      icon: Eye,
      title: "Comprehensive Eye Exams",
      description: "Advanced diagnostics for optimal eye health",
      color: "text-primary"
    },
    {
      icon: Sparkles,
      title: "Specialist Care",
      description: "Expert treatment for complex conditions",
      color: "text-primary"
    },
    {
      icon: Glasses,
      title: "Contact Lenses",
      description: "Premium fitting and wide selection",
      color: "text-primary"
    },
    {
      icon: ShoppingBag,
      title: "Designer Frames",
      description: "Curated collection of luxury eyewear",
      color: "text-accent"
    },
    {
      icon: Camera,
      title: "AI Try-On Preview",
      description: "See frames on your face instantly",
      color: "text-accent"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule appointments seamlessly",
      color: "text-primary"
    }
  ];

  const branches = [
    {
      name: "Downtown Medical Center",
      city: "Metropolitan City",
      address: "123 Healthcare Avenue",
      distance: "2.5 km away"
    },
    {
      name: "Eastside Vision Hub",
      city: "Metropolitan City",
      address: "456 Wellness Street",
      distance: "4.1 km away"
    },
    {
      name: "Westgate Eye Care",
      city: "Metropolitan City",
      address: "789 Medical Plaza",
      distance: "3.8 km away"
    }
  ];

  const featuredFrames = [
    {
      image: frame1,
      name: "Aurora Gold",
      price: "$249",
      category: "Classic Round"
    },
    {
      image: frame2,
      name: "Metropolitan Black",
      price: "$189",
      category: "Rectangular"
    },
    {
      image: frame3,
      name: "Savanna Tortoise",
      price: "$299",
      category: "Cat-Eye"
    },
    {
      image: frame4,
      name: "Sky Aviator",
      price: "$329",
      category: "Aviator"
    }
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: "Trusted Expertise",
      description: "Board-certified specialists with years of experience"
    },
    {
      icon: Zap,
      title: "Advanced Technology",
      description: "AI-powered diagnostics and virtual try-on"
    },
    {
      icon: Clock,
      title: "Convenient Care",
      description: "Same-day appointments and flexible scheduling"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Curated designer frames and clinical excellence"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
              See Better. Look Better.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One unified experience combining premium eye care and designer eyewear
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book an Eye Exam
                </Link>
              </Button>
              <Button variant="gold" size="lg" asChild>
                <Link to="/eyewear">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Eyewear
                </Link>
              </Button>
            </div>
          </div>

          {/* Dual Journey Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <Card className="group overflow-hidden border-2 hover:border-primary transition-all cursor-pointer">
              <Link to="/eye-care">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={heroEyeCare} 
                    alt="Eye Care Services" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">
                      For Eye Care
                    </h2>
                    <p className="text-white/90 text-sm">
                      Expert medical services and comprehensive exams
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Button variant="outline" className="w-full">
                    Explore Services
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="group overflow-hidden border-2 hover:border-accent transition-all cursor-pointer">
              <Link to="/eyewear">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={heroEyewear} 
                    alt="Designer Eyewear" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/90 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-display font-bold text-accent-foreground mb-2">
                      For Eyewear
                    </h2>
                    <p className="text-accent-foreground/90 text-sm">
                      Designer frames and AI-powered try-on
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Button variant="gold" className="w-full">
                    Shop Collection
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive eye care and premium eyewear in one place
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                      <Icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Try-On Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden bg-gradient-subtle border-2 border-accent/20">
            <CardContent className="p-8 sm:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex p-2 rounded-lg bg-accent/10">
                    <Camera className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-foreground">
                    AI Try-On Preview
                  </h2>
                  <p className="text-muted-foreground">
                    See how frames look on your face before you buy. Upload your photo and preview our entire collection instantly with AI-powered precision.
                  </p>
                  <Button variant="gold" asChild>
                    <Link to="/try-on">
                      Try It Now
                    </Link>
                  </Button>
                </div>
                <div className="bg-secondary/50 rounded-lg p-8 text-center space-y-4">
                  <Camera className="h-20 w-20 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload your selfie and virtually try on hundreds of frames
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Frames */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Featured Frames
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked designer eyewear from our premium collection
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFrames.map((frame, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-gold transition-all cursor-pointer">
                <div className="relative h-64 overflow-hidden bg-secondary">
                  <img 
                    src={frame.image} 
                    alt={frame.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-accent font-medium">{frame.category}</p>
                  <h3 className="font-semibold text-foreground">{frame.name}</h3>
                  <p className="text-lg font-bold text-accent">{frame.price}</p>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="gold" asChild>
              <Link to="/eyewear">
                View Full Collection
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Branch Locator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Visit Our Branches
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find a Soteria Eye Clinic & M&H Eyewear location near you
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {branches.map((branch, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{branch.name}</h3>
                      <p className="text-sm text-muted-foreground">{branch.city}</p>
                      <p className="text-sm text-muted-foreground">{branch.address}</p>
                      <p className="text-xs text-accent font-medium mt-2">{branch.distance}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="hero" asChild>
              <Link to="/branches">
                View All Locations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Why Choose Soteria & M&H
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of clinical excellence and fashion-forward eyewear
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center space-y-3">
                  <div className="inline-flex p-4 rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="gradient-hero text-white overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-display font-bold">
                Ready to Experience Better Vision?
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Book your comprehensive eye exam today and explore our premium eyewear collection
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/booking">
                    Book Appointment
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link to="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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
