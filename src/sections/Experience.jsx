// Add new experiences by appending to this array
const experiences = [
  {
    title: "Your Role Title",
    company: "Company / Organization",
    period: "Jan 2025 – Present",
    description:
      "Brief description of what you did, what you built, and what impact it had. Keep it to 2-3 sentences.",
    tags: ["Python", "React", "FastAPI"],
  },
  {
    title: "Another Role",
    company: "Another Place",
    period: "May 2024 – Aug 2024",
    description:
      "Another example entry. Replace these with your real experiences — internships, research, clubs, etc.",
    tags: ["ML", "Computer Vision", "PyTorch"],
  },
];

export const Experience = () => {
  return (
    <section id="experience" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Experience
          </p>
          <h2 className="text-4xl font-bold">Where I've worked</h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-8">
            {experiences.map((exp, idx) => (
              <div key={idx} className="md:pl-12 relative">
                {/* Dot on timeline */}
                <div className="absolute left-2.5 top-6 w-3 h-3 rounded-full bg-primary border-2 border-background hidden md:block" />

                <div className="glass rounded-2xl p-6 hover:glow-border transition-all duration-300">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      <p className="text-primary text-sm">{exp.company}</p>
                    </div>
                    <span className="text-xs text-muted-foreground glass rounded-full px-3 py-1">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
