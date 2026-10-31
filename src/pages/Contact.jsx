import { useEffect, useRef, useState } from "react";
import { Github, Instagram, Linkedin } from "lucide-react";
import { contact } from "@/data/contact";
import { Crumb } from "@/components/CardHead";

const ICON = { size: 20, strokeWidth: 1.8, "aria-hidden": true };

const EXTERNAL = [
  { ...contact.github, icon: Github },
  { ...contact.linkedin, icon: Linkedin },
  { ...contact.instagram, icon: Instagram },
];

/* The email address is the page's headline: pressing it copies it (the line under it says so, and says when it has),
   with a link to open it in a mail app. Other accounts and photography sessions sit below; external links open in a
   new tab. */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copyEmail = () => {
    navigator.clipboard?.writeText(contact.email.value).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="wrap page">
      <div className="ph">
        <Crumb />
        <h1>Contact</h1>
        <p className="eyebrow">Get in touch</p>
        <p className="sub">Email is the fastest way to reach me.</p>
      </div>
      <div className="mailbig">
        <button type="button" className={"mail-copy" + (copied ? " done" : "")} aria-describedby="mail-hint" onClick={copyEmail}>
          {contact.email.value}
        </button>
        <p className="mail-hint" id="mail-hint">
          <span aria-live="polite">{copied ? "Copied to your clipboard" : "Press the address to copy it"}</span>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          <a href={contact.email.href}>Open in your mail app</a>
        </p>
      </div>
      <div className="two">
        <section className="else" aria-labelledby="else-h">
          <h2 id="else-h" className="else-h">
            Elsewhere
          </h2>
          <div className="lks">
            {EXTERNAL.map(({ icon, label, value, href }) => {
              const LinkIcon = icon;
              return (
                <a key={href} className="lk lk-a" href={href} target="_blank" rel="noopener noreferrer">
                  <span className="lk-i">
                    <LinkIcon {...ICON} />
                  </span>
                  <span className="lk-t">{value}</span>
                  <span className="lk-l">{label}</span>
                  <span className="lk-go" aria-hidden="true">
                    ↗
                  </span>
                </a>
              );
            })}
          </div>
        </section>
        <section className="sess" aria-labelledby="sess-h">
          <h2 id="sess-h">Photography sessions</h2>
          <p>Available for grad, portrait, and event sessions. Send a message on the photography account or email me with your date and location.</p>
          <a className="btn primary" href={contact.photos.href} target="_blank" rel="noopener noreferrer">
            Message {contact.photos.value} <span aria-hidden="true">↗</span>
          </a>
        </section>
      </div>
    </div>
  );
}
