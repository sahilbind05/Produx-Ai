import { APP_VERSION } from "./version";

// ─────────────────────────────────────────────────────────────────────────
// LOGO SETUP
//
// The logo is a brain + upward-growth arrow (intelligence + productivity),
// drawn as an inline SVG in the indigo brand colors so it matches the UI
// and stays crisp at any size / in light + dark mode.
//
// To swap in your own image instead:
//   1. Save it (transparent background, cropped tight) to public/logo.png
//   2. Set USE_IMAGE_LOGO = true below.
// ─────────────────────────────────────────────────────────────────────────

const USE_IMAGE_LOGO = true;
const LOGO_SRC = "/logo.png";

const SIZES = {
  sm: { box: "w-7 h-7",   text: "text-sm",   pad: "p-1.5" },
  md: { box: "w-8 h-8",   text: "text-sm",   pad: "p-1.5" },
  lg: { box: "w-10 h-10", text: "text-base", pad: "p-2"   },
  xl: { box: "w-12 h-12", text: "text-lg",   pad: "p-2.5" },
};

// Brain + growth-arrow glyph (white, sits on the gradient/box)
function BrainArrow({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* left brain lobe */}
      <path d="M11.5 5.2c-1.3-1.3-3.6-1-4.4.7-1.7-.1-2.9 1.6-2.2 3.1-1.3.8-1.4 2.7-.2 3.6-.5 1.6.8 3.2 2.5 3.1.4 1.3 1.9 2 3.1 1.3" />
      {/* right brain lobe */}
      <path d="M12.5 5.2c1.3-1.3 3.6-1 4.4.7 1.7-.1 2.9 1.6 2.2 3.1 1.3.8 1.4 2.7.2 3.6" />
      {/* center fold */}
      <path d="M12 5v6.5" />
      {/* upward growth arrow rising out of the brain */}
      <path d="M12 18.8v-6.3" />
      <path d="M9.2 15.3 12 12.5l2.8 2.8" />
    </svg>
  );
}

function LogoMark({ size, light }) {
  const s = SIZES[size] || SIZES.md;

  if (USE_IMAGE_LOGO) {
    return <img src={LOGO_SRC} alt="Produx AI" className={`${s.box} object-contain flex-shrink-0`} />;
  }

  return (
    <div className={`${s.box} ${s.pad} rounded-xl flex items-center justify-center flex-shrink-0 ${light ? "bg-white/20" : "bg-brand-gradient shadow-sm shadow-accent-500/30"}`}>
      <BrainArrow className="w-full h-full text-white" />
    </div>
  );
}

export function Logo({ size = "md", showText = true, className = "" }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} light={false} />
      {showText && (
        <span className={`${s.text} font-semibold text-surface-900 dark:text-surface-100`}>
          Produx AI
        </span>
      )}
    </div>
  );
}

// Light version for dark backgrounds (auth page left panel)
export function LogoLight({ size = "md", showText = true, className = "" }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} light={!USE_IMAGE_LOGO} />
      {showText && (
        <span className={`${s.text} font-medium text-white/80`}>
          Produx AI
        </span>
      )}
    </div>
  );
}

export { APP_VERSION };
