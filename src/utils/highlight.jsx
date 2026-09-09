const isWordChar = (char) => char !== undefined && /[A-Za-z0-9]/.test(char);

export const highlight = (text, phrases) => {
  if (!phrases?.length) return text;
  // Longest first: the alternation is leftmost-first, so "React" listed before
  // "React Native" would otherwise match inside it and bold only half the phrase.
  const escaped = [...phrases]
    .sort((a, b) => b.length - a.length)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(escaped.join("|"), "gi");

  const parts = [];
  let cursor = 0;
  for (const match of text.matchAll(regex)) {
    const value = match[0];
    const start = match.index;
    const end = start + value.length;
    // Skip matches sitting inside a longer word, so a phrase like "R" bolds the
    // standalone language name and not the "r" in every other word. Only guard
    // ends that are alphanumeric, so "C++" and "36.6%" still match.
    if (isWordChar(value[0]) && isWordChar(text[start - 1])) continue;
    if (isWordChar(value[value.length - 1]) && isWordChar(text[end])) continue;

    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <strong key={start} className="text-foreground font-semibold">
        {value}
      </strong>
    );
    cursor = end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
};
