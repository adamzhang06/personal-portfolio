import { NAME } from "@/data/site";

export function Polaroid() {
  return (
    <figure className="polaroid">
      <img src="/assets/portrait.jpg" alt="Adam Zhang smiling outdoors in a black Purdue quarter-zip, trees behind him" width="216" height="216" />
      <figcaption>{NAME}</figcaption>
    </figure>
  );
}
