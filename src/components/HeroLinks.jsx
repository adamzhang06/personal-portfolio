import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { contact } from "@/data/contact";

const LINKS = [
  { icon: Mail, href: contact.email.href, label: `Email ${contact.email.value}`, external: false },
  { icon: Github, href: contact.github.href, label: `GitHub: ${contact.github.value}`, external: true },
  { icon: Linkedin, href: contact.linkedin.href, label: `LinkedIn: ${contact.linkedin.value}`, external: true },
  { icon: Instagram, href: contact.instagram.href, label: `Instagram: ${contact.instagram.value}`, external: true },
];

// Home's four 56 px round icon links (stacked on desktop, a row on phones).
export function HeroLinks() {
  return (
    <nav className="hero-links" aria-label="Links">
      {LINKS.map(({ icon, href, label, external }) => {
        const Icon = icon;
        return (
          <a key={href} className="hlink" href={href} aria-label={label} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}
