import { createFileRoute } from "@tanstack/react-router";

import { PageHero, PageShell } from "@/components/layout/PageShell";
import { BRAND } from "@/lib/brand";

const TITLE = "Terms & Conditions — Tuition Wallah";
const DESCRIPTION =
  "Terms of use for students and teachers on the Tuition Wallah home-tuition platform.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: TermsPage,
});

const SECTIONS = [
  {
    heading: "Our role",
    body: `${BRAND.name} is a matching platform. We screen and recommend home tutors; the teaching relationship runs between the student's family and the teacher.`,
  },
  {
    heading: "Teacher verification",
    body: "Teachers must provide accurate qualification and experience details. Applications are reviewed before approval, and false information leads to removal from the panel.",
  },
  {
    heading: "Demo and replacement",
    body: "A demo class may be arranged before regular tuition begins. If the teacher is not suitable, a student may request a replacement through their dashboard and we will arrange an alternative teacher.",
  },
  {
    heading: "Fees",
    body: "Tuition fees are agreed between the family and the teacher based on class, subjects and number of sessions. Any platform charges are communicated in advance.",
  },
  {
    heading: "Conduct",
    body: "Punctuality, respectful behaviour and academic honesty are expected from both sides. Teachers must not share student information with third parties.",
  },
  {
    heading: "Complaints",
    body: "Complaints raised through the platform are reviewed by our admin team, and we respond with a resolution or a replacement teacher.",
  },
  {
    heading: "Changes",
    body: "These terms may be updated as the service evolves. Continued use of the platform means you accept the current terms.",
  },
];

function TermsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="The ground rules that keep tuition fair for students, families and teachers."
      />
      <section className="container-page max-w-3xl py-16">
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-xl font-bold">{section.heading}</h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
