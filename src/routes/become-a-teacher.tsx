import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, IndianRupee, Upload, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ChipGroup, Field } from "@/components/form/Fields";
import { PageHero, PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { registerTeacher } from "@/lib/auth.functions";
import { BOARDS, CLASSES, DAYS, MODES, phoneToEmail, SUBJECTS } from "@/lib/brand";
import { teacherRegistrationSchema } from "@/lib/validation";

const TITLE = "Become a Teacher — Tuition Wallah Tutor Application";
const DESCRIPTION =
  "Apply to join the Tuition Wallah verified tutor panel and get home-tuition assignments for Class 1–12 students in Gorakhpur.";

export const Route = createFileRoute("/become-a-teacher")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: BecomeATeacherPage,
});

const PERKS = [
  { Icon: Users, title: "Students near you", body: "Assignments matched to your area and timing." },
  { Icon: IndianRupee, title: "Fair, transparent fees", body: "Agreed up front, no hidden cuts." },
  { Icon: BadgeCheck, title: "Verified badge", body: "Stand out with a screened, verified profile." },
];

function BecomeATeacherPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const submit = useServerFn(registerTeacher);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    qualification: "",
    experienceYears: "0",
    location: "",
    availableFrom: "",
    availableTo: "",
    bio: "",
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [boards, setBoards] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>(["Home Tuition"]);
  const [days, setDays] = useState<string[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = teacherRegistrationSchema.safeParse({
      ...form,
      experienceYears: Number(form.experienceYears || 0),
      subjects,
      classes,
      boards,
      teachingModes: modes,
      availableDays: days,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted fields");
      return;
    }
    if (photo && photo.size > 4 * 1024 * 1024) {
      toast.error("Photo must be smaller than 4 MB");
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const result = await submit({ data: parsed.data });
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(parsed.data.phone),
        password: parsed.data.password,
      });
      if (signInError) throw signInError;

      if (photo && result.teacherId) {
        const ext = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${result.userId}/profile.${ext}`;
        const upload = await supabase.storage
          .from("teacher-photos")
          .upload(path, photo, { upsert: true, contentType: photo.type });
        if (!upload.error) {
          await supabase.from("teachers").update({ photo_path: path }).eq("id", result.teacherId);
        }
      }

      await refresh();
      toast.success("Application submitted — our team will review it shortly.");
      navigate({ to: "/teacher", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Teacher application"
        title="Teach with Tuition Wallah"
        description="Join a screened panel of home tutors in Gorakhpur. Share your subjects, classes and availability — our team reviews every application before approval."
      />

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={onSubmit}
          className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-9"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" required error={errors["fullName"]}>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Your full name"
              />
            </Field>
            <Field
              label="Mobile number"
              htmlFor="phone"
              required
              error={errors["phone"]}
              hint="This is also your login ID."
            >
              <Input
                id="phone"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="10-digit mobile number"
              />
            </Field>
            <Field label="Email (optional)" htmlFor="email" error={errors["email"]}>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password" htmlFor="password" required error={errors["password"]}>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Create a password"
              />
            </Field>
            <Field
              label="Qualification"
              htmlFor="qualification"
              required
              error={errors["qualification"]}
            >
              <Input
                id="qualification"
                value={form.qualification}
                onChange={(e) => set("qualification", e.target.value)}
                placeholder="e.g. M.Sc. Mathematics, B.Ed."
              />
            </Field>
            <Field
              label="Experience (years)"
              htmlFor="experienceYears"
              required
              error={errors["experienceYears"]}
            >
              <Input
                id="experienceYears"
                type="number"
                min={0}
                max={60}
                value={form.experienceYears}
                onChange={(e) => set("experienceYears", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Subjects you teach" required error={errors["subjects"]}>
            <ChipGroup options={SUBJECTS} value={subjects} onChange={setSubjects} />
          </Field>
          <Field label="Classes you teach" required error={errors["classes"]}>
            <ChipGroup options={CLASSES} value={classes} onChange={setClasses} />
          </Field>
          <Field label="Boards" required error={errors["boards"]}>
            <ChipGroup options={BOARDS} value={boards} onChange={setBoards} />
          </Field>
          <Field label="Mode of teaching" required error={errors["teachingModes"]}>
            <ChipGroup options={MODES} value={modes} onChange={setModes} />
          </Field>
          <Field label="Available days" required error={errors["availableDays"]}>
            <ChipGroup options={DAYS} value={days} onChange={setDays} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Area / locality" htmlFor="location" required error={errors["location"]}>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Bargadwa, Gorakhpur"
              />
            </Field>
            <Field label="Available from" htmlFor="availableFrom" error={errors["availableFrom"]}>
              <Input
                id="availableFrom"
                value={form.availableFrom}
                onChange={(e) => set("availableFrom", e.target.value)}
                placeholder="4 PM"
              />
            </Field>
            <Field label="Available to" htmlFor="availableTo" error={errors["availableTo"]}>
              <Input
                id="availableTo"
                value={form.availableTo}
                onChange={(e) => set("availableTo", e.target.value)}
                placeholder="8 PM"
              />
            </Field>
          </div>

          <Field
            label="About you"
            htmlFor="bio"
            error={errors["bio"]}
            hint="Teaching style, achievements, board experience — this appears on your public profile."
          >
            <Textarea
              id="bio"
              rows={5}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell students and parents about your teaching approach…"
            />
          </Field>

          <Field label="Profile photo" htmlFor="photo" hint="JPG or PNG, up to 4 MB.">
            <div className="flex items-center gap-3">
              <Input
                id="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="cursor-pointer"
              />
              <Upload className="size-5 shrink-0 text-muted-foreground" />
            </div>
          </Field>

          <Button type="submit" size="lg" variant="gold" className="w-full" disabled={busy}>
            {busy ? "Submitting application…" : "Submit application"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already applied?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login to check your status
            </Link>
          </p>
        </form>

        <aside className="space-y-4">
          {PERKS.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <Icon className="size-6 text-gold" />
              <h2 className="mt-3 font-display text-lg font-bold">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
          <div className="rounded-3xl border border-border bg-secondary/40 p-6">
            <h2 className="font-display text-lg font-bold">Selection process</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Application review</li>
              <li>2. Short interview / demo</li>
              <li>3. Verification & approval</li>
              <li>4. First assignment</li>
            </ol>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
