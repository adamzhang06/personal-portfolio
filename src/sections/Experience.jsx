import { highlight } from "@/utils/highlight";

const experiences = [
  {
    title: "Co-Founder",
    company: "Raccoon Dynamics",
    period: "Aug. 2026 – Present",
    description:
      "Co-founded Raccoon Dynamics and am building an autonomous ground robot for agricultural data collection, owning the system architecture across sensing, compute, and actuation.",
    bullets: [
      "Fusing LiDAR with computer vision so the robot can sense and navigate uneven outdoor terrain without a human operator.",
      "Bringing up the embedded compute stack across a Jetson Nano, Raspberry Pi, and Arduino, running on-board perception and inference on the Jetson and handing real-time sensor and motor I/O to the Arduino.",
      "Building the robot's software on ROS 2 in Python and C++, adopting C++ for the performance-critical real-time nodes.",
    ],
    highlights: ["LiDAR", "computer vision", "Jetson Nano", "Raspberry Pi", "Arduino", "ROS 2", "Python", "C++", "autonomous ground robot"],
    tags: ["ROS 2", "Python", "C++", "LiDAR", "Computer Vision", "Jetson Nano", "Raspberry Pi", "Arduino"],
  },
  {
    title: "Undergraduate Data Science Researcher",
    company: "The Data Mine, Purdue University",
    period: "Aug. 2026 – Present",
    description:
      "Partnered with the Nesin Math Village through The Data Mine's Corporate Partners program to replace their fully manual, paper-based library with a digital catalog and full-stack app.",
    bullets: [
      "Scoping the build around how the village actually runs day to day, planning the system in sprints on an Agile (Scrum) team.",
      "Designing a SQL database, a Python backend, and API integrations to digitize and automate a previously all-paper cataloging and lending process.",
    ],
    highlights: ["Nesin Math Village", "full-stack", "Agile (Scrum)", "SQL", "Python", "API integrations"],
    tags: ["Python", "SQL", "Agile/Scrum", "Full-Stack", "API Integration"],
  },
  {
    title: "Board Member",
    company: "CS Undergraduate Student Board",
    period: "Mar. 2026 – Present",
    description:
      "Amplifying student engagement by directing digital media strategies to increase department visibility. Advocating for the undergraduate body by collaborating with Purdue CS department heads and faculty.",
    highlights: ["digital media strategies", "department visibility", "Purdue CS department heads"],
    links: [
      {
        href: "https://www.purdueusb.com/",
        label: "Purdue CS Undergraduate Student Board",
        description: "purdueusb.com",
      },
    ],
    tags: ["Leadership", "Digital Media", "Student Advocacy", "Faculty Relations"],
  },
  {
    title: "Undergraduate Researcher in VIP",
    company: "AIDA3 Research – AI for Autonomous Aviation",
    period: "Jan. 2026 – Present",
    description:
      "Applying reinforcement learning to guidance, navigation, and control for autonomous aviation.",
    bullets: [
      "Built a custom Gymnasium environment with a discrete state and action space to model a UAV path-planning task.",
      "Implemented and compared dynamic programming, SARSA, and Q-learning agents in the environment, establishing RL baselines for guidance, navigation, and control.",
      "Formulated safe-flight requirements as Signal Temporal Logic (STL) specifications, using STL robustness to measure how far each trajectory stays inside the safe envelope, and ran evaluations across simulated flight scenarios to validate that trained agents hold to those constraints.",
      "Tested a ROS 2-based wrapper to cross-validate agent performance across multiple simulated scenarios.",
    ],
    highlights: ["reinforcement learning", "Gymnasium", "SARSA", "Q-learning", "dynamic programming", "Signal Temporal Logic (STL)", "ROS 2"],
    links: [
      {
        href: "https://github.com/sbrunswi/VIP_Intro_deep_reinforcement_learning",
        label: "VIP Intro Deep Reinforcement Learning",
        description: "github.com/sbrunswi",
      },
    ],
    tags: ["Python", "Gymnasium", "Reinforcement Learning", "SARSA", "Q-Learning", "ROS 2", "STL"],
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
      "Processed single-cell RNA-seq data from wet-lab experiments to support research into predicting breast cancer with marker-relationship signatures rather than single markers.",
    bullets: [
      "Clustered cells in R using K-means across 158 breast cancer markers.",
      "Annotated the resulting clusters into 12 cell populations using Seurat and ScType, then visualized inter-marker relationships.",
    ],
    highlights: ["single-cell RNA-seq", "158 breast cancer markers", "12 cell populations", "Seurat", "ScType", "K-means", "R"],
    tags: ["R", "Seurat", "ScType", "K-means", "scRNA-seq"],
  },
  {
    title: "Software Development Intern",
    company: "St. Louis University",
    period: "May 2023 – Aug. 2023",
    description:
      "Optimized a bioinformatics sequencing pipeline for both throughput and runtime.",
    bullets: [
      "Doubled processing throughput on a ~700 MB, 33M-read BAM sequencing dataset by parallelizing an original single-core pipeline across multiple cores on Windows and Linux.",
      "Cut TSS-clustering runtime by 36.6% in R by removing redundant sliding-window sweeps once a cluster had been identified.",
    ],
    highlights: ["bioinformatics", "Doubled processing throughput", "36.6%", "Linux", "R"],
    links: [
      {
        href: "https://docs.google.com/presentation/d/1gs9peDbaCVoPULaPnjPjkK-eCSsU5LRSpG_mCmAVlME/edit?usp=sharing",
        label: "Research Presentation",
        description: "docs.google.com",
      },
    ],
    tags: ["R", "Linux", "Multicore Processing", "Bioinformatics"],
  },
  {
    title: "Lead Programmer and Camera Vision",
    company: "FIRST Tech Challenge – Robotics",
    period: "Sept. 2022 – Apr. 2025",
    description:
      "Served as lead programmer on a 5-person team ranked 85th worldwide (of ~8,000) that won the FTC Missouri/Kansas State Championship in 2025.",
    bullets: [
      "Programmed and tuned PID-based motor control in Java to improve the reliability of autonomous routines.",
      "Trained an object-detection model on a self-collected dataset of game-element images using FTC's TensorFlow-based ML tool.",
    ],
    highlights: ["85th worldwide (of ~8,000)", "FTC Missouri/Kansas State Championship", "Java", "TensorFlow", "PID-based motor control"],
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
    tags: ["Java", "TensorFlow", "Android Studio", "PID Control", "Computer Vision"],
  },
];

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
                  className={`relative flex items-start md:items-center gap-0 pointer-events-none ${
                    idx !== 0 ? "md:-mt-32" : ""
                  }`}
                >
                  {/* Left slot */}
                  <div className="hidden md:flex w-1/2 justify-end pr-10">
                    {isLeft && (
                      <div className="card-vivid rounded-2xl p-8 w-full pointer-events-auto" style={cardStyle}>
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
                      <div className="card-vivid rounded-2xl p-8 w-full pointer-events-auto" style={cardStyle}>
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
                    <div className="card-vivid rounded-2xl p-8 flex-1 mb-6 min-w-0 pointer-events-auto" style={cardStyle}>
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
    {exp.bullets?.length > 0 && (
      <ul className="text-muted-foreground text-base leading-relaxed mb-4 space-y-2 list-disc pl-5 marker:text-primary/60">
        {exp.bullets.map((bullet) => (
          <li key={bullet}>{highlight(bullet, exp.highlights)}</li>
        ))}
      </ul>
    )}
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
