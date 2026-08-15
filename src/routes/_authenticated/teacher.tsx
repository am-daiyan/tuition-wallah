import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Clock, Pencil, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ChipGroup, Field } from "@/components/form/Fields";
import { PageHero, PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DAYS, STATUS_LABEL, SUBJECTS, teacherPhotoUrl } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard — Tuition Wallah" },
      {
        name: "description",
        content:
          "Check your application status, update your teaching profile and view assigned tuitions.",
      },
      { property: "og:title", content: "Teacher Dashboard — Tuition Wallah" },
      { property: "og:description", content: "Manage your Tuition Wallah teaching profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeacherDashboard,
});

type Assignment = {
  id: string;
  subjects: string[];
  days: string[];
  time_slot: string | null;
  teaching_mode: string;
  status: string;
};

function TeacherDashboard() {
  const { user, profile } = useAuth();

  const teacherQuery = useQuery({
    queryKey: ["my-teacher-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("profile_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const assignments = useQuery({
    queryKey: ["teacher-assignments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tuition_assignments")
        .select("id, subjects, days, time_slot, teaching_mode, status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Assignment[];
    },
  });

  const teacher = teacherQuery.data;

  const [bio, setBio] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    setBio(teacher.bio ?? "");
    setAvailableFrom(teacher.available_from ?? "");
    setAvailableTo(teacher.available_to ?? "");
    setDays(teacher.available_days ?? []);
    setSubjects(teacher.subjects ?? []);
  }, [teacher]);

  async function saveProfile() {
    if (!teacher) return;
    setSaving(true);
    const { error } = await supabase
      .from("teachers")
      .update({
        bio: bio || null,
        available_from: availableFrom || null,
        available_to: availableTo || null,
        available_days: days,
        subjects,
      })
      .eq("id", teacher.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    toast.success("Profile updated.");
    void teacherQuery.refetch();
  }

  if (teacherQuery.isLoading) {
    return (
      <PageShell>
        <div className="container-page space-y-6 py-16">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-60 rounded-3xl" />
        </div>
      </PageShell>
    );
  }

  if (!teacher) {
    return (
      <PageShell>
        <div className="container-page py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">No teacher profile found</h1>
          <p className="mt-3 text-muted-foreground">
            This account isn't registered as a teacher yet.
          </p>
          <Button asChild variant="gold" className="mt-6">
            <Link to="/become-a-teacher">Apply as a teacher</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const photo = teacherPhotoUrl(teacher.photo_path);

  return (
    <PageShell>
      <PageHero
        eyebrow="Teacher dashboard"
        title={`Namaste, ${profile?.full_name?.split(" ")[0] ?? teacher.full_name}`}
        description="Keep your availability current — approved profiles with complete details get matched faster."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-primary">
            Status: {STATUS_LABEL[teacher.status] ?? teacher.status}
          </span>
          {teacher.verified ? (
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-ink-foreground">
              <CheckCircle2 className="size-4 text-gold" /> Verified teacher
            </span>
          ) : null}
        </div>
      </PageHero>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <Pencil className="size-5 text-gold" /> Edit your profile
            </h2>
            <div className="mt-6 space-y-6">
              <Field label="Subjects you teach">
                <ChipGroup options={SUBJECTS} value={subjects} onChange={setSubjects} />
              </Field>
              <Field label="Available days">
                <ChipGroup options={DAYS} value={days} onChange={setDays} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Available from" htmlFor="from">
                  <Input
                    id="from"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    placeholder="4 PM"
                  />
                </Field>
                <Field label="Available to" htmlFor="to">
                  <Input
                    id="to"
                    value={availableTo}
                    onChange={(e) => setAvailableTo(e.target.value)}
                    placeholder="8 PM"
                  />
                </Field>
              </div>
              <Field label="About you" htmlFor="bio">
                <Textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
              </Field>
              <Button variant="gold" disabled={saving} onClick={saveProfile}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <BookOpen className="size-5 text-gold" /> Assigned tuitions
            </h2>
            {(assignments.data ?? []).length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No tuitions assigned yet. Our team assigns students once your profile is approved.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {(assignments.data ?? []).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
                  >
                    <div>
                      <p className="font-semibold">{a.subjects.join(", ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.days.join(", ")} · {a.time_slot ?? "Time TBD"} · {a.teaching_mode}
                      </p>
                    </div>
                    <Badge variant="secondary">{STATUS_LABEL[a.status] ?? a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
            <div className="mx-auto size-24 overflow-hidden rounded-2xl bg-secondary">
              {photo ? (
                <img src={photo} alt={teacher.full_name} className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center font-display text-2xl font-bold text-primary">
                  {teacher.full_name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold">{teacher.full_name}</h2>
            <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm">
              <Star className="size-4 fill-gold text-gold" />
              <span className="font-semibold">{Number(teacher.rating).toFixed(1)}</span>
              <span className="text-muted-foreground">({teacher.review_count})</span>
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" /> {teacher.experience_years} years experience
            </p>
            {teacher.status === "approved" ? (
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/teachers/$id" params={{ id: teacher.id }}>
                  View public profile
                </Link>
              </Button>
            ) : null}
          </div>

          {teacher.status !== "approved" ? (
            <div className="rounded-3xl border border-border bg-secondary/40 p-6">
              <h2 className="font-display text-lg font-bold">What's next?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your application is {STATUS_LABEL[teacher.status]?.toLowerCase() ?? teacher.status}.
                Our team may call you for a short interview or demo before approval.
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </PageShell>
  );
}
