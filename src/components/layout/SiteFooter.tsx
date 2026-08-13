import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";

import { LogoMark } from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

const SOCIALS = [
  { href: BRAND.social.whatsapp, label: "WhatsApp", Icon: MessageCircle },
  { href: BRAND.social.instagram, label: "Instagram", Icon: Instagram },
  { href: BRAND.social.facebook, label: "Facebook", Icon: Facebook },
  { href: BRAND.social.youtube, label: "YouTube", Icon: Youtube },
];

export function SiteFooter() {
  return (
    <footer className="surface-ink mt-24">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12" />
            <div>
              <p className="font-display text-lg font-extrabold text-ink-foreground">
                TUITION WALLAH
              </p>
              <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
                Home Tuition · Class 1–12
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
            {BRAND.tagline} Experienced teachers, concept clarity, regular assessment and personal
            attention for CBSE, ICSE and U.P. Board students in Gorakhpur.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-full border border-white/15 text-ink-foreground transition-all hover:border-gold hover:text-gold"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-gold">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li>
              <Link to="/find-teacher" className="transition-colors hover:text-ink-foreground">
                Find a Teacher
              </Link>
            </li>
            <li>
              <Link to="/become-a-teacher" className="transition-colors hover:text-ink-foreground">
                Become a Teacher
              </Link>
            </li>
            <li>
              <Link to="/register" className="transition-colors hover:text-ink-foreground">
                Register
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition-colors hover:text-ink-foreground">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-ink-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold">Reach us</p>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li>
              <a
                href={BRAND.phoneHref}
                className="flex items-start gap-2 transition-colors hover:text-ink-foreground"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" /> {BRAND.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" /> {BRAND.address}
            </li>
          </ul>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-muted">
            <li>
              <Link to="/privacy" className="transition-colors hover:text-ink-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-ink-foreground">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-xs font-bold tracking-[0.22em] text-gold uppercase">{BRAND.mission}</p>
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} {BRAND.nameUpper}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
