import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { PhotographySubNav } from "@/components/PhotographySubNav";
import manifest from "@/data/photo-manifest.json";

// ─── Grid system ─────────────────────────────────────────────────────────────
const COLS = 40;
const GAP_PX = 12;
const BLOCK_GAP = 2;    // rows of breathing room after a year's photos / after a divider
const DIVIDER_ROWS = 2; // grid rows consumed by a year divider
const NAVBAR_H = 80;

// ─── Layout algorithm ─────────────────────────────────────────────────────────
// yearGroups is processed in order (newest first).
// Each year gets its own divider, and rowStart values are relative to that
// year's photo area — so edits to one year never shift another.
//
// ─────────────────────────────────────────────────────────────────────────────
// rowUnit is passed in so rowSpan can account for the gap structure exactly:
//   photoWidthPx  = colSpan * rowUnit + (colSpan - 1) * GAP_PX
//   rowSpan       = (photoWidthPx * h/w + GAP_PX) / (rowUnit + GAP_PX)
// This degenerates to colSpan * h/w when GAP_PX → 0, and is exact otherwise.
function computeLayout(yearGroups, rowUnit) {
  const cells = [];
  const yearMarkers = [];
  let baseRow = 1 + BLOCK_GAP;

  for (const group of yearGroups) {
    // Year divider — spans all columns
    yearMarkers.push({ year: group.year, rowStart: baseRow });
    cells.push({
      type: "divider",
      year: group.year,
      gridColumn: `1 / span ${COLS}`,
      gridRow: `${baseRow} / span ${DIVIDER_ROWS}`,
    });

    const photoBaseRow = baseRow + DIVIDER_ROWS + BLOCK_GAP;
    let yearHeight = 0;

    for (const photo of group.photos) {
      const filename = photo.src.replace("/photos/", "");
      const dims = manifest[filename];

      const colSpan = photo.colSpan;
      const photoWidthPx = colSpan * rowUnit + (colSpan - 1) * GAP_PX;
      const rowSpan = dims
        ? Math.round((photoWidthPx * (dims.h / dims.w) + GAP_PX) / (rowUnit + GAP_PX))
        : colSpan;

      const absRow = photoBaseRow + photo.rowStart - 1;

      cells.push({
        type: "photo",
        ...photo,
        gridColumn: `${photo.colStart} / span ${colSpan}`,
        gridRow: `${absRow} / span ${rowSpan}`,
      });

      yearHeight = Math.max(yearHeight, photo.rowStart - 1 + rowSpan);
    }

    baseRow = photoBaseRow + yearHeight + BLOCK_GAP;
  }

  return { cells, yearMarkers };
}

