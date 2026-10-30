import { useHistoryBack } from "@/hooks/useHistoryBack";
import { SdCard } from "./SdCard";

export function Crumb() {
  const { crumb } = useHistoryBack();
  if (!crumb) return null;
  return (
    <button type="button" className="crumb" onClick={crumb.go}>
      <span aria-hidden="true">←</span> {crumb.label}
    </button>
  );
}

// Section page head: crumb, H1, eyebrow (the card's count), the card's one-line sub, and that page's SD card on the right,
// so the page mirrors the card you clicked.
export function CardHead({ card, sub = card.sub, aside }) {
  return (
    <div className="chead">
      <div className="ph">
        <Crumb />
        <h1>{card.name}</h1>
        <p className="eyebrow">{card.count}</p>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {aside ?? <SdCard card={card} />}
    </div>
  );
}
