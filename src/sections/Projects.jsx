import { Github } from "lucide-react";

const projects = [
  {
    title: "BarBabes",
    description:
      "1st Overall and Best Use of AI at InnovateHER Hacks 2026 (33 teams). A cross-platform mobile app using React Native with a FastAPI backend and MongoDB for real-time data and frictionless NFC tap-to-log events. Integrated Google Gemini API to analyze Widmark BAC results, reaction latency, and drinking history for holistic impairment assessments.",
    highlights: ["1st Overall", "Best Use of AI", "NFC tap-to-log", "Google Gemini API"],
    tags: ["Python", "JavaScript", "React Native", "FastAPI", "MongoDB", "Gemini API"],
    github: "https://github.com/Azeemme/BarBabes",
    links: [
      { label: "Devpost", href: "https://devpost.com/software/barbabes" },
    ],
  },
  {
    title: "AXI6 Cinema Robotics",
    description:
      "A fully automated robotic camera slider system for cinematic motion control. Built custom firmware and control software to drive precise stepper motor movements, enabling programmable camera paths for film and photography applications.",
    highlights: ["robotic camera slider", "stepper motor", "programmable camera paths"],
    tags: ["Robotics", "Firmware", "Motor Control", "C++"],
    github: "https://github.com/adamzhang06/AXI6-cinema-robotics",
    links: [
      { label: "Devpost", href: "https://devpost.com/software/axi6-cinema-robotics-camera-slider" },
    ],
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

export const Projects = () => {
  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Projects
          </p>
          <h2 className="text-4xl font-bold">Things I've built</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="card-vivid rounded-2xl p-8 flex flex-col gap-5"
              style={{ "--card-angle": ["168deg", "55deg"][idx % 2] }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-semibold">{project.title}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {project.links?.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-full text-xs font-medium hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border hover:border-primary/40 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed flex-1">
                {highlight(project.description, project.highlights)}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
