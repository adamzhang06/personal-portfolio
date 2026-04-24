import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

// ─── Grid system ────────────────────────────────────────────────────────────
// 20 columns × N rows. Row height is kept equal to column width (square cells)
// so row numbers are a real, predictable unit on the Y axis.
//
// col:    full CSS gridColumn  e.g. "1 / span 7"
// row:    integer rowStart     e.g. 1  (rowSpan is auto-computed from aspect + colSpan)
// aspect: "w/h"                e.g. "2/3" — drives both display and rowSpan math
//
// Gap between cells = GAP_PX. Row height tracks column width via ResizeObserver.
// ─────────────────────────────────────────────────────────────────────────────

const COLS = 20;
const GAP_PX = 12; // gap-3 = 12px

function colSpanOf(col) {
  const m = String(col).match(/span\s+(\d+)/i);
  return m ? parseInt(m[1]) : 1;
}

function rowSpanOf(col, aspect) {
  const [w, h] = aspect.split("/").map(Number);
  return Math.round(colSpanOf(col) * (h / w));
}

// ─── Layout ──────────────────────────────────────────────────────────────────
// row numbers use the square-cell coordinate system above.
// Leave gaps between sections by jumping row values.
// ─────────────────────────────────────────────────────────────────────────────
const layout = [
  // — Section 1 —                             computed rowSpans:
  {                                            // col span 7,  aspect 2/3 → rowSpan 11
    col: "1 / span 7",  row: 1,  aspect: "2/3",
    src: "/photos/3955912_3955912-R1-076-36A.jpg", alt: "",
    meta: { camera: "Nikon F3", film: "Kodak Gold 200", date: "June 2023" },
  },
  {                                            // col span 13, aspect 3/2 → rowSpan 9
    col: "9 / span 13", row: 1,  aspect: "3/2",
    src: "/photos/000044400015.jpg", alt: "",
    meta: { camera: "Nikon F3", film: "Kodak Portra 160", date: "June 2023" },
  },
  {                                            // col span 10, aspect 3/2 → rowSpan 7
    col: "1 / span 12", row: 13, aspect: "3/2",
    src: "/photos/AYZ_7313.jpg", alt: "",
    meta: { camera: "Nikon D750", lens: "95mm", settings: "f/16 · 1/60s · ISO 100", location: "West Lafayette, IN", date: "September 2025" },
  },
  {                                            // col span 7,  aspect 2/3 → rowSpan 11
    col: "14 / span 7", row: 11, aspect: "2/3",
    src: "/photos/AYZ_0315.JPG", alt: "",
    meta: { camera: "Nikon Z5II", lens: "50mm", settings: "f/1.8 · 1/400s · ISO 100", location: "Kansas City, MO", date: "March 2026" },
  },

  // — Section 2 — (s1 ends row 22, +3 gap → row 25)
  {
    col: "15 / span 6", row: 23, aspect: "2/3",
    src: "/photos/AYZ_0111.JPG", alt: "",
    meta: { camera: "Nikon Z5II", lens: "50mm", settings: "f/5.6 · 1/100s · ISO 57600", location: "Ballwin, MO", date: "March 2026" },
  },  // rowSpan  8, ends 33
  {
    col: "2 / span 9", row: 22, aspect: "3/2",
    src: "/photos/AYZ_0090.JPG", alt: "",
    meta: { camera: "Nikon Z5II", lens: "50mm", settings: "f/2 · 1/250s · ISO 7200", location: "Ballwin, MO", date: "March 2026" },
  },  // rowSpan  9, ends 36 (+2 stagger)
  {
    col: "4 / span 10", row: 29, aspect: "3/2",
    src: "/photos/AYZ_8259.jpg", alt: "",
    meta: { camera: "Nikon D750", lens: "24mm", settings: "f/22 · 1/10s · ISO 100", location: "Mexico City", date: "December 2025" },
  },  // rowSpan  8, ends 46 (+2 gap)

  // — Section 3: hero — (s2 ends row 46, +3 gap → row 49)
  {
    col: "1 / span 20", row: 37, aspect: "3/2",
    src: "/photos/000016520031.jpg", alt: "",
    meta: { camera: "Nikon F3", film: "Kodak Gold 200", location: "Arches National Park", date: "June 2023" },
  },  // rowSpan 13, ends 62

  // — Section 4 — (s3 ends row 62, +3 gap → row 65)
  { col: "15 / span 6", row: 65, aspect: "2/3", label: "2×3" },  // rowSpan  9, ends 74
  { col: "1 / span 12", row: 67, aspect: "5/4", label: "5×4" },  // rowSpan 10, ends 77 (+2 stagger)

  // — Section 5 — (s4 ends row 77, +3 gap → row 80)
  { col: "1 / span 7",  row: 80, aspect: "4/5", label: "4×5" },  // rowSpan  9, ends 89
  { col: "9 / span 12", row: 82, aspect: "3/2", label: "3×2" },  // rowSpan  8, ends 90 (+2 stagger)
  { col: "4 / span 13", row: 93, aspect: "4/3", label: "4×3" },  // rowSpan 10, ends 103 (+3 gap)
];

// ─── Component ───────────────────────────────────────────────────────────────

export const Photography = () => {
  const [lightbox, setLightbox] = useState(null);
  const [rowUnit, setRowUnit] = useState(40); // px per row unit, updated by observer
  const gridRef = useRef(null);

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
            Through the{" "}
            <span className="font-serif italic font-normal text-primary">lens</span>
          </h1>
          <p className="text-muted-foreground max-w-lg animate-fade-in animation-delay-300">
            A collection of moments I've captured. Digital and film.
          </p>
        </div>

        {/* White canvas */}
        <div className="bg-white p-10 animate-fade-in animation-delay-400">
          <div
            ref={gridRef}
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridAutoRows: `${rowUnit}px`,
              gap: `${GAP_PX}px`,
            }}
          >
            {layout.map((slot, idx) => {
              const span = rowSpanOf(slot.col, slot.aspect);
              const gridRow = `${slot.row} / span ${span}`;
              const meta = slot.meta || {};
              const hasMeta = Object.values(meta).some(Boolean);

              if (!slot.src) {
                return (
                  <div
                    key={idx}
                    style={{ gridColumn: slot.col, gridRow }}
                    className="bg-neutral-100 flex items-center justify-center select-none overflow-hidden"
                  >
                    <span className="text-neutral-300 text-[10px] font-mono tracking-widest">
                      {slot.label}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  style={{ gridColumn: slot.col, gridRow }}
                  className="relative group cursor-pointer overflow-hidden"
                  onClick={() => setLightbox(slot)}
                >
                  <img
                    src={slot.src}
                    alt={slot.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {hasMeta && (
                    <div className="absolute inset-x-0 bottom-0 hidden group-hover:block bg-gradient-to-t from-black/75 to-transparent pt-10 px-4 pb-4">
                      <div className="flex flex-col gap-0.5">
                        {(meta.camera || meta.lens) && (
                          <p className="text-white text-[11px] font-medium leading-snug">
                            {[meta.camera, meta.lens].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {meta.settings && (
                          <p className="text-white/70 text-[10px] font-mono">
                            {meta.settings}
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
            className="absolute top-5 right-5 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
