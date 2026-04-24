import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Add photos here — each entry needs a src (path or URL) and an alt description.
// For high-res images, use Cloudinary URLs so they're resized on the fly.
// Example: { src: "https://res.cloudinary.com/your-cloud/image/upload/w_800/photo.jpg", alt: "Description" }
const photos = [
  // { src: "/photos/photo1.jpg", alt: "Description of photo" },
];

export const Photography = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to portfolio
          </Link>

          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Photography
          </p>
          <h1 className="text-4xl font-bold mb-4">
            Through the{" "}
            <span className="font-serif italic font-normal text-primary">
              lens
            </span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            A collection of moments I've captured. Digital and film.
          </p>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className="break-inside-avoid glass rounded-2xl overflow-hidden hover:glow-border transition-all duration-300"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          // Placeholder shown until photos are added
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl aspect-[4/3] flex items-center justify-center text-muted-foreground/40"
              >
                <span className="text-sm">Photo {idx + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
