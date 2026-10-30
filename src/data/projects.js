// Projects, newest first. Every project can carry links and media; empty arrays render nothing.
// summary: the one-line headline, on the project's card and under its case-study title.
// lede: "What it is"; a blank line ("\n\n") starts a new paragraph.
// demo: { provider: 'youtube' | 'vimeo', id } — the demo video, embedded in the sidebar above Links (omit for none)
// media: { type: 'image', src, alt, caption, aspect?, cover? } | { type: 'video', src, poster, caption } | { type: 'embed', provider: 'youtube' | 'vimeo', id, caption }
// aspect (e.g. "3/4") keeps a photo's own shape in the gallery instead of the default 16:10 crop;
// cover: true (or a CSS object-position, e.g. "50% 8%", to frame the crop) picks the card picture,
// which is otherwise the first image.
// Unused dor screenshots (door-open, pinboard, settings, calendar) are in public/projects/dor/ as app-*.jpg.

export const projects = [
  {
    slug: "dor",
    name: "dor",
    period: "Oct. 2026",
    result: "2nd place of 183 · Cal Hacks 13.0",
    big: "2nd of 183",
    bigSub: "Cal Hacks 13.0 · Meta’s Bringing People Closer Together with AI track",
    summary: "Connection assistant for life’s transitions: find your way back to old friends, and your way in somewhere new.",
    lede: "A web app for the moments that pull people apart, like moving to a new city or starting college. You step through a door into an illustrated room: a **voice notebook** to think out loud in (Cartesia transcribes you, Claude asks one follow-up and reads it back), a book for each of your people, a window of **real events and places nearby** pulled in with Apify, and a pinboard where you decide what newcomers around you can see.\n\nBehind the room, an agent reads the context you choose to share and decides whether to **nudge you to reach out**, ask first, wait, or stay quiet. **It never messages anyone for you**: the AI creates the moment, and people make the connection. Won **2nd place of 183** submissions in Meta’s Bringing People Closer Together with AI track at Cal Hacks 13.0.",
    bullets: [
      "Owned the **AI and voice features** on a 4-person team, directing **multiple Claude Code agents** via specs and code review.",
      "Designed a **sandboxed AI agent** that decides when to nudge users to reach out, keeping **personal data out of every model call**.",
      "**Cut the agent’s AI costs by 97%** by leading an optimization that moved its decisions from Opus to Haiku.",
    ],
    tech: ["TypeScript", "Next.js", "Claude API", "Cartesia", "Factory Droid", "SpacetimeDB", "Apify"],
    demo: { provider: "youtube", id: "LXBGN2EFTMo" },
    links: [
      { label: "GitHub", href: "https://github.com/rishibagri/dor-calhacks" },
      { label: "Devpost", href: "https://devpost.com/software/dor" },
    ],
    media: [
      { type: "image", src: "/projects/dor/app-door.jpg", alt: "dor’s opening screen: an illustrated wooden door with a name plate and a prompt to tap the lock", caption: "The door", aspect: "900/1819", cover: "50% 8%" },
      { type: "image", src: "/projects/dor/app-room.jpg", alt: "The illustrated room with a bookshelf, window, pinboard, desk and moving boxes, each marked with a colored dot", caption: "The room", aspect: "900/1819" },
      { type: "image", src: "/projects/dor/app-window.jpg", alt: "Flyers for nearby coffee shops pinned over the window, with ratings and neighborhoods", caption: "The window: places nearby", aspect: "900/1819" },
      { type: "image", src: "/projects/dor/app-tray.jpg", alt: "A note in the tray suggesting a short call with a connection, with I reached out and Not now buttons", caption: "A nudge to reach out", aspect: "900/1819" },
      { type: "image", src: "/projects/dor/golden-gate.jpg", alt: "Rishi and Adam wearing Cal Hacks lanyards in front of the Golden Gate Bridge at night", caption: "Rishi and I", aspect: "3/4" },
      { type: "image", src: "/projects/dor/booth.jpg", alt: "The team taking a selfie with Meta beanies in front of the SpaceX booth at Cal Hacks 13.0", caption: "The team at Cal Hacks 13.0", aspect: "3/4" },
      { type: "image", src: "/projects/dor/beanies.jpg", alt: "Four black Meta beanies held together in a bundle", caption: "Meta beanies", aspect: "3/4" },
      { type: "image", src: "/projects/dor/thinking-cap.jpg", alt: "A navy cap embroidered with “thinking” held up in front of the lit Golden Gate Bridge", caption: "Claude thinking cap", aspect: "3/4" },
    ],
  },
  {
    slug: "stylesnapped",
    name: "StyleSnapped",
    period: "Apr. 2026",
    result: "Presented at the ML@Purdue Symposium",
    big: "83%",
    bigSub: "validation accuracy despite a 14x class imbalance · presented at the ML@Purdue Symposium",
    summary: "Snap an outfit, get its aesthetic: a fine-tuned ResNet-50 trained on 41K labeled looks.",
    lede: "A full-stack web app (React, FastAPI, PyTorch) that reads an outfit photo and names its aesthetic, like Streetwear, Athleisure or Business Formal. Upload a look and a **fine-tuned ResNet-50** returns its **top three guesses** with a confidence for each, plus outfit ideas and a Pinterest-style board to save looks to.\n\nThe hard part wasn’t the model, it was **the labels**. The project went through four iterations: rules built on e-commerce metadata (labels that didn’t match how clothes look), Gemini labeling every image (too slow and costly, and only ~700 usable images, so the model overfit), an **embed-cluster-label pipeline** that labeled a 44K-image dataset with **only 300 Gemini calls**, and finally web-scraped editorial images for the niche aesthetics the product dataset barely covers.",
    bullets: [
      "Cut labeling to **just 300 VLM API calls** (from one per image) by embedding a **44K-image dataset** with ResNet-50, clustering with K-Means (k=100), and propagating majority-vote Gemini labels from 3 centroids per cluster into a 41K-image training set.",
      "Trained the ResNet-50 classifier to **83% validation accuracy** despite a **14x class imbalance**, applying inverse-frequency class weighting and progressive unfreezing in PyTorch.",
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
    summary: "Motorized 2-axis camera slider with keyframed moves and AI subject tracking.",
    lede: "An open-source, motorized 2-axis camera slider built by two student videographers. Commercial robotic sliders start around $800; AXI6 does the same job for **about $200** with carbon fiber rails, NEMA 17 steppers on TMC2209 drivers, a Raspberry Pi, and 3D-printed gears and tension-adjustable pulleys that take the play out of the motion.\n\nI built the **control software**: a React/FastAPI web app to jog the camera remotely or lay out **slide-and-pan keyframes on a timeline**, which the Python backend interpolates into synchronized step pulses for both motors. A **YOLOv8 tracking mode** keeps a subject framed while the camera moves.",
    bullets: [
      "Ran a **YOLOv8 + OpenCV tracking pipeline** on a laptop and streamed target trajectories to the Raspberry Pi over **WebSockets**, which put heavy compute on the laptop instead of the weak Raspberry Pi.",
      "Wrote a Python **axis-synchronization algorithm** that computes counter-rotations on the pan axis to cancel parasitic motion from the mechanically-coupled axes, **keeping the subject framed** while the camera slides.",
      "Currently building a similar camera slider **for a client**, for standardized and automated documentation.",
    ],
    tech: ["Python", "JavaScript", "React", "FastAPI", "WebSockets", "OpenCV", "YOLO", "Raspberry Pi"],
    demo: { provider: "vimeo", id: "1184530933" },
    links: [
      { label: "GitHub", href: "https://github.com/adamzhang06/AXI6-cinema-robotics" },
      { label: "Devpost", href: "https://devpost.com/software/axi6-cinema-robotics-camera-slider" },
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
    summary: "AI party-safety app that helps friends keep an eye on each other’s drinking.",
    lede: "A mobile app (React Native, FastAPI, MongoDB) that acts as a friend group’s safety net on a night out. **Tap your phone to an NFC tag**, ideally built into a bar’s drink coaster, to log each drink; the app **estimates your blood alcohol content** with the Widmark formula from your height, weight, age and tolerance, and warns you as you near unsafe limits.\n\n**Gemini-powered sobriety checks**, like a tap-based reaction-time game, weigh how you’re actually responding alongside the math, and friends get designated-driver coordination, emergency contacts and alerts if someone may be at risk. Won **1st Place Overall (of 33 teams)** and **Best Use of AI** at InnovateHER Hacks 2026.",
    bullets: [
      "Ideated the product and built the **React Native frontend**, including the drink-logging interface, a **tap-based reaction-time mini-game** that averages multiple trials, and other safety features.",
      "Wired the frontend to a **Gemini-powered FastAPI backend** that estimated intoxication from a **demographics-based BAC formula** and NFC-logged drink history.",
    ],
    tech: ["Python", "JavaScript", "React Native", "FastAPI", "MongoDB", "Gemini API"],
    demo: { provider: "youtube", id: "GhaOiUV3mbk" },
    links: [
      { label: "GitHub", href: "https://github.com/Azeemme/BarBabes" },
      { label: "Devpost", href: "https://devpost.com/software/barbabes" },
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

// The project's card picture on Projects: the media item marked cover, else the first image (or a video's poster).
export function coverOf(project) {
  const m = project.media.find((x) => x.cover) ?? project.media.find((x) => x.type === "image" || (x.type === "video" && x.poster));
  return m ? { src: m.type === "image" ? m.src : m.poster, alt: m.alt ?? "", position: typeof m.cover === "string" ? m.cover : undefined } : null;
}
