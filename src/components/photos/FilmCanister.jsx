// A 35 mm cartridge standing upright: a label in its kind's colours (fav, trip, film, year) with the AYZ mark, name,
// year and a band. Sized by --cw / --ch. Purely visual; whatever opens it carries the text in its own label.
export function FilmCanister({ kind, name, year, band }) {
  return (
    <span className={`can k-${kind}`} aria-hidden="true">
      <span className="nub" />
      <span className="cap" />
      <span className="lbl">
        <span className="slit" />
        <span className="k">AYZ 200</span>
        <span className="nm">{name}</span>
        <span className="yr">{year}</span>
        <span className="band">{band}</span>
      </span>
      <span className="cap" />
    </span>
  );
}
