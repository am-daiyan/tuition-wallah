import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LifeBuoy, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Field } from "@/components/form/Fields";
import { PageHero, PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { BRAND, COMPLAINT_CATEGORIES, STATUS_LABEL } from "@/lib/brand";
import { notifySubmission } from "@/lib/notifications.functions";
import { complaintSchema } from "@/lib/validation";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({
    meta: [
      { title: "Support & Complaints — Tuition Wallah" },
      {
        name: "description",
        content:
          "Raise a complaint about a teacher, schedule or tuition and track the response from the Tuition Wallah team.",
      },
      { property: "og:title", content: "Support & Complaints — Tuition Wallah" },
      { property: "og:description", content: "Raise and track tuition complaints." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const { user } = useAuth();
  const notify = useServerFn(notifySubmission);
  const [category, setCategory] = useState("");
  const [teacherId, setTeacherId] = useState("none");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const complaints = useQuery({
    queryKey: ["my-complaints", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("id, category, details, status, admin_response, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const myTeachers = useQuery({
    queryKey: ["my-assigned-teachers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tuition_assignments")
        .select("teachers(id, full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as {
        teachers: { id: string; full_name: string } | null;
      }[];
      const unique = new Map<string, string>();
      for (const row of rows) if (row.teachers) unique.set(row.teachers.id, row.teachers.full_name);
      return [...unique.entries()].map(([id, full_name]) => ({ id, full_name }));
    },
  });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    const parsed = complaintSchema.safeParse({
      category,
      teacherId: teacherId === "none" ? "" : teacherId,
      details,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase
      .from("complaints")
      .insert({
        student_id: user.id,
        category: parsed.data.category,
        teacher_id: parsed.data.teacherId || null,
        details: parsed.data.details,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error("Could not submit your complaint.");
      return;
    }
    try {
      await notify({ data: { kind: "complaint", id: data.id } });
    } catch {
      /* complaint is saved regardless */
    }
    toast.success("Complaint submitted — our team will review it.");
    setDetails("");
    setCategory("");
    setTeacherId("none");
    void complaints.refetch();
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Support"
        title="Raise a complaint or ask for help"
        description="Tell us what went wrong. Every complaint reaches our admin team directly and is tracked until it's resolved."
      />

      <section className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_340px]">
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <LifeBuoy className="size-5 text-gold" /> New complaint
          </h2>

          <Field label="Category" required error={errors["category"]}>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Related teacher" error={errors["teacherId"]}>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Not about a specific teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not about a specific teacher</SelectItem>
                {(myTeachers.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="What happened?" required error={errors["details"]}>
            <Textarea
              rows={6}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue with dates and details so we can act quickly."
            />
          </Field>

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy}>
            <Send className="size-4" /> {busy ? "Submitting…" : "Submit complaint"}
          </Button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Your complaints</h2>
            {(complaints.data ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No complaints raised yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {(complaints.data ?? []).map((c) => (
                  <li key={c.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{c.category}</p>
                      <Badge variant="secondary">{STATUS_LABEL[c.status] ?? c.status}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.details}</p>
                    {c.admin_response ? (
                      <p className="mt-3 rounded-xl bg-secondary p-3 text-sm">
                        <span className="font-semibold">Our response: </span>
                        {c.admin_response}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface-ink rounded-3xl p-6">
            <Phone className="size-5 text-gold" />
            <h2 className="mt-3 font-display text-lg font-bold text-ink-foreground">
              Prefer to talk?
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Call our team for urgent issues — we'll sort it out the same day.
            </p>
            <Button asChild variant="gold" className="mt-4 w-full">
              <a href={BRAND.phoneHref}>Call {BRAND.phone}</a>
            </Button>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
