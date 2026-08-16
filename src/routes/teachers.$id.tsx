import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  MessageSquare,
  Star,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, teacherPhotoUrl } from "@/lib/brand";

export const Route = createFileRoute("/teachers/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("teachers")
      .select("full_name, qualification, subjects, location, experience_years, rating, review_count")
      .eq("id", params.id)
      .eq("status", "approved")
      .maybeSingle();
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating, comment, author_name, created_at")
      .eq("teacher_id", params.id)
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(5);
    return { seo: data, seoReviews: reviews ?? [] };
  },

  head: ({ params, loaderData }) => {
    const t = loaderData?.seo;
    const url = `https://tuition-wallah.lovable.app/teachers/${params.id}`;
    if (!t) {
      const title = "Teacher Profile — Tuition Wallah";
      const description =
        "View a verified Tuition Wallah tutor's qualification, subjects, classes, availability and student reviews.";
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:type", content: "profile" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const subjects = (t.subjects ?? []).slice(0, 3).join(", ");
    const place = t.location ? ` in ${t.location}` : "";
    const title = `${t.full_name} — ${subjects || "Home"} Tutor${place} | Tuition Wallah`;
    const description = `${t.full_name}, ${t.qualification ?? "verified tutor"} with ${
      t.experience_years ?? 0
    } years of experience${place}. Teaches ${subjects || "multiple subjects"}. Rated ${
      t.rating ?? 0
    }/5 from ${t.review_count ?? 0} student reviews.`;

    const ratingBlock =
      (t.review_count ?? 0) > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: t.rating,
              reviewCount: t.review_count,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {};

    const reviewList = (loaderData?.seoReviews ?? []).filter((r) => r.rating != null);
    const reviewBlock =
      reviewList.length > 0
        ? {
            review: reviewList.map((r) => ({
              "@type": "Review",
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
              author: { "@type": "Person", name: r.author_name || "Student" },
              ...(r.comment ? { reviewBody: r.comment } : {}),
              ...(r.created_at ? { datePublished: String(r.created_at).slice(0, 10) } : {}),
            })),
          }
        : {};


    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: t.full_name,
            jobTitle: "Home Tuition Teacher",
            description,
            url,
            knowsAbout: t.subjects ?? [],
            ...(t.qualification
              ? { hasCredential: { "@type": "EducationalOccupationalCredential", name: t.qualification } }
              : {}),
            ...(t.location ? { address: { "@type": "PostalAddress", addressLocality: t.location } } : {}),
            worksFor: { "@type": "Organization", name: "Tuition Wallah" },
            ...ratingBlock,
            ...reviewBlock,

          }),
        },
      ],
    };
  },
  component: TeacherProfilePage,
});


function TeacherProfilePage() {
  const { id } = Route.useParams();

  const teacherQuery = useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ["teacher-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, author_name, created_at")
        .eq("teacher_id", id)
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const teacher = teacherQuery.data;

  if (teacherQuery.isLoading) {
    return (
      <PageShell>
        <div className="container-page space-y-6 py-16">
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </PageShell>
    );
  }

  if (!teacher) {
    return (
      <PageShell>
        <div className="container-page py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Teacher not available</h1>
          <p className="mt-3 text-muted-foreground">
            This profile may have been removed or is awaiting approval.
          </p>
          <Button asChild variant="gold" className="mt-6">
            <Link to="/find-teacher">Browse other teachers</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const photo = teacherPhotoUrl(teacher.photo_path);
  const reviews = reviewsQuery.data ?? [];

  return (
    <PageShell>
      <section className="surface-ink">
        <div className="container-page flex flex-col gap-7 py-14 sm:flex-row sm:items-center">
          <div className="size-32 shrink-0 overflow-hidden rounded-3xl border border-white/15 bg-white/10">
            {photo ? (
              <img src={photo} alt={teacher.full_name} className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center font-display text-3xl font-bold text-gold">
                {teacher.full_name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold text-ink-foreground sm:text-4xl">
                {teacher.full_name}
              </h1>
              {teacher.verified ? (
                <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-primary">
                  <BadgeCheck className="size-3.5" /> Verified
                </span>
              ) : null}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="size-4 text-gold" /> {teacher.qualification}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-gold" /> {teacher.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-gold" /> {teacher.experience_years} years experience
              </span>
            </p>
            <p className="mt-3 flex items-center gap-2 text-ink-foreground">
              <Star className="size-5 fill-gold text-gold" />
              <span className="font-display text-lg font-bold">
                {Number(teacher.rating).toFixed(1)}
              </span>
              <span className="text-sm text-ink-muted">({teacher.review_count} reviews)</span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/post-requirement">Request this teacher</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={BRAND.phoneHref}>Call {BRAND.phone}</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {teacher.bio ? (
            <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <h2 className="font-display text-xl font-bold">About the teacher</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-muted-foreground">
                {teacher.bio}
              </p>
            </div>
          ) : null}

          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <h2 className="font-display text-xl font-bold">Teaching details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <DetailList label="Subjects" items={teacher.subjects} />
              <DetailList label="Classes" items={teacher.classes} />
              <DetailList label="Boards" items={teacher.boards} />
              <DetailList label="Mode" items={teacher.teaching_modes} />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <MessageSquare className="size-5 text-gold" /> Student reviews
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No reviews yet. Be the first to share your experience after your classes begin.
              </p>
            ) : (
              <ul className="mt-5 space-y-5">
                {reviews.map((review) => (
                  <li key={review.id} className="border-b border-border pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{review.author_name || "Student"}</p>
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        <Star className="size-4 fill-gold text-gold" /> {review.rating}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-secondary/40 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <CalendarDays className="size-5 text-gold" /> Availability
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {teacher.available_days.length > 0 ? (
                teacher.available_days.map((d) => (
                  <Badge key={d} variant="secondary" className="rounded-full">
                    {d}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Flexible</span>
              )}
            </div>
            {teacher.available_from || teacher.available_to ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {teacher.available_from ?? "—"} to {teacher.available_to ?? "—"}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">How to book</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Post your requirement mentioning this teacher and our team arranges a demo class.
            </p>
            <Button asChild variant="gold" className="mt-4 w-full">
              <Link to="/post-requirement">Post requirement</Link>
            </Button>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length > 0 ? (
          items.map((item) => (
            <Badge key={item} variant="secondary" className="rounded-full">
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}
