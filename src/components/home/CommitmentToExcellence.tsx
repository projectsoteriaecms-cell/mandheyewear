const items = [
  {
    index: "01",
    title: "Expertise & experience",
    desc: "Years of practice — a clinical team that brings unmatched depth to every consultation.",
  },
  {
    index: "02",
    title: "Customised solutions",
    desc: "Vision plans tailored to every lifestyle, occupation and age group.",
  },
  {
    index: "03",
    title: "Modern, evidence-based care",
    desc: "Modern equipment paired with rigorous, evidence-based clinical protocols.",
  },
];

export const CommitmentToExcellence = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent mb-4">
            / Why Choose Soteria
          </p>
          <h2 className="font-display font-semibold tracking-tight text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-foreground">
            A quiet commitment <br className="hidden sm:block" />
            to exceptional care.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {items.map((item) => (
            <div
              key={item.index}
              className="bg-background p-8 lg:p-10 group transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-display text-5xl lg:text-6xl font-semibold text-accent leading-none">
                  {item.index}
                </span>
                <span className="h-px flex-1 bg-border group-hover:bg-accent/40 transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
