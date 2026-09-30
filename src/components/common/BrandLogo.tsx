import { cn } from "@/lib/cn";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
  showTagline?: boolean;
  /** Jika true, tampilkan gambar logo lengkap (logo.png) langsung sebagai <img> */
  useFullLogo?: boolean;
}

/**
 * Komponen BrandLogo resmi Buwuh.com
 * Menampilkan ikon amplop kado dan tipografi buwuh.com dengan tagline 'Klik • Sebar • Catat'
 * Gunakan prop `useFullLogo` untuk menampilkan logo PNG lengkap.
 */
export function BrandLogo({
  className,
  size = "md",
  variant = "default",
  showTagline = true,
  useFullLogo = false,
}: BrandLogoProps) {
  const fullLogoHeights = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
    xl: "h-18",
  };

  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const titleSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl tracking-tight",
    xl: "text-3xl tracking-tight",
  };

  const taglineSizes = {
    sm: "text-[9px] tracking-wider",
    md: "text-[11px] tracking-wide",
    lg: "text-xs tracking-wider",
    xl: "text-sm tracking-wider",
  };

  const isLight = variant === "light";

  // Mode logo lengkap: tampilkan gambar PNG resmi buwuh.com
  if (useFullLogo) {
    return (
      <img
        src="/images/logo.png"
        alt="buwuh.com – Klik • Sebar • Catat"
        className={cn("object-contain w-auto select-none", fullLogoHeights[size], className)}
      />
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Icon Image: Envelope Gift Box */}
      <div className={cn("shrink-0 relative flex items-center justify-center", iconSizes[size])}>
        <img
          src="/favicon.png"
          alt="Buwuh.com Icon"
          className="w-full h-full object-contain drop-shadow-2xs"
        />
      </div>

      {/* Brand Typography & Tagline */}
      <div className="flex flex-col justify-center leading-none">
        <div
          className={cn(
            "font-bold font-body flex items-baseline leading-none",
            titleSizes[size],
            isLight ? "text-white" : "text-[#0B357B]"
          )}
        >
          {/* Custom styled 'b' with golden accent leaf element */}
          <span className="relative inline-block">
            b
            <span
              className="absolute left-[3px] top-[7px] w-2 h-2.5 rounded-br-full rounded-tl-full bg-gradient-to-tr from-amber-500 to-amber-400 pointer-events-none opacity-90"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                transform: "rotate(15deg) scale(0.65)",
              }}
            />
          </span>
          <span>uwuh</span>
          <span className={isLight ? "text-amber-300" : "text-[#0B357B]"}>.com</span>
        </div>

        {showTagline && (
          <div
            className={cn(
              "font-medium italic tracking-wide mt-1",
              taglineSizes[size],
              isLight ? "text-slate-300" : "text-slate-600"
            )}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Klik <span className="mx-0.5 text-amber-500 font-bold">•</span> Sebar{" "}
            <span className="mx-0.5 text-amber-500 font-bold">•</span> Catat
          </div>
        )}
      </div>
    </div>
  );
}
