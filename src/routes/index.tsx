import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  GraduationCap,
  Home,
  Laptop,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TeacherCard } from "@/components/teachers/TeacherCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, BOARDS, CLASSES, SUBJECTS } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tuition Wallah — Home Tuition Teachers in Gorakhpur" },
      {
        name: "description",
        content:
          "Tuition Wallah connects students in Gorakhpur with verified home and online tuition teachers for Class 1-12, CBSE, ICSE and U.P. Board.",
      },
      { property: "og:title", content: "Tuition Wallah — Find the Right Tutor" },
      {
        property: "og:description",
        content:
          "Verified home tuition teachers for Class 1-12 across CBSE, ICSE and U.P. Board. Your success is our mission.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = useQuery({
    queryKey: ["featured-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers_public")
        .select(
          "id, full_name, qualification, experience_years, subjects, classes, boards, location, teaching_modes, photo_path, rating, review_count, verified",
        )
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as TeacherCardData[];
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO */}
        <section className="surface-ink relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-gold/15 blur-3xl" />
          <div className="container-page relative grid gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-gold uppercase">
                <Sparkles className="size-3.5" /> {BRAND.mission}
              </span>
              <h1 className="mt-6 font-display text-4xl leading-[1.05] font-extrabold text-ink-foreground sm:text-5xl lg:text-6xl">
                Find the Right Tutor,
                <span className="block text-gold">Build a Better Future.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-ink-muted">
                Verified home and online tuition teachers for Class 1 to 12 — CBSE, ICSE and U.P.
                Board. Trusted by families across {BRAND.address.split(",").pop()?.trim()}.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="xl">
                  <Link to="/find-teacher">
                    <Search className="size-5" /> Find a teacher
                  </Link>
                </Button>
                <Button asChild variant="hero" size="xl">
                  <Link to="/become-a-teacher">
                    <GraduationCap className="size-5" /> Become a teacher
                  </Link>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[
                  { k: "Verified", v: "Teachers" },
                  { k: "1–12", v: "All classes" },
                  { k: "3 Boards", v: "CBSE·ICSE·UP" },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="font-display text-2xl font-extrabold text-gold">{s.k}</dt>
                    <dd className="text-sm text-ink-muted">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl border border-white/12 bg-white/5 p-6 backdrop-blur sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink-foreground">
                Tell us what you need
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Post your requirement and our team matches you with the right teacher — usually
                within 48 hours.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Share your class, board and subjects",
                  "We shortlist verified teachers near you",
                  "Start classes at home or online",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-ink-foreground">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
              <Button asChild variant="gold" size="lg" className="mt-7 w-full">
                <Link to="/post-requirement">
                  Post your requirement <ArrowRight className="size-4" />
                </Link>
              </Button>
              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-gold"
              >
                <MessageCircle className="size-4" /> Or chat with us on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section className="container-page py-20">
          <SectionHeading
            eyebrow="Why Tuition Wallah"
            title="Tuition that parents can trust"
            description="Every teacher is screened, interviewed and verified before they reach your doorstep."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Verified teachers",
                text: "ID, qualification and experience checked by our team before approval.",
              },
              {
                icon: MapPin,
                title: "Near your home",
                text: "Locality-based matching so classes stay convenient and regular.",
              },
              {
                icon: RefreshCw,
                title: "Free replacement",
                text: "Not the right fit? Request a replacement teacher any time.",
              },
              {
                icon: UserCheck,
                title: "Personal support",
                text: "A real person on call to resolve complaints and scheduling issues.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-gold/15 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="How it works"
              title="Three steps to the right teacher"
              description="No hunting, no guesswork — we do the matching for you."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: ClipboardList,
                  title: "Post your requirement",
                  text: "Tell us the class, board, subjects, preferred days and timing.",
                },
                {
                  icon: BadgeCheck,
                  title: "We match a verified teacher",
                  text: "Our team shortlists the best fit from approved teachers near you.",
                },
                {
                  icon: Home,
                  title: "Start learning",
                  text: "Classes begin at your home or online — track everything in your dashboard.",
                },
              ].map((s, i) => (
                <div key={s.title} className="rounded-3xl border border-border bg-card p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <s.icon className="size-5 text-gold" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED TEACHERS */}
        <section className="container-page py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              align="left"
              eyebrow="Our teachers"
              title="Top-rated teachers"
              description="A glimpse of the verified teachers currently taking students."
            />
            <Button asChild variant="outline">
              <Link to="/find-teacher">
                Browse all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          {(featured.data ?? []).length === 0 ? (
            <p className="mt-10 rounded-3xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Our teacher directory is being verified right now. Post your requirement and we'll
              match you personally.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(featured.data ?? []).map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          )}
        </section>

        {/* SUBJECTS & CLASSES */}
        <section className="bg-secondary/50 py-20">
          <div className="container-page grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-extrabold">Subjects we cover</h2>
              <p className="mt-3 text-muted-foreground">
                From primary basics to board exam preparation.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display text-3xl font-extrabold">Classes & boards</h2>
              <p className="mt-3 text-muted-foreground">
                {BOARDS.join(" · ")} — taught the way your school teaches.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {CLASSES.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold">
                  <Home className="size-4 text-gold" /> Home tuition
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold">
                  <Laptop className="size-4 text-gold" /> Online classes
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* PARENT PROMISE */}
        <section className="container-page py-20">
          <SectionHeading
            eyebrow="Our promise"
            title="What every family gets"
            description="Tuition Wallah stays involved long after the first class."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Star,
                title: "Rate your teacher",
                text: "Honest reviews from real students keep our quality bar high.",
              },
              {
                icon: RefreshCw,
                title: "Replacement on request",
                text: "Ask for a different teacher and we'll arrange one quickly.",
              },
              {
                icon: MessageCircle,
                title: "Complaints resolved",
                text: "Every complaint is tracked by our admin team until it's closed.",
              },
            ].map((p) => (
              <div key={p.title} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
                <p.icon className="size-6 text-gold" />
                <h3 className="mt-5 font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container-page pb-24">
          <div className="surface-ink relative overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-14">
            <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-gold/15 blur-3xl" />
            <h2 className="relative font-display text-3xl font-extrabold text-ink-foreground sm:text-4xl">
              Ready to start tuition?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-ink-muted">
              Register in a minute, post your requirement, and let our team find the right teacher
              for your child.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold" size="xl">
                <Link to="/register">Register as a student</Link>
              </Button>
              <Button asChild variant="hero" size="xl">
                <a href={BRAND.phoneHref}>
                  <Phone className="size-5" /> Call {BRAND.phone}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-bold tracking-[0.18em] text-gold uppercase">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
