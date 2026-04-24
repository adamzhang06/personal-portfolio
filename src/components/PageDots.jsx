// Absolute within the full-page wrapper so dots populate the entire
// scrollable height — you scroll into new ones as you move down the page.
// y values spread across 0–100% of total page height.
const dots = [
  { x: 7,   y: 2,   d: 18, delay: 0   },
  { x: 89,  y: 3,   d: 21, delay: 0.7 },
  { x: 41,  y: 5,   d: 17, delay: 0.4 },
  { x: 23,  y: 8,   d: 22, delay: 1.2 },
  { x: 74,  y: 10,  d: 19, delay: 1.8 },
  { x: 58,  y: 13,  d: 25, delay: 3   },
  { x: 13,  y: 16,  d: 23, delay: 2.5 },
  { x: 96,  y: 18,  d: 15, delay: 3.5 },
  { x: 55,  y: 21,  d: 20, delay: 2.7 },
  { x: 81,  y: 24,  d: 22, delay: 0.2 },
  { x: 35,  y: 27,  d: 16, delay: 0.1 },
  { x: 3,   y: 30,  d: 26, delay: 0.9 },
  { x: 68,  y: 33,  d: 24, delay: 1   },
  { x: 19,  y: 36,  d: 21, delay: 1.5 },
  { x: 83,  y: 39,  d: 18, delay: 2.2 },
  { x: 47,  y: 42,  d: 19, delay: 4.8 },
  { x: 26,  y: 45,  d: 18, delay: 3.1 },
  { x: 91,  y: 47,  d: 20, delay: 1.1 },
  { x: 66,  y: 50,  d: 15, delay: 1.4 },
  { x: 52,  y: 53,  d: 20, delay: 4   },
  { x: 10,  y: 56,  d: 24, delay: 3.7 },
  { x: 78,  y: 59,  d: 17, delay: 2.9 },
  { x: 38,  y: 62,  d: 17, delay: 4.5 },
  { x: 63,  y: 65,  d: 22, delay: 0.3 },
  { x: 4,   y: 68,  d: 25, delay: 1.6 },
  { x: 29,  y: 71,  d: 18, delay: 0.6 },
  { x: 86,  y: 74,  d: 19, delay: 3.3 },
  { x: 44,  y: 77,  d: 16, delay: 4.2 },
  { x: 72,  y: 80,  d: 21, delay: 0.8 },
  { x: 57,  y: 83,  d: 23, delay: 2   },
  { x: 16,  y: 86,  d: 20, delay: 1.9 },
  { x: 93,  y: 89,  d: 18, delay: 0.5 },
  { x: 33,  y: 92,  d: 22, delay: 3.8 },
  { x: 61,  y: 95,  d: 16, delay: 1.3 },
  { x: 48,  y: 98,  d: 24, delay: 2.4 },
];

export const PageDots = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
    {dots.map((dot, i) => (
      <div
        key={i}
        className="absolute w-1.5 h-1.5 rounded-full opacity-40"
        style={{
          backgroundColor: "#8a55e6",
          left: `${dot.x}%`,
          top: `${dot.y}%`,
          animation: `slow-drift ${dot.d}s ease-in-out infinite`,
          animationDelay: `${dot.delay}s`,
        }}
      />
    ))}
  </div>
);
