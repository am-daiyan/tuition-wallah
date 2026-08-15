import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LifeBuoy,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ChipGroup, Field } from "@/components/form/Fields";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DAYS, MODES, STATUS_LABEL, SUBJECTS, TEACHER_STATUSES } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Tuition Wallah" },
      {
        name: "description",
        content:
          "Manage teachers, students, tuition requests, assignments, complaints and replacement requests.",
      },
      { property: "og:title", content: "Admin Panel — Tuition Wallah" },
      { property: "og:description", content: "Tuition Wallah administration." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  const teachers = useQuery({
    queryKey: ["admin-teachers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const requests = useQuery({
    queryKey: ["admin-requests"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tuition_requests")
        .select("*, profiles:student_id(full_name, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const assignments = useQuery({
    queryKey: ["admin-assignments"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tuition_assignments")
        .select("*, teachers(full_name), profiles:student_id(full_name, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const complaints = useQuery({
    queryKey: ["admin-complaints"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*, profiles:student_id(full_name, phone), teachers(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const replacements = useQuery({
    queryKey: ["admin-replacements"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("replacement_requests")
        .select("*, profiles:student_id(full_name, phone), teachers:current_teacher_id(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const students = useQuery({
    queryKey: ["admin-students"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, profiles:id(full_name, phone, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const reviews = useQuery({
    queryKey: ["admin-reviews"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, teachers(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const notifications = useQuery({
    queryKey: ["admin-notifications"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
  });

  function refresh(...keys: string[]) {
    for (const key of keys) void queryClient.invalidateQueries({ queryKey: [key] });
  }

  if (loading) {
    return (
      <PageShell>
        <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>
      </PageShell>
    );
  }

  if (!isAdmin) {
    return (
      <PageShell>
        <div className="container-page py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Admin access only</h1>
          <p className="mt-3 text-muted-foreground">
            This area is restricted to the Tuition Wallah team.
          </p>
          <Button asChild variant="gold" className="mt-6">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const pendingTeachers = (teachers.data ?? []).filter((t) => t.status !== "approved").length;
  const openRequests = (requests.data ?? []).filter((r) => r.status === "open").length;
  const openComplaints = (complaints.data ?? []).filter((c) => c.status === "open").length;
  const openReplacements = (replacements.data ?? []).filter((r) => r.status === "open").length;

  return (
    <PageShell>
      <PageHero
        eyebrow="Admin panel"
        title="Run the platform"
        description="Approve teachers, assign tuitions, resolve complaints and manage replacements."
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Teachers pending" value={pendingTeachers} />
          <Stat label="Open requests" value={openRequests} />
          <Stat label="Open complaints" value={openComplaints} />
          <Stat label="Replacements" value={openReplacements} />
        </div>
      </PageHero>

      <section className="container-page py-12">
        <Tabs defaultValue="teachers">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-2xl p-1.5">
            <TabsTrigger value="teachers" className="gap-1.5">
              <GraduationCap className="size-4" /> Teachers
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5">
              <ClipboardList className="size-4" /> Requests
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-1.5">
              <BookOpen className="size-4" /> Tuitions
            </TabsTrigger>
            <TabsTrigger value="complaints" className="gap-1.5">
              <LifeBuoy className="size-4" /> Complaints
            </TabsTrigger>
            <TabsTrigger value="replacements" className="gap-1.5">
              <RefreshCw className="size-4" /> Replacements
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-1.5">
              <Users className="size-4" /> Students
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              <Star className="size-4" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="size-4" /> Alerts
            </TabsTrigger>
          </TabsList>

          {/* TEACHERS */}
          <TabsContent value="teachers" className="mt-6 space-y-4">
            {(teachers.data ?? []).map((t) => (
              <Card key={t.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold">{t.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.phone} · {t.qualification} · {t.experience_years} yrs · {t.location}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.subjects.join(", ")} | {t.classes.join(", ")} | {t.boards.join(", ")}
                    </p>
                  </div>
                  <Badge variant={t.status === "approved" ? "default" : "secondary"}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Select
                    value={t.status}
                    onValueChange={async (status) => {
                      const { error } = await supabase
                        .from("teachers")
                        .update({
                          status: status as (typeof TEACHER_STATUSES)[number],
                          verified: status === "approved",
                        })
                        .eq("id", t.id);
                      if (error) toast.error("Could not update status");
                      else {
                        toast.success(`Status set to ${STATUS_LABEL[status] ?? status}`);
                        refresh("admin-teachers");
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEACHER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s] ?? s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <NotesDialog
                    title={`Notes for ${t.full_name}`}
                    initial={t.admin_notes ?? ""}
                    onSave={async (notes) => {
                      const { error } = await supabase
                        .from("teachers")
                        .update({ admin_notes: notes })
                        .eq("id", t.id);
                      if (error) toast.error("Could not save notes");
                      else {
                        toast.success("Notes saved");
                        refresh("admin-teachers");
                      }
                    }}
                  />
                  {t.status === "approved" ? (
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/teachers/$id" params={{ id: t.id }}>
                        View profile
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
            {(teachers.data ?? []).length === 0 ? <EmptyCard text="No teachers yet." /> : null}
          </TabsContent>

          {/* REQUESTS */}
          <TabsContent value="requests" className="mt-6 space-y-4">
            {(requests.data ?? []).map((r) => {
              const student = (r as { profiles?: { full_name?: string; phone?: string } }).profiles;
              return (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-bold">
                        {student?.full_name ?? "Student"} · {student?.phone ?? ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.student_class} · {r.board} · {r.subjects.join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.location} · {r.preferred_days.join(", ")} ·{" "}
                        {r.preferred_time ?? "Any time"} · {r.teaching_mode}
                      </p>
                      {r.requirements ? (
                        <p className="mt-2 rounded-xl bg-secondary p-3 text-sm">{r.requirements}</p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AssignDialog
                      requestId={r.id}
                      studentId={r.student_id}
                      subjects={r.subjects}
                      days={r.preferred_days}
                      timeSlot={r.preferred_time ?? ""}
                      mode={r.teaching_mode}
                      teachers={(teachers.data ?? [])
                        .filter((t) => t.status === "approved")
                        .map((t) => ({ id: t.id, name: t.full_name }))}
                      onDone={() => refresh("admin-requests", "admin-assignments")}
                    />
                    <Select
                      value={r.status}
                      onValueChange={async (status) => {
                        const { error } = await supabase
                          .from("tuition_requests")
                          .update({ status: status as "open" | "assigned" | "closed" | "cancelled" })
                          .eq("id", r.id);
                        if (error) toast.error("Could not update");
                        else {
                          toast.success("Request updated");
                          refresh("admin-requests");
                        }
                      }}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["open", "assigned", "closed", "cancelled"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s] ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              );
            })}
            {(requests.data ?? []).length === 0 ? <EmptyCard text="No requests yet." /> : null}
          </TabsContent>

          {/* ASSIGNMENTS */}
          <TabsContent value="assignments" className="mt-6 space-y-4">
            {(assignments.data ?? []).map((a) => {
              const student = (a as { profiles?: { full_name?: string; phone?: string } }).profiles;
              const teacher = (a as { teachers?: { full_name?: string } }).teachers;
              return (
                <Card key={a.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-bold">
                        {student?.full_name ?? "Student"} → {teacher?.full_name ?? "Teacher"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {a.subjects.join(", ")} · {a.days.join(", ")} · {a.time_slot ?? "Time TBD"} ·{" "}
                        {a.teaching_mode}
                      </p>
                      <p className="text-sm text-muted-foreground">{student?.phone ?? ""}</p>
                    </div>
                    <Badge variant={a.status === "active" ? "default" : "secondary"}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Select
                      value={a.status}
                      onValueChange={async (status) => {
                        const { error } = await supabase
                          .from("tuition_assignments")
                          .update({ status: status as "active" | "ended" | "replaced" })
                          .eq("id", a.id);
                        if (error) toast.error("Could not update");
                        else {
                          toast.success("Tuition updated");
                          refresh("admin-assignments");
                        }
                      }}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["active", "ended", "replaced"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s] ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              );
            })}
            {(assignments.data ?? []).length === 0 ? (
              <EmptyCard text="No tuitions assigned yet." />
            ) : null}
          </TabsContent>

          {/* COMPLAINTS */}
          <TabsContent value="complaints" className="mt-6 space-y-4">
            {(complaints.data ?? []).map((c) => {
              const student = (c as { profiles?: { full_name?: string; phone?: string } }).profiles;
              const teacher = (c as { teachers?: { full_name?: string } }).teachers;
              return (
                <Card key={c.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-bold">
                        {c.category} · {student?.full_name ?? "Student"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student?.phone ?? ""}
                        {teacher?.full_name ? ` · Teacher: ${teacher.full_name}` : ""}
                      </p>
                      <p className="mt-2 rounded-xl bg-secondary p-3 text-sm">{c.details}</p>
                    </div>
                    <Badge variant="secondary">{STATUS_LABEL[c.status] ?? c.status}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Select
                      value={c.status}
                      onValueChange={async (status) => {
                        const { error } = await supabase
                          .from("complaints")
                          .update({
                            status: status as "open" | "under_review" | "resolved" | "closed",
                          })
                          .eq("id", c.id);
                        if (error) toast.error("Could not update");
                        else {
                          toast.success("Complaint updated");
                          refresh("admin-complaints");
                        }
                      }}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["open", "under_review", "resolved", "closed"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s] ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <NotesDialog
                      title="Respond to complaint"
                      label="Send response"
                      initial={c.admin_response ?? ""}
                      onSave={async (text) => {
                        const { error } = await supabase
                          .from("complaints")
                          .update({ admin_response: text })
                          .eq("id", c.id);
                        if (error) toast.error("Could not save response");
                        else {
                          toast.success("Response saved");
                          refresh("admin-complaints");
                        }
                      }}
                    />
                  </div>
                </Card>
              );
            })}
            {(complaints.data ?? []).length === 0 ? <EmptyCard text="No complaints." /> : null}
          </TabsContent>

          {/* REPLACEMENTS */}
          <TabsContent value="replacements" className="mt-6 space-y-4">
            {(replacements.data ?? []).map((r) => {
              const student = (r as { profiles?: { full_name?: string; phone?: string } }).profiles;
              const current = (r as { teachers?: { full_name?: string } }).teachers;
              return (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-bold">
                        {student?.full_name ?? "Student"} · {student?.phone ?? ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current teacher: {current?.full_name ?? "—"}
                      </p>
                      <p className="mt-2 rounded-xl bg-secondary p-3 text-sm">{r.reason}</p>
                      {r.requirements ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Requirements: {r.requirements}
                        </p>
                      ) : null}
                      {r.preferred_timing ? (
                        <p className="text-sm text-muted-foreground">
                          Preferred timing: {r.preferred_timing}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ReplaceTeacherDialog
                      replacementId={r.id}
                      assignmentId={r.assignment_id}
                      teachers={(teachers.data ?? [])
                        .filter((t) => t.status === "approved")
                        .map((t) => ({ id: t.id, name: t.full_name }))}
                      onDone={() => refresh("admin-replacements", "admin-assignments")}
                    />
                    <Select
                      value={r.status}
                      onValueChange={async (status) => {
                        const { error } = await supabase
                          .from("replacement_requests")
                          .update({
                            status: status as "open" | "under_review" | "assigned" | "rejected",
                          })
                          .eq("id", r.id);
                        if (error) toast.error("Could not update");
                        else {
                          toast.success("Replacement updated");
                          refresh("admin-replacements");
                        }
                      }}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["open", "under_review", "assigned", "rejected"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s] ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              );
            })}
            {(replacements.data ?? []).length === 0 ? (
              <EmptyCard text="No replacement requests." />
            ) : null}
          </TabsContent>

          {/* STUDENTS */}
          <TabsContent value="students" className="mt-6 space-y-4">
            {(students.data ?? []).map((s) => {
              const p = (s as { profiles?: { full_name?: string; phone?: string; email?: string } })
                .profiles;
              return (
                <Card key={s.id}>
                  <p className="font-display text-lg font-bold">{p?.full_name ?? "Student"}</p>
                  <p className="text-sm text-muted-foreground">
                    {p?.phone ?? ""} {p?.email ? `· ${p.email}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.student_class} · {s.board} · {s.subjects.join(", ")} · {s.location} ·{" "}
                    {s.teaching_mode}
                  </p>
                </Card>
              );
            })}
            {(students.data ?? []).length === 0 ? <EmptyCard text="No students yet." /> : null}
          </TabsContent>

          {/* REVIEWS */}
          <TabsContent value="reviews" className="mt-6 space-y-4">
            {(reviews.data ?? []).map((rv) => {
              const teacher = (rv as { teachers?: { full_name?: string } }).teachers;
              return (
                <Card key={rv.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-bold">
                        {rv.author_name || "Student"} → {teacher?.full_name ?? "Teacher"}
                      </p>
                      <p className="flex items-center gap-1 text-sm">
                        <Star className="size-4 fill-gold text-gold" /> {rv.rating}
                      </p>
                      {rv.comment ? (
                        <p className="mt-2 text-sm text-muted-foreground">{rv.comment}</p>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      variant={rv.hidden ? "outline" : "ghost"}
                      onClick={async () => {
                        const { error } = await supabase
                          .from("reviews")
                          .update({ hidden: !rv.hidden })
                          .eq("id", rv.id);
                        if (error) toast.error("Could not update review");
                        else {
                          toast.success(rv.hidden ? "Review restored" : "Review hidden");
                          refresh("admin-reviews");
                        }
                      }}
                    >
                      {rv.hidden ? "Unhide" : "Hide"}
                    </Button>
                  </div>
                </Card>
              );
            })}
            {(reviews.data ?? []).length === 0 ? <EmptyCard text="No reviews yet." /> : null}
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications" className="mt-6 space-y-3">
            {(notifications.data ?? []).map((n) => (
              <Card key={n.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{n.subject}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("en-IN")} · {n.status}
                  </span>
                </div>
                <pre className="mt-2 rounded-xl bg-secondary p-3 text-xs whitespace-pre-wrap">
                  {n.body}
                </pre>
              </Card>
            ))}
            {(notifications.data ?? []).length === 0 ? (
              <EmptyCard text="No notifications recorded yet." />
            ) : null}
          </TabsContent>
        </Tabs>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <p className="font-display text-3xl font-extrabold text-gold">{value}</p>
      <p className="mt-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">{label}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">{children}</div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <p className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function NotesDialog({
  title,
  initial,
  label = "Add notes",
  onSave,
}: {
  title: string;
  initial: string;
  label?: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Visible to the Tuition Wallah team.</DialogDescription>
        </DialogHeader>
        <Textarea rows={6} value={value} onChange={(e) => setValue(e.target.value)} />
        <Button
          variant="gold"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onSave(value);
            setBusy(false);
            setOpen(false);
          }}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({
  requestId,
  studentId,
  subjects,
  days,
  timeSlot,
  mode,
  teachers,
  onDone,
}: {
  requestId: string;
  studentId: string;
  subjects: string[];
  days: string[];
  timeSlot: string;
  mode: string;
  teachers: { id: string; name: string }[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [pickedSubjects, setPickedSubjects] = useState<string[]>(subjects);
  const [pickedDays, setPickedDays] = useState<string[]>(days);
  const [slot, setSlot] = useState(timeSlot);
  const [pickedMode, setPickedMode] = useState(mode);
  const [busy, setBusy] = useState(false);

  async function assign() {
    if (!teacherId) {
      toast.error("Select a teacher");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("tuition_assignments").insert({
      student_id: studentId,
      teacher_id: teacherId,
      request_id: requestId,
      subjects: pickedSubjects,
      days: pickedDays,
      time_slot: slot || null,
      teaching_mode: pickedMode,
      status: "active",
    });
    if (!error) {
      await supabase.from("tuition_requests").update({ status: "assigned" }).eq("id", requestId);
    }
    setBusy(false);
    if (error) {
      toast.error("Could not assign teacher");
      return;
    }
    toast.success("Teacher assigned");
    setOpen(false);
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="gold">
          Assign teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign a teacher</DialogTitle>
          <DialogDescription>Creates an active tuition for this student.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <Field label="Teacher" required>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an approved teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Subjects">
            <ChipGroup options={SUBJECTS} value={pickedSubjects} onChange={setPickedSubjects} />
          </Field>
          <Field label="Days">
            <ChipGroup options={DAYS} value={pickedDays} onChange={setPickedDays} />
          </Field>
          <Field label="Time slot">
            <Input value={slot} onChange={(e) => setSlot(e.target.value)} placeholder="6 PM – 7 PM" />
          </Field>
          <Field label="Mode">
            <ChipGroup
              options={MODES}
              multi={false}
              value={pickedMode ? [pickedMode] : []}
              onChange={(next) => setPickedMode(next[0] ?? "Home Tuition")}
            />
          </Field>
          <Button variant="gold" className="w-full" disabled={busy} onClick={assign}>
            {busy ? "Assigning…" : "Assign teacher"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReplaceTeacherDialog({
  replacementId,
  assignmentId,
  teachers,
  onDone,
}: {
  replacementId: string;
  assignmentId: string | null;
  teachers: { id: string; name: string }[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [busy, setBusy] = useState(false);

  async function assign() {
    if (!teacherId) {
      toast.error("Select a replacement teacher");
      return;
    }
    setBusy(true);

    if (assignmentId) {
      const { data: old } = await supabase
        .from("tuition_assignments")
        .select("*")
        .eq("id", assignmentId)
        .maybeSingle();
      if (old) {
        await supabase
          .from("tuition_assignments")
          .update({ status: "replaced" })
          .eq("id", assignmentId);
        await supabase.from("tuition_assignments").insert({
          student_id: old.student_id,
          teacher_id: teacherId,
          request_id: old.request_id,
          subjects: old.subjects,
          days: old.days,
          time_slot: old.time_slot,
          teaching_mode: old.teaching_mode,
          status: "active",
        });
      }
    }

    const { error } = await supabase
      .from("replacement_requests")
      .update({ new_teacher_id: teacherId, status: "assigned" })
      .eq("id", replacementId);
    setBusy(false);
    if (error) {
      toast.error("Could not assign the replacement");
      return;
    }
    toast.success("Replacement teacher assigned");
    setOpen(false);
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="gold">
          Assign replacement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a replacement teacher</DialogTitle>
          <DialogDescription>
            Ends the current tuition and starts a new one with the selected teacher.
          </DialogDescription>
        </DialogHeader>
        <Field label="Replacement teacher" required>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an approved teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button variant="gold" disabled={busy} onClick={assign}>
          {busy ? "Assigning…" : "Confirm replacement"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
