import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Navigation as NavIcon } from "lucide-react";

const Branches = () => {
  const branches = [
    {
      name: "Downtown Medical Center",
      address: "123 Healthcare Avenue",
      city: "Metropolitan City",
      state: "State",
      zip: "12345",
      phone: "+1 (234) 567-8901",
      email: "downtown@soteria-mh.com",
      hours: {
        weekdays: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed"
      },
      distance: "2.5 km away",
      features: ["Full Eye Exam Suite", "Designer Eyewear Showroom", "Contact Lens Fitting", "Emergency Eye Care"]
    },
    {
      name: "Eastside Vision Hub",
      address: "456 Wellness Street",
      city: "Metropolitan City",
      state: "State",
      zip: "12346",
      phone: "+1 (234) 567-8902",
      email: "eastside@soteria-mh.com",
      hours: {
        weekdays: "9:00 AM - 7:00 PM",
        saturday: "10:00 AM - 5:00 PM",
        sunday: "11:00 AM - 3:00 PM"
      },
      distance: "4.1 km away",
      features: ["Pediatric Eye Care", "Premium Frame Collection", "AI Try-On Studio", "Same-Day Repairs"]
    },
    {
      name: "Westgate Eye Care",
      address: "789 Medical Plaza",
      city: "Metropolitan City",
      state: "State",
      zip: "12347",
      phone: "+1 (234) 567-8903",
      email: "westgate@soteria-mh.com",
      hours: {
        weekdays: "8:30 AM - 5:30 PM",
        saturday: "9:00 AM - 3:00 PM",
        sunday: "Closed"
      },
      distance: "3.8 km away",
      features: ["Diabetic Eye Screening", "Luxury Eyewear Boutique", "Glaucoma Testing", "Optical Coherence Tomography"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Our Locations
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find a Soteria Eye Clinic & M&H Eyewear location convenient for you
            </p>
          </div>

          {/* Map Placeholder */}
          <Card className="mb-12 overflow-hidden">
            <div className="h-96 bg-gradient-subtle flex items-center justify-center">
              <div className="text-center space-y-4">
                <MapPin className="h-16 w-16 mx-auto text-primary" />
                <p className="text-lg font-medium text-foreground">Interactive Map</p>
                <p className="text-sm text-muted-foreground">Branch locations would be displayed here</p>
              </div>
            </div>
          </Card>

          {/* Branch Cards */}
          <div className="space-y-8">
            {branches.map((branch, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all">
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  {/* Location Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                        {branch.name}
                      </h2>
                      <p className="text-sm text-accent font-medium">{branch.distance}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-foreground">{branch.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {branch.city}, {branch.state} {branch.zip}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                        <a 
                          href={`tel:${branch.phone}`} 
                          className="text-foreground hover:text-primary transition-smooth"
                        >
                          {branch.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                        <a 
                          href={`mailto:${branch.email}`}
                          className="text-foreground hover:text-primary transition-smooth"
                        >
                          {branch.email}
                        </a>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-foreground">Mon-Fri: {branch.hours.weekdays}</p>
                          <p className="text-foreground">Saturday: {branch.hours.saturday}</p>
                          <p className="text-foreground">Sunday: {branch.hours.sunday}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {branch.features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Button variant="hero" className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Branch
                    </Button>
                    <Button variant="gold" className="w-full">
                      <NavIcon className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                    <Button variant="outline" className="w-full">
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="mt-16 gradient-hero overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center space-y-4">
              <h2 className="text-3xl font-display font-bold text-white">
                Can't Find a Nearby Location?
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                We're expanding! Contact us to learn about upcoming locations or to request a branch in your area.
              </p>
              <Button variant="secondary" size="lg">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Branches;
