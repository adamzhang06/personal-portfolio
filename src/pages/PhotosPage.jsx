import { cardByKey } from "@/data/cards";
import { contact } from "@/data/contact";
import { CardHead } from "@/components/CardHead";

// The Photography page (at /photos). The legacy gallery at /photography is left untouched and unlinked
// until the photo pipeline is redesigned.
export function PhotosPage() {
  return (
    <div className="wrap page">
      <CardHead card={cardByKey("photos")} sub="A collection of moments I’ve captured. Digital and film." />
      <div className="cta">
        <a className="btn primary" href={contact.photos.href} target="_blank" rel="noopener noreferrer">
          {contact.photos.value} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
