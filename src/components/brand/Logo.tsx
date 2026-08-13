import { Link } from "@tanstack/react-router";

import logoAsset from "@/assets/tuition-wallah-logo.svg.asset.json";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt={`${BRAND.name} logo`}
      className={cn("h-10 w-auto object-contain", className)}
      width={160}
      height={107}
    />
  );
}

export function Logo({
  className,
  tone = "default",
  to = "/",
}: {
  className?: string;
  tone?: "default" | "inverted";
  to?: string;
}) {
  return (
    <Link to={to} className={cn("group flex items-center gap-2.5", className)} aria-label={BRAND.name}>
      <LogoMark className="h-9 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-11" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-base font-extrabold tracking-tight sm:text-lg",
            tone === "inverted" ? "text-ink-foreground" : "text-primary",
          )}
        >
          TUITION WALLAH
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
            tone === "inverted" ? "text-gold" : "text-muted-foreground",
          )}
        >
          Home Tuition
        </span>
      </span>
    </Link>
  );
}
