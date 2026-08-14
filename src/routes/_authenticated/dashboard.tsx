import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, LifeBuoy, Plus, RefreshCw, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Field } from "@/components/form/Fields";
import { PageHero, PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL } from "@/lib/brand";
import { notifySubmission } from "@/lib/notifications.functions";
import { replacementSchema, reviewSchema } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Tuition Wallah" },
      {
        name: "description",
        content:
          "Track your tuition requests, assigned teachers, reviews and replacement requests in one place.",
      },
      { property: "og:title", content: "Student Dashboard — Tuition Wallah" },
      { property: "og:description", content: "Manage your Tuition Wallah tuitions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentDashboard,
});

type Assignment = {
  id: string;
  subjects: string[];
  days: string[];
  time_slot: string | null;
  teaching_mode: string;
  status: string;
  start_date: string | null;
  teachers: { id: string; full_name: string; phone: string; qualification: string } | null;
};

function StudentDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const notify = useServerFn(notifySubmission);

  const requests = useQuery({
    queryKey: ["my-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tuition_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const assignments = useQuery({
    queryKey: ["my-assignments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tuition_assignments")
        .select(
          "id, subjects, days, time_slot, teaching_mode, status, start_date, teachers(id, full_name, phone, qualification)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Assignment[];
    },
  });

  const replacements = useQuery({
    queryKey: ["my-replacements", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("replacement_requests")
        .select("id, reason, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const activeAssignments = (assignments.data ?? []).filter((a) => a.status === "active");

  return (
    <PageShell>
      <PageHero
        eyebrow="Student dashboard"
        title={`Welcome, ${profile?.full_name?.split(" ")[0] ?? "student"}`}
        description="Everything about your tuition — requests, assigned teachers, reviews and support — in one place."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="gold">
            <Link to="/post-requirement">
              <Plus className="size-4" /> Post requirement
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/find-teacher">Browse teachers</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/support">
              <LifeBuoy className="size-4" /> Support & complaints
            </Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="My tuitions" icon={<BookOpen className="size-5 text-gold" />}>
            {assignments.isLoading ? (
              <Skeleton className="h-24 rounded-2xl" />
            ) : (assignments.data ?? []).length === 0 ? (
              <Empty text="No tuition assigned yet. Post a requirement and our team will match a teacher." />
            ) : (
              <ul className="space-y-4">
                {(assignments.data ?? []).map((a) => (
                  <li key={a.id} className="rounded-2xl border border-border p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-display text-lg font-bold">
                          {a.teachers?.full_name ?? "Teacher"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {a.teachers?.qualification ?? ""}
                        </p>
                      </div>
                      <Badge variant={a.status === "active" ? "default" : "secondary"}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {a.subjects.join(", ")} · {a.days.join(", ")} · {a.time_slot ?? "Time TBD"} ·{" "}
                      {a.teaching_mode}
                    </p>
                    {a.status === "active" && a.teachers ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <ReviewDialog
                          teacherId={a.teachers.id}
                          teacherName={a.teachers.full_name}
                          authorName={profile?.full_name ?? "Student"}
                          onDone={() => queryClient.invalidateQueries({ queryKey: ["my-reviews"] })}
                        />
                        <ReplacementDialog
                          assignmentId={a.id}
                          teacherName={a.teachers.full_name}
                          onDone={async (id) => {
                            try {
                              await notify({ data: { kind: "replacement_request", id } });
                            } catch {
                              /* saved regardless */
                            }
                            void replacements.refetch();
                          }}
                        />
                        <Button asChild variant="ghost" size="sm">
                          <a href={`tel:${a.teachers.phone}`}>Call teacher</a>
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="My requirements" icon={<Plus className="size-5 text-gold" />}>
            {requests.isLoading ? (
              <Skeleton className="h-20 rounded-2xl" />
            ) : (requests.data ?? []).length === 0 ? (
              <Empty text="You haven't posted a requirement yet." />
            ) : (
              <ul className="space-y-3">
                {(requests.data ?? []).map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {r.student_class} · {r.board}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.subjects.join(", ")} · {r.location} · {r.preferred_time ?? "Any time"}
                      </p>
                    </div>
                    <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Replacement requests" icon={<RefreshCw className="size-5 text-gold" />}>
            {(replacements.data ?? []).length === 0 ? (
              <Empty text="No replacement requests raised." />
            ) : (
              <ul className="space-y-3">
                {(replacements.data ?? []).map((r) => (
                  <li key={r.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {new Date(r.created_at).toLocaleDateString("en-IN")}
                      </span>
                      <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{r.reason}</p>
                  </li>
                ))}
              </ul>
            )}
            {activeAssignments.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Replacement can be requested once a teacher is assigned.
              </p>
            ) : null}
          </Panel>

          <div className="surface-ink rounded-3xl p-6">
            <p className="eyebrow text-gold">Need help fast?</p>
            <h2 className="mt-2 font-display text-xl font-bold text-ink-foreground">
              Our team is a call away
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Raise a complaint or ask for a different teacher — we respond quickly.
            </p>
            <Button asChild variant="gold" className="mt-4 w-full">
              <Link to="/support">Open support</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        {icon} {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function ReviewDialog({
  teacherId,
  teacherName,
  authorName,
  onDone,
}: {
  teacherId: string;
  teacherName: string;
  authorName: string;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = reviewSchema.parse({ teacherId, rating, comment });
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("reviews").insert({
        teacher_id: parsed.teacherId,
        student_id: user.id,
        rating: parsed.rating,
        comment: parsed.comment || null,
        author_name: authorName,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for your review!");
      setOpen(false);
      setComment("");
      onDone();
    },
    onError: () => toast.error("Could not save your review."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Star className="size-4" /> Write review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {teacherName}</DialogTitle>
          <DialogDescription>
            Your feedback helps other families choose the right teacher.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <Field label="Rating" required>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star`}
                  className="p-1"
                >
                  <Star
                    className={
                      value <= rating ? "size-7 fill-gold text-gold" : "size-7 text-muted-foreground"
                    }
                  />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Comment">
            <Textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How are the classes going?"
            />
          </Field>
          <Button
            variant="gold"
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Submit review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReplacementDialog({
  assignmentId,
  teacherName,
  onDone,
}: {
  assignmentId: string;
  teacherName: string;
  onDone: (id: string) => void | Promise<void>;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    reason: "",
    requirements: "",
    preferredTiming: "",
    extraInfo: "",
  });
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!user) return;
    const parsed = replacementSchema.safeParse({ assignmentId, ...form });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please complete the form");
      return;
    }
    setBusy(true);
    const { data: assignment } = await supabase
      .from("tuition_assignments")
      .select("teacher_id")
      .eq("id", assignmentId)
      .maybeSingle();

    const { data, error } = await supabase
      .from("replacement_requests")
      .insert({
        student_id: user.id,
        assignment_id: assignmentId,
        current_teacher_id: assignment?.teacher_id ?? null,
        reason: parsed.data.reason,
        requirements: parsed.data.requirements || null,
        preferred_timing: parsed.data.preferredTiming || null,
        extra_info: parsed.data.extraInfo || null,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error("Could not submit the replacement request.");
      return;
    }
    toast.success("Replacement request sent to our team.");
    setOpen(false);
    setForm({ reason: "", requirements: "", preferredTiming: "", extraInfo: "" });
    await onDone(data.id);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <RefreshCw className="size-4" /> Request replacement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a replacement teacher</DialogTitle>
          <DialogDescription>
            Currently assigned: {teacherName}. Tell us what isn't working and we'll arrange a better
            match.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <Field label="Reason for change" required>
            <Textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Timing clashes with school activities"
            />
          </Field>
          <Field label="New requirements">
            <Textarea
              rows={3}
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              placeholder="Subjects, teaching style, board experience…"
            />
          </Field>
          <Field label="Preferred timing">
            <Input
              value={form.preferredTiming}
              onChange={(e) => setForm({ ...form, preferredTiming: e.target.value })}
              placeholder="e.g. 7 PM – 8:30 PM"
            />
          </Field>
          <Field label="Additional information">
            <Textarea
              rows={3}
              value={form.extraInfo}
              onChange={(e) => setForm({ ...form, extraInfo: e.target.value })}
              placeholder="Anything else our team should know"
            />
          </Field>
          <Button variant="gold" className="w-full" disabled={busy} onClick={submit}>
            {busy ? "Sending…" : "Send request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
