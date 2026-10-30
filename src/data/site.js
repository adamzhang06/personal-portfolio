// Site-wide flags and fixed copy. Facts come from docs/portfolio-audit.md §6 (as amended by docs/spec-v2.md).

// Photography entry points: the nav item, the Photos SD card (Home, tray, Site menu), the camera's
// Playback hotspot and label, and the seventh LCD page. They open the Photography page at /photos.
// The legacy gallery at /photography and /photography/portraits is left untouched and unlinked.
export const PHOTOGRAPHY_ENABLED = true;

// Record button → Demo videos dialog. Off by default; the videos stay reachable from case-study Links.
export const DEMO_VIDEOS = false;

export const NAME = "Adam Zhang";
export const DOMAIN = "adamzhang.org";
export const AVAILABILITY = "Available for work";

export const HEADLINE_LINES = ["Building my future", "line-by-line at", "Purdue University"];

export const INTRO =
  "Hi, I’m Adam Zhang, an Artificial Intelligence major at Purdue passionate about software engineering, robotics, and machine learning. I love implementing real solutions to solve real problems.";

export const EDUCATION = {
  school: "Purdue University",
  degree: "B.S. Artificial Intelligence",
  college: "John Martinson Honors College",
  abroad: "Studied abroad in Japan, Summer 2026.",
  coursework: ["Object-Oriented Programming", "Discrete Mathematics", "Linear Algebra", "Multivariate Calculus"],
};

export const AWARD = "Outstanding First-Year Student Award in VIP (AIDA3 Research).";

export const INTERESTS =
  "All types of photography, videography, pickup basketball, ping-pong, volunteering, and robotics.";

export const QUICK_FACTS = [
  { label: "School", value: EDUCATION.school },
  { label: "Degree", value: `${EDUCATION.degree}` },
  // { label: "Based in", value: "West Lafayette, IN" },
  { label: "Status", value: AVAILABILITY, status: true },
  { label: "Email", value: "reachadamzhang@gmail.com" },
  { label: "Photos", value: "@ayz.nef" },
];

export const DEMO_VIDEO_LINKS = [
  { label: "AXI6 Cinema Robotics", href: "https://vimeo.com/1184530933" },
  { label: "BarBabes", href: "https://www.youtube.com/watch?v=GhaOiUV3mbk" },
];
