// Copy with **marked** phrases set in bold, so key words and numbers catch the eye, and ==marked== phrases
// in bold accent purple (the name in the Home intro).
export function Rich({ text }) {
  return text.split(/(\*\*.+?\*\*|==.+?==)/g).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("==")) return <strong key={i} className="hl">{part.slice(2, -2)}</strong>;
    return part;
  });
}
