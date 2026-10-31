// UHS-II contact layout: a row of 9 long contacts across the top edge, a second row of 8 short ones below.
const PINS = Array.from({ length: 17 });

// Printed on the card like a camera readout: a lone digit gets a leading zero ("4 items" → "04 ITEMS").
const printed = (count) => count.replace(/^\d(?=\D)/, "0$&");

// SD card visual: chamfered corner with a thin lavender edge, two rows of gold contacts, per-card gradient,
// mono name and count inside. Everything inside is sized to the card, so the text keeps scale with the contacts.
// `compact` is the small Collections dock version (name only).
export function SdCard({ card, compact = false }) {
  return (
    <span className="sd" aria-hidden="true" style={{ "--c1": card.c1, "--c2": card.c2 }}>
      <span className="sd-in">
        <span className="pins">
          {PINS.map((_, i) => (
            <i key={i} />
          ))}
        </span>
        {compact ? (
          <b>{card.name}</b>
        ) : (
          <span className="sdmid">
            <b>{card.name}</b>
            <em>{printed(card.count)}</em>
          </span>
        )}
        <small>{compact ? "AYZ" : "AYZ · SD"}</small>
      </span>
    </span>
  );
}
