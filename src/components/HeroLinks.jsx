import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { useUi } from "@/context/uiContext";
import { contact } from "@/data/contact";

const LINKS = [
  { icon: Github, href: contact.github.href, label: `GitHub: ${contact.github.value}` },
  { icon: Linkedin, href: contact.linkedin.href, label: `LinkedIn: ${contact.linkedin.value}` },
  { icon: Instagram, href: contact.instagram.href, label: `Instagram: ${contact.instagram.value}` },
];

// Home's four 56 px round icon links (stacked on desktop, a row on phones). The first, email, copies the address
// and says so in a toast; the others open in a new tab.
export function HeroLinks() {
  const { showToast } = useUi();
  const copyEmail = () => {
    const email = contact.email.value;
    if (!navigator.clipboard) return showToast(email);
    navigator.clipboard.writeText(email).then(
      () => showToast(`Copied ${email}`),
      () => showToast(email)
    );
  };

  return (
    <nav className="hero-links" aria-label="Links">
      <button type="button" className="hlink" aria-label={`Copy my email, ${contact.email.value}`} onClick={copyEmail}>
        <Mail size={24} strokeWidth={1.8} aria-hidden="true" />
      </button>
      {LINKS.map(({ icon, href, label }) => {
        const Icon = icon;
        return (
          <a key={href} className="hlink" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
            <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}
