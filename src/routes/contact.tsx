import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { PageHero, PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const TITLE = "Contact Tuition Wallah — Home Tuition Enquiry, Gorakhpur";
const DESCRIPTION =
  "Call or WhatsApp Tuition Wallah for home tuition in Gorakhpur. Share your class, board and subject and we'll match a verified teacher.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title="Talk to us about your tuition needs"
        description="Tell us the class, board, subjects and preferred timing — we usually respond the same day with a matching teacher."
      />

      <section className="container-page grid gap-6 py-16 md:grid-cols-3">
        <a
          href={BRAND.phoneHref}
          className="rounded-3xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Phone className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">Call us</h2>
          <p className="mt-1 text-lg font-semibold text-primary">{BRAND.phone}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Fastest way to reach the admissions desk.
          </p>
        </a>

        <a
          href={BRAND.whatsapp}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-3xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <MessageCircle className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">WhatsApp</h2>
          <p className="mt-1 text-lg font-semibold text-primary">Chat with us</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Send your requirement and get teacher profiles.
          </p>
        </a>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <MapPin className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">Visit us</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{BRAND.address}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 text-gold" /> Mon–Sun · 9:00 AM – 8:00 PM
          </p>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="surface-ink flex flex-col items-start gap-6 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <p className="eyebrow text-gold">Ready to start?</p>
            <h2 className="mt-2 text-2xl font-bold text-ink-foreground sm:text-3xl">
              Post your requirement and we'll do the matching
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
              <Mail className="size-4 text-gold" /> Every enquiry reaches our admin team instantly.
            </p>
          </div>
          <Button asChild size="lg" variant="gold">
            <a href={BRAND.whatsapp} target="_blank" rel="noreferrer noopener">
              Send requirement
            </a>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
