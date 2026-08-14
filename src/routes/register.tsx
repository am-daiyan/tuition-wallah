import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, UserPlus } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { registerStudent } from "@/lib/auth.functions";
import { BOARDS, CLASSES, MODES, phoneToEmail, SUBJECTS } from "@/lib/brand";
import { studentRegistrationSchema } from "@/lib/validation";

const TITLE = "Student Registration — Tuition Wallah";
const DESCRIPTION =
  "Create your Tuition Wallah student account and get matched with a verified home tutor for your class, board and subjects.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const submit = useServerFn(registerStudent);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    studentClass: "",
    board: "",
    location: "",
    preferredTiming: "",
    teachingMode: "Home Tuition",
  });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = studentRegistrationSchema.safeParse({ ...form, subjects });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted fields");
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await submit({ data: parsed.data });
      const { error } = await supabase.auth.signInWithPassword({
        email: phoneToEmail(parsed.data.phone),
        password: parsed.data.password,
      });
      if (error) throw error;
      await refresh();
      toast.success("Account created — welcome to Tuition Wallah!");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Student registration"
        title="Create your student account"
        description="Tell us what you're studying and how you like to learn. Our team matches you with a verified teacher and notifies you as soon as a match is ready."
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
                placeholder="Student's full name"
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
            <Field
              label="Password"
              htmlFor="password"
              required
              error={errors["password"]}
              hint="Minimum 6 characters."
            >
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Create a password"
              />
            </Field>
          </div>

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

          <Field label="Subjects needed" required error={errors["subjects"]}>
            <ChipGroup options={SUBJECTS} value={subjects} onChange={setSubjects} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location / locality" htmlFor="location" required error={errors["location"]}>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Bargadwa, Gorakhpur"
              />
            </Field>
            <Field label="Preferred timing" htmlFor="preferredTiming" error={errors["preferredTiming"]}>
              <Input
                id="preferredTiming"
                value={form.preferredTiming}
                onChange={(e) => set("preferredTiming", e.target.value)}
                placeholder="e.g. 5 PM – 7 PM"
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

          <Button type="submit" size="lg" variant="gold" className="w-full" disabled={busy}>
            <UserPlus className="size-4" />
            {busy ? "Creating account…" : "Create student account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login here
            </Link>
          </p>
        </form>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-secondary/40 p-6">
            <h2 className="font-display text-lg font-bold">What happens next?</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">1.</span> Our admin team reviews
                your requirement.
              </li>
              <li>
                <span className="font-semibold text-foreground">2.</span> We shortlist verified
                teachers who match your class, board and area.
              </li>
              <li>
                <span className="font-semibold text-foreground">3.</span> A demo class is arranged,
                then regular tuition begins.
              </li>
              <li>
                <span className="font-semibold text-foreground">4.</span> Not satisfied? Request a
                free replacement teacher any time.
              </li>
            </ol>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <GraduationCap className="size-6 text-gold" />
            <h2 className="mt-3 font-display text-lg font-bold">Are you a teacher?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join our verified panel and get home-tuition assignments near you.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/become-a-teacher">Apply as a teacher</Link>
            </Button>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
