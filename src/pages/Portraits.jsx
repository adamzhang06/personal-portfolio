import { useState, useLayoutEffect, useRef } from "react";
import { useLightbox } from "@/hooks/useLightbox";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import manifest from "@/data/photo-manifest.json";

// ─── Grid system (shared with Gallery) ───────────────────────────────────────
const COLS = 20;
const GAP_PX = 12;

function rowSpanOf(colSpan, src) {
  const filename = src.replace("/photos/", "");
  const dims = manifest[filename];
  return dims ? Math.round(colSpan * (dims.h / dims.w)) : colSpan;
}

// ─── Session data ─────────────────────────────────────────────────────────────
// Add sessions here. sortDate: "YYYY-MM" controls display order (newest first).
// date is the human-readable label shown on the page.
// paid: true once a session becomes client work (not shown visually yet).
// Drop photos into public/photos/portraits/ and run `npm run generate-manifest`.
// ─────────────────────────────────────────────────────────────────────────────
const sessions = [
  // Example session structure — replace with real data when available:
  // {
  //   name: "Sarah · Graduation",
  //   sortDate: "2026-05",
  //   date: "May 2026",
  //   paid: false,
  //   photos: [
  //     { src: "/photos/portraits/filename.jpg", alt: "description" },
  //   ],
  // },
];

const sortedSessions = [...sessions].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

// ─── Session grid layout ──────────────────────────────────────────────────────
// Photos in a session are laid out in a two-column grid.
// Slot 0: left half (cols 1–9), slot 1: right half (cols 11–20),
// subsequent photos continue the pattern.
const SESSION_SLOTS = [
  { colStart: 1,  colSpan: 9  },
  { colStart: 11, colSpan: 10 },
  { colStart: 1,  colSpan: 10 },
  { colStart: 12, colSpan: 9  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const Portraits = () => {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useLightbox();
  const [rowUnit, setRowUnit] = useState(40);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const gridRefs = useRef({});

  const markLoaded = (key) =>
    setLoadedImages((prev) => new Set([...prev, key]));

  // Track row unit from first session grid (or a single shared observer)
  useLayoutEffect(() => {
    const observers = [];
    Object.entries(gridRefs.current).forEach(([key, el]) => {
      if (!el) return;
      const update = () => {
        const w = el.getBoundingClientRect().width;
        setRowUnit((w - (COLS - 1) * GAP_PX) / COLS);
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      observers.push(ro);
    });
    return () => observers.forEach((ro) => ro.disconnect());
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
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
            Portrait{" "}
            <span className="font-serif italic font-normal text-primary">sessions</span>
          </h1>
          <p className="text-muted-foreground max-w-lg animate-fade-in animation-delay-300">
            Available for grad, portrait, and event sessions —{" "}
            <button
              onClick={() => {
                navigate("/");
                setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 80);
              }}
              className="underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
            >
              get in touch.
            </button>
          </p>
        </div>

        {/* Sessions */}
        {sortedSessions.length === 0 ? (
          <div className="bg-white p-10 animate-fade-in animation-delay-500">
            <p className="text-neutral-300 text-sm text-center py-20">Sessions coming soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12 animate-fade-in animation-delay-500">
            {sortedSessions.map((session, sIdx) => {
              const cells = session.photos.map((photo, pIdx) => {
                const slot = SESSION_SLOTS[pIdx % SESSION_SLOTS.length];
                const span = rowSpanOf(slot.colSpan, photo.src);
                return {
                  ...photo,
                  gridColumn: `${slot.colStart} / span ${slot.colSpan}`,
                  gridRow: `1 / span ${span}`,
                };
              });

              return (
                <div key={sIdx}>
                  {/* Session label */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <h2 className="text-sm font-medium text-foreground">{session.name}</h2>
                    <span className="text-[11px] text-muted-foreground font-mono">{session.date}</span>
                  </div>

                  {/* White canvas */}
                  <div className="bg-white p-10">
                    <div
                      ref={(el) => { gridRefs.current[sIdx] = el; }}
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                        gridAutoRows: `${rowUnit}px`,
                        gap: `${GAP_PX}px`,
                      }}
                    >
                      {cells.map((cell, cIdx) => {
                        const key = `${sIdx}-${cIdx}`;
                        return (
                          <div
                            key={cIdx}
                            style={{ gridColumn: cell.gridColumn, gridRow: cell.gridRow }}
                            className="relative group cursor-pointer overflow-hidden"
                            onClick={() => setLightbox(cell)}
                          >
                            {!loadedImages.has(key) && (
                              <div className="absolute inset-0 animate-shimmer" />
                            )}
                            <img
                              src={cell.src}
                              alt={cell.alt}
                              className={`w-full h-full object-cover transition-opacity duration-500 ${loadedImages.has(key) ? "opacity-100" : "opacity-0"}`}
                              loading="lazy"
                              onLoad={() => markLoaded(key)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 overflow-y-auto"
          onClick={() => setLightbox(null)}
        >
          <button
            className="fixed top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex min-h-full items-center justify-center p-4 md:p-8">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="block w-auto max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
