import { createFileRoute } from "@tanstack/react-router";

import { PageHero, PageShell } from "@/components/layout/PageShell";
import { BRAND } from "@/lib/brand";

const TITLE = "Privacy Policy — Tuition Wallah";
const DESCRIPTION =
  "How Tuition Wallah collects, uses and protects student and teacher information shared on the platform.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  {
    heading: "Information we collect",
    body: "Name, mobile number, optional email, class, board, subjects, locality and timing preferences from students; and name, contact, qualification, experience, subjects, availability and profile photo from teachers.",
  },
  {
    heading: "How we use it",
    body: "Only to match students with suitable teachers, coordinate tuition, respond to complaints and replacement requests, and share relevant updates about your enquiry.",
  },
  {
    heading: "What we never do",
    body: "We do not sell your data, and we do not publish a student's contact details. A teacher's contact information is shared with a student only when a match is being arranged.",
  },
  {
    heading: "Teacher profile photos",
    body: "Photos are stored in private storage and served through our own image endpoint. Only approved teacher profiles are displayed publicly.",
  },
  {
    heading: "Security",
    body: "Accounts are password protected and every record is protected by row-level access rules, so users can only read their own data. Administrative access is limited to the Tuition Wallah team.",
  },
  {
    heading: "Reviews",
    body: "Reviews you post appear publicly with the name you choose. Our team may hide reviews that are abusive, false or contain personal contact details.",
  },
  {
    heading: "Data removal",
    body: `Write to us or call ${BRAND.phone} to have your account and personal data removed from the platform.`,
  },
];

function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="We keep only what we need to arrange good tuition, and we keep it safe."
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
