import { Link } from "react-router-dom";
import { Eye, Stethoscope, Baby, Drop, Eyeglasses, FirstAidKit } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Stethoscope,
    title: "Doctor Consultation",
    description: "Expert consultations with certified ophthalmologists and optometrists for all eye conditions",
    link: "/booking",
  },
  {
    icon: Eye,
    title: "Computerized Eye Tests",
    description: "Advanced computerized diagnostics for accurate vision assessment and eye health evaluation",
    link: "/booking",
  },
  {
    icon: Drop,
    title: "Glaucoma Screening",
    description: "Early detection and management of glaucoma with specialized intraocular pressure testing",
    link: "/booking",
  },
  {
    icon: FirstAidKit,
    title: "Outpatient Clinic",
    description: "Walk-in and scheduled outpatient eye treatments for a wide range of conditions",
    link: "/booking",
  },
  {
    icon: Baby,
    title: "Pediatric Eye Care",
    description: "Specialized eye exams and vision care for children of all ages",
    link: "/booking",
  },
  {
    icon: Eyeglasses,
    title: "Prescription Glasses & Lenses",
    description: "Quality prescription spectacles, contact lenses, and professional fitting services",
    link: "/booking",
  },
];

export const ServicesOverview = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float-slow" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">
            Our Services
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            Comprehensive Eye Care
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From routine eye exams to specialized treatments, we provide a full spectrum of clinical eye care services using cutting-edge technology
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1500">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={service.title} 
                className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 card-3d-hover animate-pop-in"
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                <div className="w-14 h-14 mb-5 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-500">
                  <Icon weight="duotone" className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
                <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 p-0 h-auto">
                  <Link to={service.link}>
                    Book Appointment →
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" asChild>
            <Link to="/eye-care">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};