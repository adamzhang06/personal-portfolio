// Projects, newest first. Every project can carry links and media; empty arrays render nothing.
// media: { type: 'image', src, alt, caption } | { type: 'video', src, poster, caption } | { type: 'embed', provider: 'youtube' | 'vimeo', id, caption }

export const projects = [
  {
    slug: "dor",
    name: "dor",
    period: "Oct. 2026",
    result: "2nd place of 183 · Cal Hacks 13.0",
    big: "2nd of 183",
    bigSub: "Cal Hacks 13.0 · Meta’s Bringing People Closer Together with AI track",
    summary: "An app that helps people keep in touch with old friends and meet new ones.",
    lede: "An app that helps people keep in touch with old friends and meet new ones. Won 2nd place of 183 submissions in Meta’s Bringing People Closer Together with AI track at Cal Hacks 13.0.",
    bullets: [
      "Owned the AI and voice features on a 4-person team, directing multiple Claude Code agents via specs and code review.",
      "Designed a sandboxed AI agent that decides when to nudge users to reach out, keeping personal data out of every model call.",
      "Cut the agent’s AI costs by 97% by leading an optimization that moved its decisions from Opus to Haiku.",
    ],
    tech: ["TypeScript", "Next.js", "Claude API", "Cartesia", "Factory Droid", "SpacetimeDB", "Apify"],
    links: [],
    media: [],
  },
  {
    slug: "stylesnapped",
    name: "StyleSnapped",
    period: "Apr. 2026",
    result: "Presented at the ML@Purdue Symposium",
    big: "83%",
    bigSub: "validation accuracy despite a 14x class imbalance · presented at the ML@Purdue Symposium",
    summary: "Classifies outfit photos into clothing aesthetics with a fine-tuned ResNet-50.",
    lede: "A full-stack web app (React, FastAPI, PyTorch) that classifies outfit photos into clothing aesthetics with a fine-tuned ResNet-50, giving users its top three predictions based on confidence.",
    bullets: [
      "Cut labeling to just 300 VLM API calls (from one per image) by embedding a 44K-image dataset with ResNet-50, clustering with K-Means (k=100), and propagating majority-vote Gemini labels from 3 centroids per cluster into a 41K-image training set.",
      "Trained the ResNet-50 classifier to 83% validation accuracy despite a 14x class imbalance, applying inverse-frequency class weighting and progressive unfreezing in PyTorch.",
    ],
    tech: ["PyTorch", "Python", "FastAPI", "React", "Scikit-Learn", "Gemini API"],
    links: [{ label: "GitHub", href: "https://github.com/adamzhang06/style-snapped" }],
    media: [
      { type: "image", src: "/projects/stylesnapped/webpage.png", alt: "StyleSnapped home screen with the outfit upload panel and community board", caption: "Web app" },
      { type: "image", src: "/projects/stylesnapped/match.png", alt: "Top match result showing Business Formal with outfit and decor suggestions", caption: "Top match" },
      { type: "image", src: "/projects/stylesnapped/board.png", alt: "Saved Pinterest-style board with a Business Formal look", caption: "Board" },
    ],
  },
  {
    slug: "axi6",
    name: "AXI6 Cinema Robotics",
    period: "Feb. – Apr. 2026",
    result: "~$200 in parts vs $800+ commercial rigs",
    big: "~$200",
    bigSub: "in parts, versus $800+ for commercial 2-axis rigs",
    summary: "Control software for a motorized 2-axis camera slider with timeline keyframing.",
    lede: "Control software for a motorized 2-axis camera slider, built with a 2-person team: a React/FastAPI app with timeline-based keyframing for custom slide-and-pan moves.",
    bullets: [
      "Ran a YOLOv8 + OpenCV tracking pipeline on a laptop and streamed target trajectories to the Raspberry Pi over WebSockets, which put heavy compute on the laptop instead of the weak Raspberry Pi.",
      "Wrote a Python axis-synchronization algorithm that computes counter-rotations on the pan axis to cancel parasitic motion from the mechanically-coupled axes, keeping the subject framed while the camera slides.",
      "Currently building a similar camera slider for a client, for standardized and automated documentation.",
    ],
    tech: ["Python", "JavaScript", "React", "FastAPI", "WebSockets", "OpenCV", "YOLO", "Raspberry Pi"],
    links: [
      { label: "GitHub", href: "https://github.com/adamzhang06/AXI6-cinema-robotics" },
      { label: "Devpost", href: "https://devpost.com/software/axi6-cinema-robotics-camera-slider" },
      { label: "Demo video", href: "https://vimeo.com/1184530933" },
    ],
    media: [
      { type: "image", src: "/projects/axi6/COVER.jpeg", alt: "The AXI6 two-axis camera slider with an orange carriage at the hackathon", caption: "" },
      { type: "image", src: "/projects/axi6/website.jpeg", alt: "Slider control app with live camera view and keyframe timeline", caption: "Control app" },
      { type: "image", src: "/projects/axi6/cad.jpeg", alt: "Designing the slider carriage in CAD on a laptop", caption: "CAD" },
      { type: "image", src: "/projects/axi6/pi.jpeg", alt: "Raspberry Pi and motor wiring for the slider", caption: "Raspberry Pi" },
    ],
  },
  {
    slug: "barbabes",
    name: "BarBabes",
    period: "Feb. 2026",
    result: "1st place of 33 · Best Use of AI · InnovateHER Hacks 2026",
    big: "1st of 33",
    bigSub: "Best Use of AI · InnovateHER Hacks 2026",
    summary: "A mobile app that helps friends gauge each other’s level of intoxication.",
    lede: "A mobile app that helps friends gauge each other’s level of intoxication. Won 1st Place Overall (of 33 teams) and Best Use of AI at InnovateHER Hacks 2026.",
    bullets: [
      "Ideated the product and built the React Native frontend, including the drink-logging interface, a tap-based reaction-time mini-game that averages multiple trials, and other safety features.",
      "Wired the frontend to a Gemini-powered FastAPI backend that estimated intoxication from a demographics-based BAC formula and NFC-logged drink history.",
    ],
    tech: ["Python", "JavaScript", "React Native", "FastAPI", "MongoDB", "Gemini API"],
    links: [
      { label: "GitHub", href: "https://github.com/Azeemme/BarBabes" },
      { label: "Devpost", href: "https://devpost.com/software/barbabes" },
      { label: "Demo video", href: "https://www.youtube.com/watch?v=GhaOiUV3mbk" },
    ],
    media: [
      { type: "image", src: "/projects/barbabes/win.jpeg", alt: "The BarBabes team holding 1st place certificates at InnovateHER Hacks 2026", caption: "1st Overall at InnovateHER Hacks 2026" },
      { type: "image", src: "/projects/barbabes/inaction.jpeg", alt: "Tapping a phone to log a drink with NFC at the demo table", caption: "In action" },
      { type: "image", src: "/projects/barbabes/gallery.jpg", alt: "Three BarBabes app screens: contacts, blood alcohol estimate and group view", caption: "" },
      { type: "image", src: "/projects/barbabes/gallery (1).jpg", alt: "BarBabes BAC meter, status key and notification designs", caption: "" },
    ],
  },
];

export const projectBySlug = (slug) => projects.find((p) => p.slug === slug);

// The project's first picture (an image, or a video's poster), for its card on Projects.
export function coverOf(project) {
  const m = project.media.find((x) => x.type === "image" || (x.type === "video" && x.poster));
  return m ? { src: m.type === "image" ? m.src : m.poster, alt: m.alt ?? "" } : null;
}
