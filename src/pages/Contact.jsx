import { Copy, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { useUi } from "@/context/uiContext";
import { contact } from "@/data/contact";
import { Crumb } from "@/components/CardHead";

const ICON = { size: 20, strokeWidth: 1.8, "aria-hidden": true };

const EXTERNAL = [
  { ...contact.github, icon: Github },
  { ...contact.linkedin, icon: Linkedin },
  { ...contact.instagram, icon: Instagram },
];

// Icon tiles with no visible labels (names are screen-reader text); external links open in a new tab.
export function Contact() {
  const { showToast } = useUi();
  const copyEmail = () => {
    navigator.clipboard?.writeText(contact.email.value).catch(() => {});
    showToast("Email copied");
  };

  return (
    <div className="wrap page">
      <div className="ph">
        <Crumb />
        <p className="eyebrow">Get in touch</p>
        <h1>Contact</h1>
      </div>
      <div className="two">
        <div className="lks">
          <div className="lk">
            <a className="lk-a" href={contact.email.href}>
              <span className="lk-i">
                <Mail {...ICON} />
              </span>
              <span className="lk-t">
                <span className="sr">Email </span>
                {contact.email.value}
              </span>
            </a>
            <button type="button" className="lk-copy" aria-label="Copy email address" onClick={copyEmail}>
              <Copy {...ICON} />
            </button>
          </div>
          {EXTERNAL.map(({ icon, label, value, href }) => {
            const LinkIcon = icon;
            return (
              <a key={href} className="lk lk-a" href={href} target="_blank" rel="noopener noreferrer">
                <span className="lk-i">
                  <LinkIcon {...ICON} />
                </span>
                <span className="lk-t">
                  <span className="sr">{label} </span>
                  {value}
                </span>
                <span className="lk-go" aria-hidden="true">
                  ↗
                </span>
              </a>
            );
          })}
        </div>
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