// ─── Photo data ───────────────────────────────────────────────────────────────
// Photos are grouped by year. Within each year, rowStart is relative to that
// year's photo area (row 1 = first row after the year divider).
//
// colSpan = explicit column span; rowSpan is always derived from the aspect ratio.
//
// Run `npm run generate-manifest` after adding new files to public/photos/gallery/.
// ─────────────────────────────────────────────────────────────────────────────
const yearGroups = [
  // ── 2026 ──────────────────────────────────────────────────────────────────────
  {
    year: "2026",
    photos: [
      {
        src: "/photos/gallery/2026/AYZ_0111.JPG",  // portrait
        alt: "Begonia & Pepper",
        colStart: 1, colSpan: 16, rowStart: 1,
        meta: {
          camera: "Nikon Z5II",
          lens: "50mm",
          settings: ["f/5.6", "1/100s", "ISO 57600"],
          location: "Ballwin, MO",
          date: "March 2026",
        },
      },
      {
        src: "/photos/gallery/2026/AYZ_0090.JPG",  // landscape
        alt: "Begonia",
        colStart: 18, colSpan: 23, rowStart: 1,
        meta: {
          camera: "Nikon Z5II",
          lens: "50mm",
          settings: ["f/2", "1/250s", "ISO 7200"],
          location: "Ballwin, MO",
          date: "March 2026",
        },
      },
      {
        src: "/photos/gallery/2026/AYZ_0315.JPG",  // portrait
        alt: "Chelsea's UMKC Portrait",
        colStart: 30, colSpan: 11, rowStart: 17,
        meta: {
          camera: "Nikon Z5II",
          lens: "50mm",
          settings: ["f/1.8", "1/400s", "ISO 100"],
          location: "Kansas City, MO",
          date: "March 2026",
        },
      },
      {
        src: "/photos/gallery/2026/AYZ_3399.jpg",  // portrait
        alt: "Charly Bell Tower",
        colStart: 18, colSpan: 11, rowStart: 17,
        meta: {
          camera: "Nikon Z5II",
          lens: "50mm",
          settings: ["f/1.4", "1/1000s", "ISO 100"],
          location: "West Lafayette, IN",
          date: "May 2026",
        },
      },
      {
        src: "/photos/gallery/2026/AYZ_1916.jpg",  // landscape
        alt: "Gil Helmet",
        colStart: 1, colSpan: 16, rowStart: 26,
        meta: {
          camera: "Nikon Z5II",
          lens: "75mm",
          settings: ["f/2.8", "1/8000s", "ISO 360"],
          location: "West Lafayette, IN",
          date: "April 2026",
        },
      },
      {
        src: "/photos/gallery/2026/AYZ_2052.jpg",  // portrait
        alt: "PF26 Slow Shutter",
        colStart: 1, colSpan: 16, rowStart: 40,
        meta: {
          camera: "Nikon Z5II",
          lens: "36mm",
          settings: ["f/20", "1/60s", "ISO 100"],
          location: "West Lafayette, IN",
          date: "April 2026",
        },
      },
      {
        src: "/photos/gallery/2026/AYZ_1540.jpg",  // landscape
        alt: "HTF Group",
        colStart: 18, colSpan: 24, rowStart: 33,
        meta: {
          camera: "Nikon Z5II",
          lens: "28mm",
          settings: ["f/8", "1/100s", "ISO 1600"],
          location: "West Lafayette, IN",
          date: "April 2026",
        },
      },
    ],
  },

  // ── 2025 ──────────────────────────────────────────────────────────────────────
  {
    year: "2025",
    photos: [
      {
        src: "/photos/gallery/2025/AYZ_8259.jpg",  // landscape
        alt: "Porsche CMDX",
        colStart: 22, colSpan: 20, rowStart: 1,
        meta: {
          camera: "Nikon D750",
          lens: "24mm",
          settings: ["f/22", "1/10s", "ISO 100"],
          location: "Mexico City",
          date: "December 2025",
        },
      },
      {
        src: "/photos/gallery/2025/AYZ_7313.jpg",  // landscape
        alt: "PF25",
        colStart: 1, colSpan: 19, rowStart: 1,
        meta: {
          camera: "Nikon D750",
          lens: "95mm",
          settings: ["f/16", "1/60s", "ISO 100"],
          location: "West Lafayette, IN",
          date: "September 2025",
        },
      },
      {
        src: "/photos/gallery/2025/AYZ_7791.jpg",  // portrait
        alt: "Water Temple Two People",
        colStart: 1, colSpan: 9, rowStart: 15,
        meta: {
          camera: "Nikon D750",
          lens: "46mm",
          settings: ["f/4", "1/800s", "ISO 100"],
          location: "San Mateo, CA",
          date: "November 2025",
        },
      },
      {
        src: "/photos/gallery/2025/AYZ_7803.jpg",  // portrait
        alt: "Water Temple Sun Flare",
        colStart: 11, colSpan: 9, rowStart: 15,
        meta: {
          camera: "Nikon D750",
          lens: "31mm",
          settings: ["f/11", "1/40s", "ISO 100"],
          location: "San Mateo, CA",
          date: "November 2025",
        },
      },
      {
        src: "/photos/gallery/2025/AYZ_7687.jpg",  // portrait
        alt: "Mom and Dad Portrait",
        colStart: 22, colSpan: 9, rowStart: 15,
        meta: {
          camera: "Nikon D750",
          lens: "58mm",
          settings: ["f/4", "1/1000s", "ISO 250"],
          location: "Sausalito, CA",
          date: "November 2025",
        },
      },
      {
        src: "/photos/gallery/2025/AYZ_7859.jpg",  // portrait
        alt: "Dad O",
        colStart: 32, colSpan: 9, rowStart: 15,
        meta: {
          camera: "Nikon D750",
          lens: "24mm",
          settings: ["f/5.6", "1/125s", "ISO 100"],
          location: "Sausalito, CA",
          date: "November 2025",
        },
      },
      {
        src: "/photos/gallery/2025/AYZ_7910.jpg",  // landscape
        alt: "Mom and Dad Garden Portrait",
        colStart: 3, colSpan: 36, rowStart: 29,
        meta: {
          camera: "Nikon D750",
          lens: "56mm",
          settings: ["f/4", "1/1000s", "ISO 400"],
          location: "Sausalito, CA",
          date: "November 2025",
        },
      },
    ],
  },

  // ── 2024 ──────────────────────────────────────────────────────────────────────
  {
    year: "2024",
    photos: [
      {
        src: "/photos/gallery/2024/IMG_0651.JPG",  // landscape
        alt: "Solar Eclipse",
        colStart: 3, colSpan: 36, rowStart: 1,
        meta: {
          camera: "Canon PowerShot SX50 HS",
          lens: "176mm",
          settings: ["f/6.5", "1/320s", "ISO 400"],
          location: "Cape Girardeau, MO",
          date: "April 2024",
        },
      },
      {
        src: "/photos/gallery/2024/AYZ_5102_01.JPG",  // portrait
        alt: "Calvin Samples",
        colStart: 15, colSpan: 13, rowStart: 22,
        meta: {
          camera: "Nikon D750",
          lens: "70mm",
          settings: ["f/2.8", "1/250s", "ISO 2000"],
          location: "Ballwin, MO",
          date: "March 2024",
        },
      },
      {
        src: "/photos/gallery/2024/AYZ_5050_01.JPG",  // portrait
        alt: "Calvin",
        colStart: 1, colSpan: 13, rowStart: 22,
        meta: {
          camera: "Nikon D750",
          lens: "70mm",
          settings: ["f/2.8", "1/15s", "ISO 100"],
          location: "Ballwin, MO",
          date: "March 2024",
        },
      },
      {
        src: "/photos/gallery/2024/AYZ_5070_01.JPG",  // portrait
        alt: "Calvin Extended",
        colStart: 29, colSpan: 13, rowStart: 22,
        meta: {
          camera: "Nikon D750",
          lens: "82mm",
          settings: ["f/2.8", "1/15s", "ISO 100"],
          location: "Ballwin, MO",
          date: "March 2024",
        },
      },
    ],
  },

  // ── 2023 ──────────────────────────────────────────────────────────────────────
  {
    year: "2023",
    photos: [
      {
        src: "/photos/gallery/2023/000016520031.jpg",  // landscape
        alt: "Arches Wide",
        colStart: 3, colSpan: 36, rowStart: 1,
        meta: {
          camera: "Nikon F3",
          film: "Kodak Gold 200",
          location: "Arches National Park",
          date: "June 2023",
        },
      },
      {
        src: "/photos/gallery/2023/3955912_3955912-R1-076-36A.jpg",  // portrait
        alt: "Pigeon and Moon",
        colStart: 2, colSpan: 12, rowStart: 45,
        meta: {
          camera: "Nikon F3",
          film: "Kodak Gold 200",
          location: "Monterey Bay, CA",
          date: "June 2023",
        },
      },
      {
        src: "/photos/gallery/2023/000044400015.jpg",  // landscape
        alt: "White Flowers",
        colStart: 3, colSpan: 36, rowStart: 64,
        meta: {
          camera: "Nikon F3",
          film: "Kodak Portra 160",
          date: "June 2023",
        },
      },
      {
        src: "/photos/gallery/2023/000016500031.jpg",  // portrait
        alt: "Charly Tesla",
        colStart: 15, colSpan: 12, rowStart: 45,
        meta: {
          camera: "Nikon F3",
          film: "Kodak Gold 200",
          date: "June 2023",
        },
      },
      {
        src: "/photos/gallery/2023/000067370012.jpg",  // portrait
        alt: "Lighthouse",
        colStart: 8, colSpan: 12, rowStart: 26,
        meta: {
          camera: "Nikon F3",
          film: "HP5+ 400 (+2 stops)",
          location: "Pigeon Point Lighthouse, CA",
          date: "March 2023",
        },
      },
      {
        src: "/photos/gallery/2023/000067370011.jpg",  // portrait
        alt: "Coastline",
        colStart: 22, colSpan: 12, rowStart: 26,
        meta: {
          camera: "Nikon F3",
          film: "HP5+ 400 (+2 stops)",
          location: "Pigeon Point Lighthouse, CA",
          date: "March 2023",
        },
      },
      {
        src: "/photos/gallery/2023/3955912_3955912-R1-062-29A.jpg",  // portrait
        alt: "Corner Flower Building",
        colStart: 28, colSpan: 12, rowStart: 45,
        meta: {
          camera: "Nikon F3",
          film: "Kodak Gold 200",
          date: "June 2023",
        },
      },
    ],
  },

  // ── 2022 ──────────────────────────────────────────────────────────────────────
  {
    year: "2022",
    photos: [
      {
        src: "/photos/gallery/2022/ADM_3713.JPG",  // landscape
        alt: "Yellowstone Goat Eating",
        colStart: 22, colSpan: 19, rowStart: 1,
        meta: {
          camera: "Nikon D750",
          lens: "300mm",
          settings: ["f/5.6", "1/1000s", "ISO 140"],
          location: "Yellowstone National Park",
          date: "June 2022",
        },
      },
      {
        src: "/photos/gallery/2022/ADM_3714.jpeg",  // landscape
        alt: "Yellowstone Goat Smiling",
        colStart: 1, colSpan: 19, rowStart: 1,
        meta: {
          camera: "Nikon D750",
          lens: "600mm",
          settings: ["f/6.3", "1/800s", "ISO 140"],
          location: "Yellowstone National Park",
          date: "June 2022",
        },
      },
      {
        src: "/photos/gallery/2022/ADM_3735.jpeg",  // landscape
        alt: "Yellowstone Goat on the edge",
        colStart: 5, colSpan: 32, rowStart: 15,
        meta: {
          camera: "Nikon D750",
          lens: "400mm",
          settings: ["f/6", "1/1000s", "ISO 400"],
          location: "Yellowstone National Park",
          date: "June 2022",
        },
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const Photography = () => {
  const [lightbox, setLightbox] = useState(null);
  const [rowUnit, setRowUnit] = useState(40);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const gridRef = useRef(null);

  const { cells: layout, yearMarkers } = useMemo(
    () => computeLayout(yearGroups, rowUnit),
    [rowUnit]
  );
  const years = yearMarkers.map((m) => m.year);

  const markLoaded = (idx) =>
    setLoadedImages((prev) => new Set([...prev, idx]));

  // Keep row height = column width (square cells)
  useLayoutEffect(() => {
    const update = () => {
      if (!gridRef.current) return;
      const w = gridRef.current.getBoundingClientRect().width;
      setRowUnit((w - (COLS - 1) * GAP_PX) / COLS);
    };
    update();
    const ro = new ResizeObserver(update);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, []);

  // Lightbox keyboard + scroll lock
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const scrollToYear = (year) => {
    const marker = yearMarkers.find((m) => m.year === year);
    if (!marker || !gridRef.current) return;
    const gridTop = gridRef.current.getBoundingClientRect().top + window.scrollY;
    const rowY = (marker.rowStart - 1) * (rowUnit + GAP_PX);
    window.scrollTo({ top: gridTop + rowY - NAVBAR_H, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="animate-fade-in">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to portfolio
            </Link>
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 animate-fade-in animation-delay-100">
            Photography
          </p>
          <h1 className="text-4xl font-bold mb-4 animate-fade-in animation-delay-200">
            Through the{" "}
            <span className="font-serif italic font-normal text-primary">lens</span>
          </h1>
          <p className="text-muted-foreground max-w-lg animate-fade-in animation-delay-300">
            A collection of moments I've captured. Digital and film.
          </p>
          <PhotographySubNav />
        </div>

        {/* Year pills */}
        <div className="flex items-center gap-3 mb-4 animate-fade-in animation-delay-400">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Jump to</span>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => scrollToYear(year)}
              className="text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-0.5 border border-border hover:border-foreground/30 transition-colors"
            >
              {year}
            </button>
          ))}
        </div>

        {/* White canvas */}
        <div className="bg-white py-10 px-10 animate-fade-in animation-delay-500">
          <div
            ref={gridRef}
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridAutoRows: `${rowUnit}px`,
              gap: `${GAP_PX}px`,
            }}
          >
            {layout.map((cell, idx) => {
              if (cell.type === "divider") {
                return (
                  <div
                    key={`divider-${cell.year}`}
                    style={{ gridColumn: cell.gridColumn, gridRow: cell.gridRow }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-1 h-px bg-neutral-300" />
                    <span className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] select-none">
                      {cell.year}
                    </span>
                    <div className="flex-1 h-px bg-neutral-300" />
                  </div>
                );
              }

              const meta = cell.meta || {};
              const hasMeta = Object.values(meta).some(Boolean);

              return (
                <div
                  key={idx}
                  style={{ gridColumn: cell.gridColumn, gridRow: cell.gridRow }}
                  className="relative group cursor-pointer overflow-hidden"
                  onClick={() => setLightbox(cell)}
                >
                  {!loadedImages.has(idx) && (
                    <div className="absolute inset-0 animate-shimmer" />
                  )}
                  <img
                    src={cell.src}
                    alt={cell.alt}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${loadedImages.has(idx) ? "opacity-100" : "opacity-0"}`}
                    loading="lazy"
                    onLoad={() => markLoaded(idx)}
                  />
                  {hasMeta && (
                    <div className="absolute inset-x-0 bottom-0 hidden group-hover:block bg-gradient-to-t from-black/75 to-transparent pt-10 px-4 pb-4">
                      <div className="flex flex-col gap-0.5">
                        {(meta.camera || meta.lens) && (
                          <p className="text-white text-[11px] font-medium leading-snug">
                            {[meta.camera, meta.lens].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {meta.settings?.length && (
                          <p className="text-white/70 text-[10px] font-mono">
                            {meta.settings.join(" · ")}
                          </p>
                        )}
                        {meta.film && (
                          <p className="text-white/60 text-[10px] font-mono italic">
                            {meta.film}
                          </p>
                        )}
                        {(meta.location || meta.date) && (
                          <p className="text-white/60 text-[10px] mt-1">
                            {[meta.location, meta.date].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            className="fixed top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="flex flex-col md:flex-row items-stretch gap-0"
            onClick={(e) => e.stopPropagation()}
          >
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="block w-auto h-auto max-h-[90vh] max-w-[75vw]"
              />
              {lightbox.meta && Object.values(lightbox.meta).some(Boolean) && (
                <div className="w-full md:w-auto shrink-0 bg-neutral-100 flex flex-col justify-center gap-4 px-5 py-5">
                  {(lightbox.meta.camera || lightbox.meta.lens) && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase tracking-widest mb-1">Camera</p>
                      <p className="text-neutral-800 text-sm font-medium leading-snug">
                        {[lightbox.meta.camera, lightbox.meta.lens].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  )}
                  {lightbox.meta.film && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase tracking-widest mb-1">Film</p>
                      <p className="text-neutral-800 text-sm italic">{lightbox.meta.film}</p>
                    </div>
                  )}
                  {lightbox.meta.settings?.length && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase tracking-widest mb-1">Exposure</p>
                      <p className="text-neutral-800 text-sm font-mono">{lightbox.meta.settings.join(" · ")}</p>
                    </div>
                  )}
                  {lightbox.meta.location && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase tracking-widest mb-1">Location</p>
                      <p className="text-neutral-800 text-sm">{lightbox.meta.location}</p>
                    </div>
                  )}
                  {lightbox.meta.date && (
                    <div>
                      <p className="text-neutral-400 text-[10px] uppercase tracking-widest mb-1">Date</p>
                      <p className="text-neutral-800 text-sm">{lightbox.meta.date}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};
