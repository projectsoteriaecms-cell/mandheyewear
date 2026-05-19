import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import team8921 from "@/assets/soteria/team-tri-8921.jpg";
import team1731 from "@/assets/soteria/team-photo-1731.jpg";
import team9133 from "@/assets/soteria/team-tri-9133.jpg";
import team9111 from "@/assets/soteria/team-tri-9111.jpg";
import team8976 from "@/assets/soteria/team-tri-8976.jpg";
import team8933 from "@/assets/soteria/team-tri-8933.jpg";

const teamMembers = [
  { name: "Dr. Mac-Asore", role: "Medical Director", image: team8921 },
  { name: "Mrs. Harriet Mac-Asore", role: "CEO", image: team1731 },
  { name: "Clinical Team", role: "Optometrist", image: team9133 },
  { name: "Clinical Team", role: "Ophthalmologist", image: team9111 },
  { name: "Support Staff", role: "Patient Care", image: team8976 },
  { name: "Support Staff", role: "Reception", image: team8933 },
];

export const TeamGallery = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">
            Our Team
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            Meet the Experts Behind Your Eye Care
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            75 dedicated professionals across 3 cities, committed to protecting and enhancing your vision
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] animate-pop-in"
              style={{ animationDelay: `${0.1 + index * 0.08}s` }}
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-semibold text-white text-sm">{member.name}</p>
                <p className="text-white/70 text-xs">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/about">Learn More About Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};