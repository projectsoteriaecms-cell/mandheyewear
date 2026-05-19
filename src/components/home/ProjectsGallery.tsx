import galleryAbout from "@/assets/soteria/gallery-about.jpg";
import gallery8937 from "@/assets/soteria/gallery-tri-8937.jpg";
import gallery8907 from "@/assets/soteria/gallery-tri-8907.jpg";
import gallery1729 from "@/assets/soteria/gallery-photo-1729.jpg";

const projects = [
  { src: galleryAbout, caption: "Soteria Banner" },
  { src: gallery8937, caption: "Photochromic Lenses" },
  { src: gallery8907, caption: "Clinical Excellence" },
  { src: gallery1729, caption: "Patient Care" },
];

export const ProjectsGallery = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">Our Work</p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground mb-4">
            A Look Inside Our Clinics
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((p, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] animate-pop-in"
              style={{ animationDelay: `${0.05 + i * 0.08}s` }}
            >
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-sm font-medium">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
