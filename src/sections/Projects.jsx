import { useState } from "react";
import { Github, ChevronLeft, ChevronRight } from "lucide-react";

const projects = [
  {
    title: "BarBabes",
    description:
      "1st Overall and Best Use of AI at InnovateHER Hacks 2026 (33 teams). A cross-platform mobile app using React Native with a FastAPI backend and MongoDB for real-time data and frictionless NFC tap-to-log events. Integrated Google Gemini API to analyze Widmark BAC results, reaction latency, and drinking history for holistic impairment assessments.",
    highlights: ["1st Overall", "Best Use of AI", "NFC tap-to-log", "Google Gemini API"],
    tags: ["Python", "JavaScript", "React Native", "FastAPI", "MongoDB", "Gemini API"],
    logo: "/projects/barbabes/BARBABES-LOGO-2.png",
    github: "https://github.com/Azeemme/BarBabes",
    links: [
      { label: "Devpost", href: "https://devpost.com/software/barbabes" },
    ],
    media: [
      { src: "https://www.youtube.com/watch?v=GhaOiUV3mbk", caption: "Demo video" },
      { src: "/projects/barbabes/win.jpeg", caption: "1st Overall at InnovateHER Hacks 2026" },
      { src: "/projects/barbabes/original.png", caption: "App overview" },
      { src: "/projects/barbabes/inaction.jpeg", caption: "In action" },
      { src: "/projects/barbabes/gallery.jpg", caption: "" },
      { src: "/projects/barbabes/gallery (1).jpg", caption: "" },
      { src: "/projects/barbabes/gallery (2).jpg", caption: "" },
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
    media: [
      { src: "https://vimeo.com/1184530933", caption: "Demo video" },
    ],
    logo: "/projects/axi6/logo.png",
    logoOnly: true,
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

const getYouTubeId = (url) => {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  return match?.[1] ?? null;
};

const getVimeoId = (url) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
};

const MediaCarousel = ({ media }) => {
  const [idx, setIdx] = useState(0);
  if (!media?.length) return null;

  const prev = () => setIdx((i) => (i - 1 + media.length) % media.length);
  const next = () => setIdx((i) => (i + 1) % media.length);
  const item = media[idx];
  const youtubeId = getYouTubeId(item.src);
  const vimeoId = getVimeoId(item.src);

  return (
    <div className="relative rounded-xl overflow-hidden glass">
      {youtubeId ? (
        <iframe
          key={idx}
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="w-full aspect-video animate-carousel-fade"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={item.caption ?? "Video"}
        />
      ) : vimeoId ? (
        <iframe
          key={idx}
          src={`https://player.vimeo.com/video/${vimeoId}`}
          className="w-full aspect-video animate-carousel-fade"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={item.caption ?? "Video"}
        />
      ) : item.src.match(/\.(mp4|webm|mov)$/i) ? (
        <video
          key={idx}
          src={item.src}
          className="w-full aspect-video object-cover animate-carousel-fade"
          controls
          playsInline
        />
      ) : (
        <img
          key={idx}
          src={item.src}
          alt={item.caption ?? ""}
          className="w-full aspect-video object-cover animate-carousel-fade"
        />
      )}

      {media.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full glass hover:bg-primary/20 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full glass hover:bg-primary/20 hover:text-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === idx ? "bg-primary" : "bg-foreground/30"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {item.caption && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/50 to-transparent">
          <p className="text-xs text-white/80">{item.caption}</p>
        </div>
      )}
    </div>
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
                {project.logo && !project.logoOnly ? (
                  <div className="flex items-center gap-3">
                    <img src={project.logo} alt={project.title} className="h-20 object-contain rounded-lg mix-blend-multiply" />
                    <h3 className="text-2xl font-semibold">{project.title}</h3>
                  </div>
                ) : project.logo ? (
                  <img src={project.logo} alt={project.title} className="h-10 object-contain mix-blend-multiply" />
                ) : (
                  <h3 className="text-2xl font-semibold">{project.title}</h3>
                )}
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

              <p className="text-muted-foreground text-base leading-relaxed">
                {highlight(project.description, project.highlights)}
              </p>

              <MediaCarousel media={project.media} />

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
