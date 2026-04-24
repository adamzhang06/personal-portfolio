import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/Button";

const links = [
  {
    icon: Mail,
    label: "Email",
    href: "mailto:reachadamzhang@gmail.com",
    display: "reachadamzhang@gmail.com",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/adamzhang06",
    display: "github.com/adamzhang06",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/adam-zhang-8b2b44382/",
    display: "linkedin.com/in/adam-zhang",
  },
];

export const Contact = () => {
  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-6 max-w-2xl text-center">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
          Contact
        </p>
        <h2 className="text-4xl font-bold mb-4">Let's connect</h2>
        <p className="text-muted-foreground mb-12">
          Whether it's a project, internship, or just a chat — I'm always open
          to new conversations.
        </p>

        <div className="space-y-4 mb-12">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl px-6 py-4 flex items-center gap-4 hover:glow-border transition-all duration-300 group"
            >
              <link.icon className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-medium">{link.label}</span>
              <span className="text-sm text-muted-foreground ml-auto group-hover:text-foreground transition-colors">
                {link.display}
              </span>
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Adam Zhang · Built with React & Tailwind
        </p>
      </div>
    </section>
  );
};
