const experiences = [
  {
    title: "Undergrad Researcher",
    company: "AIDA3 Research – AI for Autonomous Aviation",
    period: "Jan. 2026 – Present",
    description:
      "Applying deep reinforcement learning to GNC and path planning for autonomous robotic systems. Creating custom Gym environments to simulate fixed-wing flight for a DRL agent and developing a ROS2 wrapper for cross-validation.",
    highlights: ["deep reinforcement learning", "autonomous robotic systems", "ROS2"],
    links: [
      {
        href: "https://github.com/sbrunswi/VIP_Intro_deep_reinforcement_learning",
        label: "VIP Intro Deep Reinforcement Learning",
        description: "github.com/sbrunswi",
      },
    ],
    tags: ["Python", "Deep RL", "Gym", "ROS2", "GNC"],
  },
  {
    title: "Business Subteam Member",
    company: "Purdue Formula SAE",
    period: "Sept. 2025 – Present",
    description:
      "Active member of the testing roster, attending weekly test sessions to collect data and document progress. Coordinating sponsorship outreach, alumni engagement, and team events to support operations and funding.",
    highlights: ["testing roster", "sponsorship outreach"],
    links: [
      {
        href: "https://engineering.purdue.edu/fsae/wordpress/",
        label: "Purdue Formula SAE",
        description: "engineering.purdue.edu/fsae",
      },
    ],
    tags: ["Data Collection", "Sponsorship", "Operations"],
  },
  {
    title: "Research Technician I",
    company: "Washington University in St. Louis",
    period: "May 2024 – Aug. 2024",
    description:
      "Analyzed real gene expression data from cancer tissues using single-cell and spatial transcriptomics AI tools. Managed large datasets in R and Python, applied K-means clustering to identify cancer marker correlations, and created data visualizations using Seurat and Sc-type.",
    highlights: ["single-cell and spatial transcriptomics", "K-means clustering", "cancer marker correlations"],
    tags: ["Python", "R", "Machine Learning", "Seurat", "sc-type", "K-means"],
  },
  {
    title: "Software Development Intern",
    company: "St. Louis University",
    period: "May 2023 – Aug. 2023",
    description:
      "Used R to reduce processing time for TSS analysis of RNA sequencing data by 36.6%. Doubled the read speed of BAM files using multicore processing for both Windows and Linux environments.",
    highlights: ["36.6%", "Doubled"],
    links: [
      {
        href: "https://docs.google.com/presentation/d/1gs9peDbaCVoPULaPnjPjkK-eCSsU5LRSpG_mCmAVlME/edit?usp=sharing",
        label: "Research Presentation",
        description: "docs.google.com",
      },
    ],
    tags: ["R", "Rsamtools", "Bioinformatics", "Multicore Processing"],
  },
  {
    title: "Lead Programmer & AI Camera Vision",
    company: "FIRST Tech Challenge – Robotics",
    period: "Sept. 2022 – Apr. 2025",
    description:
      "2025 MO State Champions; placed 85th out of ~8,000 teams globally at the 2025 FTC World Championship. Built PID motor control and camera vision pipelines in Java, and trained vision models using ML algorithms with new AI cameras.",
    highlights: ["2025 MO State Champions", "85th out of ~8,000 teams"],
    links: [
      {
        href: "https://ftcscout.org/teams/16498?season=2024",
        label: "Team 16498 – FTC Scout",
        description: "ftcscout.org",
      },
      {
        href: "https://www.ftcstats.org/2025/wall.html",
        label: "FTC Stats – 2025 Wall",
        description: "ftcstats.org",
      },
    ],
    tags: ["Java", "Android Studio", "PID Control", "Computer Vision", "ML"],
  },
];

const highlight = (text, phrases) => {
  if (!phrases?.length) return text;
  const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return text.split(regex).map((part, i) =>
    phrases.some((p) => p.toLowerCase() === part.toLowerCase()) ? (
      <strong key={i} className="text-foreground font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  );
};

export const Experience = () => {
  return (
    <section id="experience" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Experience
          </p>
          <h2 className="text-4xl font-bold">What I've worked on</h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Center line */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border" />

          <div className="flex flex-col">
            {experiences.map((exp, idx) => {
              const isLeft = idx % 2 === 0;
              const angle = `${[112, 158, 45, 200, 78][idx % 5]}deg`;
              const cardStyle = { "--card-angle": angle };
              return (
                <div
                  key={idx}
                  className={`relative flex items-start md:items-center gap-0 ${
                    idx !== 0 ? "md:-mt-32" : ""
                  }`}
                >
                  {/* Left slot */}
                  <div className="hidden md:flex w-1/2 justify-end pr-10">
                    {isLeft && (
                      <div className="card-vivid rounded-2xl p-8 w-full" style={cardStyle}>
                        <CardContent exp={exp} />
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex shrink-0 w-5 items-center justify-center relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  </div>

                  {/* Right slot */}
                  <div className="hidden md:flex w-1/2 pl-10">
                    {!isLeft && (
                      <div className="card-vivid rounded-2xl p-8 w-full" style={cardStyle}>
                        <CardContent exp={exp} />
                      </div>
                    )}
                  </div>

                  {/* Mobile: single column */}
                  <div className="md:hidden flex gap-4 w-full">
                    <div className="flex flex-col items-center pt-2">
                      <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shrink-0" />
                      <div className="w-px flex-1 bg-border mt-1" />
                    </div>
                    <div className="card-vivid rounded-2xl p-8 flex-1 mb-6" style={cardStyle}>
                      <CardContent exp={exp} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const CardContent = ({ exp }) => (
  <>
    <span className="text-sm text-muted-foreground glass rounded-full px-3 py-1 mb-4 inline-block">
      {exp.period}
    </span>
    <h3 className="text-2xl font-semibold leading-snug mb-1">{exp.title}</h3>
    <p className="text-primary text-base font-medium mb-4">{exp.company}</p>
    <p className="text-muted-foreground text-base leading-relaxed mb-4">
      {highlight(exp.description, exp.highlights)}
    </p>
    {exp.links && exp.links.length > 0 && (
      <div className="flex flex-col gap-2 mb-4">
        {exp.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 glass rounded-xl px-4 py-3 hover:glow-border transition-all duration-300 group"
          >
            {link.image && (
              <img
                src={link.image}
                alt={link.label}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                {link.label}
              </p>
              {link.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {link.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    )}
    <div className="flex flex-wrap gap-2">
      {exp.tags.map((tag) => (
        <span
          key={tag}
          className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
        >
          {tag}
        </span>
      ))}
    </div>
  </>
);
