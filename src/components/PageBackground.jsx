export const PageBackground = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <img
      src="/assets/compressed/hero-bg.jpg"
      alt=""
      className="w-full h-full object-cover opacity-80"
    />
    <div className="absolute inset-0 bg-background/75" />
  </div>
);
