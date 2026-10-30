import { CONTROLS, LEADERS } from "./controls";

// Right-column labels never run off a narrower window.
const leftFor = ({ lp, lx }) => (lp === 50 && lx >= 500 ? `min(calc(50% + ${lx}px), calc(100% - 250px))` : `calc(${lp}% + ${lx}px)`);

// Home-only labels. Each has a 1 px line from its nearest edge to a 10 px ring on its control; the engine
// moves the lines and fades a label while its control faces away.
export function LeaderLabels({ view, actions, cover }) {
  const list = LEADERS[view];
  return (
    <div className={"camfade" + (cover ? " cover" : "")}>
      <svg className="leaders" aria-hidden="true">
        {list.map((l) => (
          <g key={l.k}>
            <line className="ll" data-line={l.k} x1="0" y1="0" x2="0" y2="0" />
            <circle className="lr" data-ring={l.k} cx="-20" cy="-20" r="5" />
          </g>
        ))}
      </svg>
      {list.map((l) => (
        <button key={l.k} type="button" className="lead" data-lead={l.k} tabIndex={-1} style={{ left: leftFor(l), top: l.y }} onClick={actions[l.k]}>
          {l.label ?? CONTROLS[l.k].label}
          <span className="lead-k">{l.term ?? CONTROLS[l.k].term}</span>
        </button>
      ))}
    </div>
  );
}
