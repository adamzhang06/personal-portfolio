import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/photography", label: "Gallery" },
  { to: "/photography/portraits", label: "Portraits" },
];

export const PhotographySubNav = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex items-center gap-6 mt-6 animate-fade-in animation-delay-400">
      {links.map(({ to, label }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`text-sm tracking-wide transition-colors pb-0.5 ${
              active
                ? "text-foreground font-medium border-b border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
};
