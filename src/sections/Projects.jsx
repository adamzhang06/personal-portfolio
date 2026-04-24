import { ExternalLink, Github } from "lucide-react";

// Add new projects by appending to this array
const projects = [
  {
    title: "Project Name",
    description:
      "A short description of what this project does, the problem it solves, and what makes it interesting. 2-3 sentences max.",
    tags: ["Python", "React", "FastAPI"],
    github: "https://github.com/adamzhang06",
    demo: null, // set to a URL string to show a live demo link
  },
  {
    title: "Another Project",
    description:
      "Another placeholder. Replace with real projects — class work, personal builds, hackathon entries, research tools, etc.",
    tags: ["Computer Vision", "PyTorch", "OpenCV"],
    github: "https://github.com/adamzhang06",
    demo: null,
  },
];

export const Projects = () => {
  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Projects
          </p>
          <h2 className="text-4xl font-bold">Things I've built</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="glass rounded-2xl p-6 flex flex-col gap-4 hover:glow-border transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-surface text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-surface text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
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
