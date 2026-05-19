import { Star, Quotes } from "@phosphor-icons/react";

const testimonials = [
  {
    name: "Jackson Janny",
    location: "Lagos",
    text: "Soteria eye clinic always offers the best eye care services. The doctors are professional, patient, and truly care about your vision health. I always leave feeling confident about my eye care.",
    rating: 5,
  },
  {
    name: "Obiajuru Evangeline",
    location: "Lagos",
    text: "Love the service, love the doctors and the staffs. They are always warm, welcoming, and professional. I've been coming here for years and I wouldn't go anywhere else for my eye care.",
    rating: 5,
  },
  {
    name: "Blessing Okafor",
    location: "Delta",
    text: "The computerized eye test was very thorough and the results were explained to me clearly. The team is knowledgeable and I appreciate the transparent pricing. Highly recommended!",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            What Our Patients Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from real patients across Nigeria
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/20 transition-all hover:shadow-lg animate-pop-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <Quotes weight="fill" className="h-8 w-8 text-primary/20 mb-4" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} weight="fill" className="h-4 w-4 text-amber-400" />
                ))}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};