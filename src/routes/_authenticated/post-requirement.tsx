import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ChipGroup, Field } from "@/components/form/Fields";
import { PageHero, PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BOARDS, CLASSES, DAYS, MODES, SUBJECTS } from "@/lib/brand";
import { notifySubmission } from "@/lib/notifications.functions";
import { tuitionRequestSchema } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/post-requirement")({
  head: () => ({
    meta: [
      { title: "Post Your Tuition Requirement — Tuition Wallah" },
      {
        name: "description",
        content:
          "Tell Tuition Wallah what you need — class, board, subjects, timing and location — and we'll match a verified home tutor.",
      },
      { property: "og:title", content: "Post Your Tuition Requirement — Tuition Wallah" },
      {
        property: "og:description",
        content: "Share your tuition requirement and get matched with a verified teacher.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PostRequirementPage,
});

function PostRequirementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useServerFn(notifySubmission);

  const [form, setForm] = useState({
    studentClass: "",
    board: "",
    location: "",
    preferredTime: "",
    teachingMode: "Home Tuition",
    requirements: "",
    preferredTeacherId: "",
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const teachersQuery = useQuery({
    queryKey: ["approved-teacher-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, full_name, location")
        .eq("status", "approved")
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    const parsed = tuitionRequestSchema.safeParse({ ...form, subjects, preferredDays: days });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted fields");
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase
      .from("tuition_requests")
      .insert({
        student_id: user.id,
        student_class: parsed.data.studentClass,
        board: parsed.data.board,
        subjects: parsed.data.subjects,
        location: parsed.data.location,
        preferred_days: parsed.data.preferredDays,
        preferred_time: parsed.data.preferredTime || null,
        teaching_mode: parsed.data.teachingMode,
        requirements: parsed.data.requirements || null,
        preferred_teacher_id: parsed.data.preferredTeacherId || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      setBusy(false);
      toast.error("Could not submit your requirement. Please try again.");
      return;
    }

    try {
      await notify({ data: { kind: "tuition_request", id: data.id } });
    } catch {
      // The request is saved; notification failures should not block the student.
    }
    setBusy(false);
    toast.success("Requirement posted — our team will contact you shortly.");
    navigate({ to: "/dashboard" });
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Tuition request"
        title="Post your tuition requirement"
        description="The more detail you share, the better we can match a teacher to your syllabus, schedule and location."
      />

      <section className="container-page py-14">
        <form
          onSubmit={onSubmit}
          className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-9"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Class" required error={errors["studentClass"]}>
              <Select value={form.studentClass} onValueChange={(v) => set("studentClass", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Board" required error={errors["board"]}>
              <Select value={form.board} onValueChange={(v) => set("board", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Subjects" required error={errors["subjects"]}>
            <ChipGroup options={SUBJECTS} value={subjects} onChange={setSubjects} />
          </Field>

          <Field label="Preferred days" required error={errors["preferredDays"]}>
            <ChipGroup options={DAYS} value={days} onChange={setDays} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location" htmlFor="location" required error={errors["location"]}>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Where should the teacher come?"
              />
            </Field>
            <Field label="Preferred time" htmlFor="preferredTime" error={errors["preferredTime"]}>
              <Input
                id="preferredTime"
                value={form.preferredTime}
                onChange={(e) => set("preferredTime", e.target.value)}
                placeholder="e.g. 6 PM – 7:30 PM"
              />
            </Field>
          </div>

          <Field label="Mode of teaching" required error={errors["teachingMode"]}>
            <ChipGroup
              options={MODES}
              multi={false}
              value={form.teachingMode ? [form.teachingMode] : []}
              onChange={(next) => set("teachingMode", next[0] ?? "")}
            />
          </Field>

          <Field
            label="Preferred teacher (optional)"
            hint="Leave blank and we'll recommend the best match."
          >
            <Select
              value={form.preferredTeacherId || "none"}
              onValueChange={(v) => set("preferredTeacherId", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {(teachersQuery.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.full_name} · {t.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Additional requirements" htmlFor="requirements" error={errors["requirements"]}>
            <Textarea
              id="requirements"
              rows={5}
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              placeholder="Weak areas, exam targets, preferred teacher gender, budget expectations…"
            />
          </Field>

          <Button type="submit" size="lg" variant="gold" className="w-full" disabled={busy}>
            <Send className="size-4" /> {busy ? "Submitting…" : "Submit requirement"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
