import { Button } from "@/components/Button";
import { Camera, Home, Menu, X } from "lucide-react";
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
  PHOTO_SRCS.forEach((src) => {
    new Image().src = src;
  });
}

const navLinks = [
  { href: "/", label: "Home", sectionId: null },
  { href: "/#projects", label: "Projects", sectionId: "projects" },
  { href: "/#experience", label: "Experience", sectionId: "experience" },
  { href: "/#skills", label: "Skills", sectionId: "skills" },
];

function scrollToYear(year) {
  const a = document.getElementById(`year-${year}`);
  const b = document.getElementById(`mobile-year-${year}`);
  const el = a && a.offsetParent !== null ? a : b;
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

const itemBase = "px-4 py-2 text-sm rounded-full transition-colors";
const itemActive = "text-foreground font-medium bg-primary/20";
const itemInactive =
  "text-muted-foreground hover:text-foreground hover:bg-primary/15";

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isOnPhotography = pathname.startsWith("/photography");
  const isOnGallery = pathname === "/photography";

  // 'idle-hidden' | 'entering' | 'visible' | 'exiting'
  const [photoNavState, setPhotoNavState] = useState(
    isOnPhotography ? "visible" : "idle-hidden",
  );
  const prevIsOnPhotography = useRef(isOnPhotography);

  const [activeLink, setActiveLink] = useState("/");
  const [activeYear, setActiveYear] = useState(null);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isDesktopYearDropdownOpen, setIsDesktopYearDropdownOpen] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active nav link by section pixel position (home page only)
  useEffect(() => {
    if (pathname !== "/") {
      setActiveLink(null);
      return;
    }
    const compute = () => {
      const threshold = window.innerHeight * 0.4;
      let active = "/";
      for (const link of navLinks) {
        if (!link.sectionId) continue;
        const el = document.getElementById(link.sectionId);
        if (!el) continue;
        if (el.getBoundingClientRect().top < threshold) active = link.href;
      }
      // const contactEl = document.getElementById("contact");
      // if (
      //   contactEl &&
      //   contactEl.getBoundingClientRect().top < window.innerHeight * 0.5
      // )
      //   active = null;
      setActiveLink(active);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    return () => window.removeEventListener("scroll", compute);
  }, [pathname]);

  // Track active year button by year-label pixel position (gallery page only)
  useEffect(() => {
    if (!isOnGallery) {
      setActiveYear(null);
      return;
    }
    const findYearEl = (year) => {
      const a = document.getElementById(`year-${year}`);
      const b = document.getElementById(`mobile-year-${year}`);
      if (a && a.offsetParent !== null) return a;
      if (b && b.offsetParent !== null) return b;
      return null;
    };
    const compute = () => {
      const threshold = window.innerHeight * 0.5;
      let active = null;
      for (const year of PHOTO_YEARS) {
        const el = findYearEl(year);
        if (!el) continue;
        if (el.getBoundingClientRect().top < threshold) active = year;
      }
      setActiveYear(active);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    return () => window.removeEventListener("scroll", compute);
  }, [isOnGallery]);

  // Only animate when isOnPhotography actually changes — guards against
  // Strict Mode double-invoke and hard reloads firing a spurious exit.
  useEffect(() => {
    if (isOnPhotography === prevIsOnPhotography.current) return;
    prevIsOnPhotography.current = isOnPhotography;
    if (isOnPhotography) {
      setPhotoNavState("entering");
      const t = setTimeout(() => setPhotoNavState("visible"), 350);
      return () => clearTimeout(t);
    } else {
      setPhotoNavState("exiting");
      const t = setTimeout(() => setPhotoNavState("idle-hidden"), 300);
      return () => clearTimeout(t);
    }
  }, [isOnPhotography]);

  // Client-side navigation for home-page anchor links so the exit animation plays
  const handleHomeLink = (href) => (e) => {
    e.preventDefault();
    const hash = href.split("#")[1];
    if (pathname !== "/") {
      navigate("/");
      if (hash)
        setTimeout(
          () =>
            document
              .getElementById(hash)
              ?.scrollIntoView({ behavior: "smooth" }),
          80,
        );
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
      {/* Desktop nav (xl+) — flex-1 on both sides keeps center pill geometrically centered */}
      <nav className="container mx-auto px-6 hidden xl:flex items-center gap-4">
        {/* Left: flex-1 so center pill stays centered */}
        <div className="flex items-center flex-1 min-w-0">
          <a
            href="/"
            className="text-xl font-bold tracking-tight hover:text-primary shrink-0"
          >
            AYZ<span className="text-primary">.</span>
          </a>

          {/* Gallery/Portraits — outer collapses space, inner slides in/out */}
          <div
            className={[
              "flex items-center ml-8 overflow-hidden transition-[max-width] duration-300",
              photoNavState === "idle-hidden" || photoNavState === "exiting"
                ? "max-w-0 pointer-events-none"
                : "max-w-[260px]",
            ].join(" ")}
          >
            <div
              className={[
                "glass rounded-full px-2 py-1 flex items-center gap-1 shrink-0",
                photoNavState === "entering" ? "animate-slide-in-left" : "",
                photoNavState === "exiting" ? "animate-slide-out-right" : "",
              ].join(" ")}
            >
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
          </div>

          {/* Year dropdown — outside overflow-hidden so the panel can escape clipping */}
          {photoNavState !== "idle-hidden" && isOnGallery && (
            <div className="relative ml-2 shrink-0">
              <div className="glass rounded-full px-2 py-1 flex items-center">
                <button
                  onClick={() => setIsDesktopYearDropdownOpen((p) => !p)}
                  className={`${itemBase} flex items-center gap-1.5`}
                >
                  {activeYear ?? PHOTO_YEARS[0]}
                  <span
                    className={`transition-transform duration-200 text-[10px] ${isDesktopYearDropdownOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
              </div>
              {isDesktopYearDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 glass-strong rounded-xl py-1 z-50 min-w-[80px] animate-fade-in">
                  {PHOTO_YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        scrollToYear(year);
                        setIsDesktopYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${activeYear === year ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: nav pill — always visible; slides right on photography pages */}
        <div
          className={[
            "glass rounded-full px-2 py-1 flex items-center gap-1 shrink-0",
            "transition-transform duration-300",
            isOnPhotography ? "translate-x-24" : "",
          ].join(" ")}
        >
          {navLinks.map((link, index) => (
            <Link
              to={link.href}
              key={index}
              onClick={handleHomeLink(link.href)}
              className={`${itemBase} ${activeLink === link.href ? itemActive : itemInactive}`}
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

        {/* Right: Contact Me — flex-1 mirrors left so pill stays centered */}
        <div className="flex items-center justify-end flex-1">
          <Button
            size="sm"
            href="/#contact"
            onClick={handleHomeLink("/#contact")}
          >
            Contact Me
          </Button>
        </div>
      </nav>

      {/* Mobile/tablet nav row (below xl) */}
      <div className="xl:hidden container mx-auto px-4 flex items-center gap-1.5">
        <a
          href="/"
          className="text-xl font-bold tracking-tight hover:text-primary py-3 pr-1 shrink-0"
        >
          AYZ<span className="text-primary">.</span>
        </a>

        {/* Gallery/Portraits pill + Year dropdown — wrapped together so they shrink as a unit */}
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Gallery/Portraits pill — outer collapses space, inner slides in/out */}
          <div
            className={[
              "overflow-hidden transition-[max-width,opacity] duration-300",
              photoNavState === "idle-hidden" || photoNavState === "exiting"
                ? "max-w-0 opacity-0 pointer-events-none"
                : "max-w-[130px] opacity-100",
            ].join(" ")}
          >
            <div
              className={[
                "glass rounded-full px-1 py-0.5 flex items-center gap-0.5 text-[11px] whitespace-nowrap shrink-0",
                photoNavState === "entering" ? "animate-slide-in-left" : "",
                photoNavState === "exiting" ? "animate-slide-out-right" : "",
              ].join(" ")}
            >
              <Link
                to="/photography"
                className={`px-2 py-0.5 rounded-full transition-colors ${isOnGallery ? itemActive : itemInactive}`}
              >
                Gallery
              </Link>
              <Link
                to="/photography/portraits"
                className={`px-2 py-0.5 rounded-full transition-colors ${!isOnGallery ? itemActive : itemInactive}`}
              >
                Portraits
              </Link>
            </div>
          </div>

          {/* Year dropdown — outside overflow-hidden so the dropdown panel can escape */}
          {isOnGallery && photoNavState !== "idle-hidden" && (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsYearDropdownOpen((p) => !p)}
                className={`glass rounded-full px-2 py-0.5 text-[11px] flex items-center gap-0.5 transition-colors whitespace-nowrap ${isYearDropdownOpen ? "text-foreground" : "text-muted-foreground"}`}
              >
                {activeYear ?? PHOTO_YEARS[0]}
                <span
                  className={`transition-transform duration-200 text-[9px] ${isYearDropdownOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>
              {isYearDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 glass-strong rounded-xl py-1 z-[100] min-w-[70px] animate-fade-in">
                  {PHOTO_YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        scrollToYear(year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${activeYear === year ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right icons */}
        <div className="flex items-center ml-auto">
          <Link
            to="/"
            onClick={(e) => {
              handleHomeLink("/")(e);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home size={18} />
          </Link>
          <Link
            to="/photography"
            onMouseEnter={prefetchPhotos}
            onClick={(e) => {
              if (pathname === "/photography") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`p-1.5 transition-colors ${isOnPhotography ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Photography"
          >
            <Camera size={18} />
          </Link>
          <button
            className="p-1.5 text-foreground cursor-pointer"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile/tablet dropdown menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden glass-strong animate-fade-in">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {navLinks
              .filter((link) => link.href !== "/")
              .map((link, index) => (
                <Link
                  to={link.href}
                  key={index}
                  onClick={(e) => {
                    handleHomeLink(link.href)(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-lg text-muted-foreground hover:text-foreground py-2"
                >
                  {link.label}
                </Link>
              ))}
            <Button
              href="/#contact"
              onClick={(e) => {
                handleHomeLink("/#contact")(e);
                setIsMobileMenuOpen(false);
              }}
            >
              Contact Me
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
