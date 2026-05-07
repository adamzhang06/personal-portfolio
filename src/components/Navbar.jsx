import { Button } from "@/components/Button";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PHOTO_YEARS } from "@/data/photoYears";

// Keep in sync with linked srcs in Photography.jsx
const PHOTO_SRCS = [
  "/photos/gallery/3955912_3955912-R1-076-36A.jpg",
  "/photos/gallery/000044400015.jpg",
  "/photos/gallery/AYZ_7313.jpg",
  "/photos/gallery/AYZ_0315.JPG",
  "/photos/gallery/AYZ_0111.JPG",
  "/photos/gallery/AYZ_0090.JPG",
  "/photos/gallery/AYZ_8259.jpg",
  "/photos/gallery/000016520031.jpg",
];

let photoPrefetchDone = false;
function prefetchPhotos() {
  if (photoPrefetchDone) return;
  photoPrefetchDone = true;
  PHOTO_SRCS.forEach((src) => { new Image().src = src; });
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
];

const itemBase = "px-4 py-2 text-sm rounded-full transition-colors";
const itemActive = "text-foreground font-medium bg-primary/20";
const itemInactive = "text-muted-foreground hover:text-foreground hover:bg-primary/15";

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isOnPhotography = pathname.startsWith("/photography");
  const isOnGallery = pathname === "/photography";

  // 'idle-hidden' | 'entering' | 'visible' | 'exiting'
  const [photoNavState, setPhotoNavState] = useState(isOnPhotography ? "visible" : "idle-hidden");
  const prevIsOnPhotography = useRef(isOnPhotography);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only animate when isOnPhotography actually changes — guards against
  // Strict Mode double-invoke and hard reloads firing a spurious exit.
  useEffect(() => {
    if (isOnPhotography === prevIsOnPhotography.current) return;
    prevIsOnPhotography.current = isOnPhotography;
    let t;
    if (isOnPhotography) {
      setPhotoNavState("entering");
      t = setTimeout(() => setPhotoNavState("visible"), 350);
    } else {
      setPhotoNavState("exiting");
      t = setTimeout(() => setPhotoNavState("idle-hidden"), 200);
    }
    return () => clearTimeout(t);
  }, [isOnPhotography]);

  // Client-side navigation for home-page anchor links so the exit animation plays
  const handleHomeLink = (href) => (e) => {
    e.preventDefault();
    const hash = href.split("#")[1];
    if (pathname !== "/") {
      navigate("/");
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 80);
    } else if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 transition-all duration-500 ${
        isScrolled ? "glass-strong py-3" : "bg-transparent py-5"
      } z-50`}
    >
      {/* Desktop nav — relative so center pill can be absolutely placed */}
      <nav className="container mx-auto px-6 relative hidden md:flex items-center">

        {/* Left: logo + photo sub-nav */}
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold tracking-tight hover:text-primary shrink-0">
            AYZ<span className="text-primary">.</span>
          </Link>

          {/* Photo pills — state machine drives entry/exit animations */}
          <div
            className={[
              "flex items-center gap-2 ml-8 overflow-hidden",
              photoNavState === "idle-hidden" ? "max-w-0 pointer-events-none" : "max-w-[700px]",
              photoNavState === "entering"    ? "animate-slide-in-left"   : "",
              photoNavState === "exiting"     ? "animate-slide-out-right pointer-events-none" : "",
            ].join(" ")}
          >
            {/* Gallery / Portraits pill */}
            <div className="glass rounded-full px-2 py-1 flex items-center gap-1 shrink-0">
              <Link
                to="/photography"
                className={`${itemBase} ${isOnGallery ? itemActive : itemInactive}`}
              >
                Gallery
              </Link>
              <Link
                to="/photography/portraits"
                className={`${itemBase} ${!isOnGallery ? itemActive : itemInactive}`}
              >
                Portraits
              </Link>
            </div>

            {/* Year jump pill — opacity/translate only; stays full-width so both pages keep
                the same left-group width and the center pill position stays consistent */}
            <div
              className={`glass rounded-full px-2 py-1 flex items-center gap-1 shrink-0 transition-all duration-300 ${
                isOnGallery
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              }`}
            >
              {PHOTO_YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    const el = document.getElementById(`year-${year}`);
                    if (!el) return;
                    const top = el.getBoundingClientRect().top + window.scrollY - 88;
                    window.scrollTo({ top, behavior: "smooth" });
                  }}
                  className={`${itemBase} ${itemInactive}`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: main nav pill — absolutely centered, shifts right on photography pages */}
        <div
          className="absolute left-1/2 flex items-center gap-1 transition-[transform] duration-300 ease-in-out"
          style={{ transform: isOnPhotography ? "translateX(calc(-50% + 300px))" : "translateX(-50%)" }}
        >
          <div className="glass rounded-full px-2 py-1 flex items-center gap-1">
            {navLinks.map((link, index) => (
              <Link
                to={link.href}
                key={index}
                onClick={handleHomeLink(link.href)}
                className={`${itemBase} ${itemInactive}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/photography"
              onMouseEnter={prefetchPhotos}
              onClick={(e) => {
                if (pathname === "/photography") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`${itemBase} ${isOnPhotography ? itemActive : itemInactive}`}
            >
              Photography
            </Link>
          </div>
        </div>

        {/* Right: CTA — pinned to the right */}
        <div className="ml-auto">
          <Button size="sm" href="/#contact" onClick={handleHomeLink("/#contact")}>Contact Me</Button>
        </div>
      </nav>

      {/* Mobile nav row */}
      <div className="md:hidden container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-primary">
          AYZ<span className="text-primary">.</span>
        </Link>
        <button
          className="p-2 text-foreground cursor-pointer"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-strong animate-fade-in">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link, index) => (
              <Link
                to={link.href}
                key={index}
                onClick={(e) => { handleHomeLink(link.href)(e); setIsMobileMenuOpen(false); }}
                className="text-lg text-muted-foreground hover:text-foreground py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/photography"
              onMouseEnter={prefetchPhotos}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg text-muted-foreground hover:text-foreground py-2"
            >
              Photography
            </Link>
            <Button href="/#contact" onClick={(e) => { handleHomeLink("/#contact")(e); setIsMobileMenuOpen(false); }}>Contact Me</Button>
          </div>
        </div>
      )}
    </header>
  );
};
