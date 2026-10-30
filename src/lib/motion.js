// One easing set and one set of durations; CSS mirrors these as --out / --expo / --press / --exit.

export const EASE = {
  out: [0.23, 1, 0.32, 1], // arriving
  expo: [0.16, 1, 0.3, 1], // camera glide, flip, iris
  press: [0.19, 1.51, 0.29, 0.99], // button press, dial
  exit: [0.71, 0.01, 0.81, -0.51], // leaving
};

export const DURATION = {
  hover: 150,
  panel: 300,
  reveal: 600, // iris reveal, dock glide
  flip: 1000,
  flash: 120, // shutter flash before Contact
  toast: 1400,
};

// cubic-bezier(p1x, p1y, p2x, p2y) as a function of t ∈ [0, 1]
export function bezier(p1x, p1y, p2x, p2y) {
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0, hi = 1, s, x;
    for (let i = 0; i < 24; i++) {
      s = (lo + hi) / 2;
      x = 3 * (1 - s) * (1 - s) * s * p1x + 3 * (1 - s) * s * s * p2x + s * s * s;
      if (x < t) lo = s;
      else hi = s;
    }
    s = (lo + hi) / 2;
    return 3 * (1 - s) * (1 - s) * s * p1y + 3 * (1 - s) * s * s * p2y + s * s * s;
  };
}

export const expo = bezier(...EASE.expo);
