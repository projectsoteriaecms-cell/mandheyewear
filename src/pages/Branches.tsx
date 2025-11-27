import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Navigation as NavIcon } from "lucide-react";

const Branches = () => {
  const branches = [
    {
      name: "Soteria Eye Clinic – Warri (Head Office)",
      address: "28 Kotie Street, off Okumagba Avenue",
      city: "Warri",
      state: "Delta State",
      phone: "08063363506",
      email: "info@soteriaeyeclinic.com",
      hours: {
        weekdays: "9:00am – 6:00pm",
        saturday: "9:00am – 6:00pm",
        sunday: "Closed"
      },
      region: "Delta State",
      isHeadOffice: true,
      isMH: false,
      features: ["Full Eye Exam Suite", "M&H Eyewear Boutique", "Diabetic Eye Screening", "Glaucoma Testing", "Emergency Eye Care", "Corporate Office"]
    },
    {
      name: "Soteria Eye Clinic – Lagos (Lekki)",
      address: "Atlantic Shopping & Entertainment Centre, Chevron Drive",
      city: "Lekki, Lagos",
      state: "Lagos State",
      phone: "08063363506",
      email: "info@soteriaeyeclinic.com",
      hours: {
        weekdays: "9:00am – 6:00pm",
        saturday: "9:00am – 6:00pm",
        sunday: "Closed"
      },
      region: "Lagos State",
      isHeadOffice: false,
      isMH: false,
      features: ["Comprehensive Eye Exams", "M&H Eyewear Showroom", "Contact Lens Fitting", "AI Try-On Studio"]
    },
    {
      name: "Soteria Eye Clinic – Effurun (Delta Mall)",
      address: "Shop 53A, Delta Mall (Shoprite)",
      city: "Effurun",
      state: "Delta State",
      phone: "08063363506",
      email: "info@soteriaeyeclinic.com",
      hours: {
        weekdays: "9:00am – 6:00pm",
        saturday: "9:00am – 6:00pm",
        sunday: "Closed"
      },
      region: "Delta State",
      isHeadOffice: false,
      isMH: false,
      features: ["Eye Examinations", "M&H Eyewear Collection", "Premium Frame Selection", "Same-Day Repairs"]
    },
    {
      name: "Soteria Eye Clinic – Uyo (Tropicana Mall)",
      address: "Tropicana Mall, Shop GBA, Udo Udoma Avenue",
      city: "Uyo",
      state: "Akwa Ibom State",
      phone: "08063363506",
      email: "info@soteriaeyeclinic.com",
      hours: {
        weekdays: "9:00am – 6:00pm",
        saturday: "9:00am – 6:00pm",
        sunday: "Closed"
      },
      region: "Akwa Ibom State",
      isHeadOffice: false,
      isMH: false,
      features: ["Pediatric Eye Care", "M&H Designer Frames", "Contact Lens Services", "Optical Coherence Tomography"]
    },
    {
      name: "M&H Eyewear – Lagos (Lekki Flagship)",
      address: "Shop TM4 Talea Mall 1, Alternative Route Junction, Chevron Dr, off Lekki Epe Expressway",
      city: "Eti-Osa, Lekki",
      state: "Lagos State",
      phone: "08063363506",
      email: "info@soteriaeyeclinic.com",
      hours: {
        weekdays: "9:00am – 6:00pm",
        saturday: "9:00am – 6:00pm",
        sunday: "Closed"
      },
      region: "Lagos State",
      isHeadOffice: false,
      isMH: true,
      features: ["Designer Eyewear Collection", "AI Virtual Try-On", "Luxury Frame Boutique", "Custom Fittings", "Premium Sunglasses", "Fashion Consultation"]
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
              Find a Soteria Eye Clinic & M&H Eyewear location across Lagos, Delta and Uyo
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              M&H Eyewear has a flagship boutique in Lekki and is also available at all Soteria Eye Clinic locations
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
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-display font-bold text-foreground">
                          {branch.name}
                        </h2>
                        {branch.isHeadOffice && (
                          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                            Head Office
                          </span>
                        )}
                        {branch.isMH && (
                          <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">
                            Flagship Store
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-accent font-medium">{branch.region}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-foreground">{branch.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {branch.city}, {branch.state}, Nigeria
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
                          <p className="text-foreground">Mon-Sat: {branch.hours.weekdays}</p>
                          <p className="text-foreground">Sunday: {branch.hours.sunday}</p>
                          <p className="text-xs text-muted-foreground mt-1">(Hours to be confirmed)</p>
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
                      Call {branch.isMH ? "Store" : "Branch"}
                    </Button>
                    <Button variant="gold" className="w-full">
                      <NavIcon className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                    {!branch.isMH && (
                      <Button variant="outline" className="w-full">
                        Book Appointment
                      </Button>
                    )}
                    {branch.isMH && (
                      <Button variant="outline" className="w-full">
                        Shop Eyewear
                      </Button>
                    )}
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
