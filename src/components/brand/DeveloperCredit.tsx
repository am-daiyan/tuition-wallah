import { Linkedin, Mail, MessageCircle, Phone, Sparkles, X } from "lucide-react";
import { useState } from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";

const DEV = {
  name: "Daiyan Ali Abbas",
  role: "Full-Stack Web Designer & Developer",
  phone: "8601235074",
  phoneHref: "tel:+918601235074",
  whatsapp: "https://wa.me/918601235074",
  email: "daiyan.ali143@gmail.com",
  linkedin: "https://www.linkedin.com/in/daiyan-ali-abbas-84574036b",
};

const LINKS = [
  { label: "WhatsApp", value: DEV.phone, href: DEV.whatsapp, Icon: MessageCircle, external: true },
  { label: "Email", value: DEV.email, href: `mailto:${DEV.email}`, Icon: Mail, external: false },
  { label: "LinkedIn", value: "daiyan-ali-abbas", href: DEV.linkedin, Icon: Linkedin, external: true },
];

export function DeveloperCredit() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] tracking-[0.12em] text-ink-muted uppercase transition-all duration-300 hover:border-gold/60 hover:bg-white/10 hover:text-ink-foreground"
      >
        <Sparkles className="size-3.5 text-gold transition-transform duration-300 group-hover:rotate-12" />
        <span>
          Designed &amp; Developed by{" "}
          <span className="font-semibold text-gold">{DEV.name}</span>
        </span>
      </button>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#050b18]/80 backdrop-blur-md duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#0c1830] text-ink-foreground shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2">
          <DialogPrimitive.Title className="sr-only">{DEV.name} — Developer profile</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Contact details for the designer and developer of this website.
          </DialogPrimitive.Description>

          {/* Ambient gold glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -right-16 size-56 rounded-full bg-primary/40 blur-3xl"
          />

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close developer profile"
            className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ink-foreground/80 backdrop-blur transition-all duration-300 hover:rotate-90 hover:border-gold/60 hover:text-gold"
          >
            <X className="size-4" />
          </button>

          <div className="relative z-10 px-6 pt-10 pb-7 text-center sm:px-8">
            <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-gold via-amber-300 to-gold p-[2px] shadow-[0_0_40px_-8px_rgba(240,192,64,0.7)]">
              <div className="flex size-full items-center justify-center rounded-full bg-[#0c1830]">
                <span className="font-display text-3xl font-extrabold tracking-tight text-gold">
                  DA
                </span>
              </div>
            </div>

            <p className="mt-6 text-[10px] font-semibold tracking-[0.32em] text-gold uppercase">
              Digital Signature
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              {DEV.name}
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">{DEV.role}</p>

            <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />

            <a
              href={DEV.phoneHref}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold tracking-wide transition-colors hover:border-gold/60 hover:text-gold"
            >
              <Phone className="size-4 text-gold" /> {DEV.phone}
            </a>

            <div className="mt-6 space-y-2.5 text-left">
              {LINKS.map(({ label, value, href, Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/[0.08]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold transition-colors group-hover:bg-gold group-hover:text-[#0c1830]">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold tracking-[0.18em] text-ink-muted uppercase">
                      {label}
                    </span>
                    <span className="block truncate text-sm font-medium">{value}</span>
                  </span>
                </a>
              ))}
            </div>

            <p className="mt-6 text-[10px] tracking-[0.22em] text-ink-muted/70 uppercase">
              Crafted with precision · 2026
            </p>
          </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
