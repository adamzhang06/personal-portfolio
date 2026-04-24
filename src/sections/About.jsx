const stats = [
  { value: "'28", label: "Graduating" },
  { value: "AI", label: "Major" },
  { value: "3+", label: "Years coding" },
];

export const About = () => {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                About Me
              </p>
              <h2 className="text-4xl font-bold leading-tight">
                Building at the intersection of{" "}
                <span className="font-serif italic font-normal text-primary">
                  AI & the physical world
                </span>
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              I'm Adam Zhang, an Artificial Intelligence student at Purdue
              University with a passion for robotics and computer vision. I
              believe the most exciting frontier in AI is where software meets
              hardware — giving machines the ability to perceive and act in the
              real world.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Outside of code, I'm a photographer who loves capturing moments —
              from landscapes to everyday life. That visual intuition shapes how
              I think about computer vision problems too.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
