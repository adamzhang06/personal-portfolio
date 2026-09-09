import { useState } from "react";
import { Github, ChevronLeft, ChevronRight } from "lucide-react";
import { highlight } from "@/utils/highlight";

const projects = [
  {
    title: "StyleSnapped",
    period: "Apr. 2026",
    description:
      "Presented at the ML@Purdue Symposium: a full-stack web app (React, FastAPI, PyTorch) that classifies outfit photos into clothing aesthetics with a fine-tuned ResNet-50, giving users its top three predictions based on confidence.",
    bullets: [
      "Cut labeling to just 300 VLM API calls (from one per image) by embedding a 44K-image dataset with ResNet-50, clustering with K-Means (k=100), and propagating majority-vote Gemini labels from 3 centroids per cluster into a 41K-image training set.",
      "Trained the ResNet-50 classifier to 83% validation accuracy despite a 14x class imbalance, applying inverse-frequency class weighting and progressive unfreezing in PyTorch.",
    ],
    highlights: ["ML@Purdue Symposium", "ResNet-50", "83% validation accuracy", "PyTorch", "FastAPI", "React", "K-Means", "Gemini"],
    tags: ["PyTorch", "Python", "FastAPI", "React", "Scikit-Learn", "Gemini API"],
    logo: "/projects/stylesnapped/logo.svg",
    github: "https://github.com/adamzhang06/style-snapped",
    media: [
      { src: "/projects/stylesnapped/webpage.png", caption: "" },
      { src: "/projects/stylesnapped/match.png", caption: "" },
      { src: "/projects/stylesnapped/board.png", caption: "" },
    ],
  },
  {
    title: "AXI6 Cinema Robotics",
    period: "Feb. 2026 – Apr. 2026",
    description:
      "Control software for a motorized 2-axis camera slider, built with a 2-person team: a React/FastAPI app with timeline-based keyframing for custom slide-and-pan moves, costing only ~$200 in parts versus $800+ commercial rigs.",
    bullets: [
      "Ran a YOLOv8 + OpenCV tracking pipeline on a laptop and streamed target trajectories to the Raspberry Pi over WebSockets, which put heavy compute on the laptop instead of the weak Raspberry Pi.",
      "Wrote a Python axis-synchronization algorithm that computes counter-rotations on the pan axis to cancel parasitic motion from the mechanically-coupled axes, keeping the subject framed while the camera slides.",
    ],
    highlights: ["~$200 in parts versus $800+", "YOLOv8", "OpenCV", "Raspberry Pi", "WebSockets", "React", "FastAPI", "Python", "axis-synchronization algorithm"],
    tags: ["Python", "JavaScript", "React", "FastAPI", "WebSockets", "OpenCV", "YOLO", "Raspberry Pi"],
    github: "https://github.com/adamzhang06/AXI6-cinema-robotics",
    links: [
      { label: "Devpost", href: "https://devpost.com/software/axi6-cinema-robotics-camera-slider" },
    ],
    media: [
      { src: "/projects/axi6/COVER.jpeg", caption: "" },
      { src: "/projects/axi6/website.jpeg", caption: "" },
      { src: "/projects/axi6/cad.jpeg", caption: "" },
      { src: "/projects/axi6/pi.jpeg", caption: "" },
      { src: "https://vimeo.com/1184530933", caption: "Demo video" },
    ],
    logo: "/projects/axi6/logo.png",
    logoOnly: true,
  },
  {
    title: "BarBabes",
    period: "Feb. 2026",
    description:
      "Won 1st Place Overall (of 33 teams) and Best Use of AI at InnovateHER Hacks 2026 — a mobile app that helps friends gauge each other's level of intoxication.",
    bullets: [
      "Ideated the product and built the React Native frontend, including the drink-logging interface and a tap-based reaction-time mini-game that averages multiple trials.",
      "Wired the frontend to a Gemini-powered FastAPI backend that estimated intoxication from a demographics-based BAC formula and NFC-logged drink history.",
    ],
    highlights: ["1st Place Overall", "Best Use of AI", "React Native", "FastAPI", "Gemini", "NFC-logged drink history"],
    tags: ["Python", "JavaScript", "React Native", "FastAPI", "MongoDB", "Gemini API"],
    logo: "/projects/barbabes/BARBABES-LOGO-2.png",
    github: "https://github.com/Azeemme/BarBabes",
    links: [
      { label: "Devpost", href: "https://devpost.com/software/barbabes" },
    ],
    media: [
      { src: "/projects/barbabes/gallery.jpg", caption: "" },
      { src: "/projects/barbabes/win.jpeg", caption: "1st Overall at InnovateHER Hacks 2026" },
      { src: "/projects/barbabes/inaction.jpeg", caption: "In action" },
      { src: "/projects/barbabes/gallery (1).jpg", caption: "" },
      { src: "https://www.youtube.com/watch?v=GhaOiUV3mbk", caption: "Demo video" },
    ],
  },
];

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
          className="w-full aspect-video object-contain animate-carousel-fade"
          controls
          playsInline
        />
      ) : (
        <img
          key={idx}
          src={item.src}
          alt={item.caption ?? ""}
          className="w-full aspect-video object-contain animate-carousel-fade"
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
                  <div className="flex flex-col gap-3">
                    <img src={project.logo} alt={project.title} className="h-10 object-contain mix-blend-multiply" />
                    <span className="text-2xl font-semibold text-foreground">{project.title}</span>
                  </div>
                ) : (
                  <h3 className="text-2xl font-semibold">{project.title}</h3>
                )}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
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
                  {project.period && (
                    <span className="text-sm text-muted-foreground glass rounded-full px-3 py-1 whitespace-nowrap">
                      {project.period}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground text-base leading-relaxed">
                {highlight(project.description, project.highlights)}
              </p>

              {project.bullets?.length > 0 && (
                <ul className="text-muted-foreground text-base leading-relaxed space-y-2 list-disc pl-5 marker:text-primary/60">
                  {project.bullets.map((bullet) => (
                    <li key={bullet}>{highlight(bullet, project.highlights)}</li>
                  ))}
                </ul>
              )}

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
