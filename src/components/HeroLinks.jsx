import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { useUi } from "@/context/uiContext";
import { contact } from "@/data/contact";

const LINKS = [
  { icon: Github, href: contact.github.href, label: `GitHub: ${contact.github.value}`, tip: "GitHub" },
  { icon: Linkedin, href: contact.linkedin.href, label: `LinkedIn: ${contact.linkedin.value}`, tip: "LinkedIn" },
  { icon: Instagram, href: contact.instagram.href, label: `Instagram: ${contact.instagram.value}`, tip: "Instagram" },
];

// Home's four 56 px round icon links (stacked on desktop, a row on phones). The first, email, copies the address
// and says so in a toast; the others open in a new tab. Each shows a short label beside it on hover or focus (desktop).
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
      <button type="button" className="hlink" data-tip="Copy email" aria-label={`Copy my email, ${contact.email.value}`} onClick={copyEmail}>
        <Mail size={24} strokeWidth={1.8} aria-hidden="true" />
      </button>
      {LINKS.map(({ icon, href, label, tip }) => {
        const Icon = icon;
        return (
          <a key={href} className="hlink" data-tip={tip} href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
            <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}
