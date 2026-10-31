// Site-wide flags and fixed copy. Facts come from docs/portfolio-audit.md §6 (as amended by docs/spec-v2.md).

// Photography entry points: the nav item, the Photos SD card (Home, tray, Site menu), the camera's
// Playback hotspot and label, and the seventh LCD page. They open the Photography page at /photos.
// The old gallery's addresses (/photography, /photography/portraits) redirect here.
export const PHOTOGRAPHY_ENABLED = true;

// Record button → Demo videos dialog. Off by default; the videos stay reachable from case-study Links.
export const DEMO_VIDEOS = false;

export const NAME = "Adam Zhang";
export const DOMAIN = "adamzhang.org";
export const AVAILABILITY = "Available for work";

export const HEADLINE_LINES = ["Building my future", "line-by-line at", "Purdue University"];

export const INTRO =
  "Hi, I’m ==Adam Zhang==, an Artificial Intelligence major at Purdue who builds across **software engineering, robotics, and machine learning**. I’m driven by turning **real problems into working solutions**.";

// About-page blurb (the Home hero keeps the shorter INTRO).
export const ABOUT_BLURB = [
  "I’m Adam Zhang, an Artificial Intelligence major at Purdue. I like building **things you can actually put your hands on**, whether that’s a React app, a camera slider I built from scratch, or a robot that has to find its way across uneven outdoor terrain. It started with FTC robotics in high school, where I programmed our autonomous routines and we ended up **2025 Missouri/Kansas State Champions**.",
  "Right now I’m **co-founding Raccoon Dynamics**, where we’re building an autonomous ground robot for agricultural data collection and I own the **system architecture** from sensors to motors. I’m also doing research with **The Data Mine**, helping the Nesin Math Village swap a paper-based library for a real digital catalog. On weekends, hackathons are where I test ideas fast: **2nd of 183 at Cal Hacks** and **1st of 33 at InnovateHER Hacks**.",
  "I care just as much about **the people side**. I **lead a team of 8** on safe reinforcement learning research in VIP, serve on the **Purdue CS Undergraduate Student Board**, and **TA CS 19300**. In high school I helped run Serves Day, which got **92% of our school volunteering** across 50+ community sites and earned **a resolution from the Missouri House**. I’ve always liked pulling younger students up with me, like bringing our FLL kids onto the FTC team, and I want to keep doing that wherever I end up.",
];

export const EDUCATION = {
  school: "Purdue University",
  degree: "B.S. Artificial Intelligence",
  college: "John Martinson Honors College",
  abroad: "Studied abroad in Japan, Summer 2026.",
  coursework: ["Object-Oriented Programming", "Discrete Mathematics", "Linear Algebra", "Multivariate Calculus"],
};

// Featured three first, then newest first. `detail` is the context line under the title.
export const AWARDS = [
  { title: "2nd Place of 183", detail: "Meta’s Bringing People Closer Together with AI track, Cal Hacks 13.0", date: "Oct. 2025" },
  { title: "Outstanding First-Year Student", detail: "VIP, AIDA3 Research", date: "May 2026" },
  { title: "1st Place Overall of 33 + Best Use of AI", detail: "InnovateHER Hacks 2026", date: "Feb. 2026" },
  { title: "Outstanding Student in Mathematics", detail: "1 of 400 students", date: "May 2025" },
  { title: "Outstanding Orchestra Student", detail: "Parkway South High School", date: "May 2025" },
  { title: "Missouri House Resolution No. 6832", detail: "Missouri House of Representatives, for Serves Day", date: "June 2024" },
  { title: "Bausch + Lomb Honorary Science Award", detail: "", date: "May 2024" },
];

// Polaroid beside the About heading. Placeholder until the real photo arrives: swap src/alt/caption.
export const ABOUT_PHOTOS = [
  { src: "/assets/portrait.jpg", alt: "Adam Zhang smiling outdoors in a black Purdue quarter-zip", caption: "" },
];

export const INTERESTS = ["Photography", "Videography", "Pickup basketball", "Ping-pong", "Volunteering", "Robotics"];

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
