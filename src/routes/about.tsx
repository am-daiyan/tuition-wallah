import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartHandshake, ShieldCheck, Sparkles, Target, Users } from "lucide-react";

import { PageHero, PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const TITLE = "About Tuition Wallah — Trusted Home Tuition in Gorakhpur";
const DESCRIPTION =
  "Tuition Wallah connects Class 1–12 students in Gorakhpur with verified, experienced home tutors for CBSE, ICSE and U.P. Board.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    Icon: ShieldCheck,
    title: "Verified teachers only",
    body: "Every tutor is screened for qualification, experience and teaching quality before being listed.",
  },
  {
    Icon: Target,
    title: "Result-oriented teaching",
    body: "Concept clarity, weekly practice and regular assessments so progress is visible every month.",
  },
  {
    Icon: HeartHandshake,
    title: "Free replacement",
    body: "If a teacher isn't the right fit, request a replacement and we arrange a better match.",
  },
  {
    Icon: Users,
    title: "Personal attention",
    body: "One-to-one home tuition means the pace and plan are built around one student — yours.",
  },
];

function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About us"
        title="Education that reaches your doorstep"
        description={`${BRAND.name} is a home-tuition platform built in Gorakhpur to make quality one-to-one teaching accessible for every family, from Class 1 to Class 12.`}
      />

      <section className="container-page grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-muted-foreground">Our story</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Built by teachers, for students who need real attention
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Classrooms move fast. Doubts pile up quietly, and by exam season a student can feel
              far behind — not because they cannot learn, but because nobody had the time to sit
              with them.
            </p>
            <p>
              {BRAND.name} was started to fix exactly that. We maintain a carefully screened panel
              of home tutors across Gorakhpur covering CBSE, ICSE and U.P. Board, and we match each
              student with a teacher who suits their class, subject, budget and schedule.
            </p>
            <p>
              Our team stays involved after the match too — checking progress, collecting feedback,
              handling complaints, and arranging a replacement teacher whenever the fit isn't right.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/find-teacher">Find a teacher</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/become-a-teacher">Teach with us</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-transform hover:-translate-y-1"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-6 rounded-3xl border border-border bg-secondary/40 p-8 sm:grid-cols-3 sm:p-10">
          <div>
            <Sparkles className="size-6 text-gold" />
            <h3 className="mt-3 font-display text-xl font-bold">Our mission</h3>
            <p className="mt-2 text-sm text-muted-foreground">{BRAND.mission}</p>
          </div>
          <div>
            <Award className="size-6 text-gold" />
            <h3 className="mt-3 font-display text-xl font-bold">Our promise</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A qualified, verified and punctual teacher at your home — or a replacement, free of
              cost.
            </p>
          </div>
          <div>
            <Users className="size-6 text-gold" />
            <h3 className="mt-3 font-display text-xl font-bold">Where we work</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {BRAND.address} — serving families across Gorakhpur, plus online tuition anywhere in
              India.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
