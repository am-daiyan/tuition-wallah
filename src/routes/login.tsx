import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { Field } from "@/components/form/Fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail } from "@/lib/brand";
import { loginSchema } from "@/lib/validation";

const TITLE = "Login — Tuition Wallah";
const DESCRIPTION = "Sign in to your Tuition Wallah account to manage tuitions, teachers and requests.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ phone, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(parsed.data.phone),
      password: parsed.data.password,
    });
    if (error) {
      setBusy(false);
      toast.error("Mobile number or password is incorrect");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    let target: "/dashboard" | "/teacher" | "/admin" = "/dashboard";
    if (uid) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const list = (roles ?? []).map((r) => r.role);
      if (list.includes("admin")) target = "/admin";
      else if (list.includes("teacher")) target = "/teacher";
    }
    await refresh();
    toast.success("Welcome back!");
    navigate({ to: target, replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="surface-ink hidden flex-col justify-between p-12 lg:flex">
        <Logo tone="inverted" />
        <div>
          <p className="eyebrow text-gold">Welcome back</p>
          <p className="mt-3 font-display text-4xl font-extrabold text-ink-foreground">
            Your tuition, organised in one place.
          </p>

          <p className="mt-4 max-w-md text-ink-muted">
            Track your assigned teacher, class schedule, requests and complaints — and ask for a
            replacement teacher whenever you need one.
          </p>
        </div>
        <p className="text-xs font-bold tracking-[0.22em] text-gold uppercase">
          Your Success Is Our Mission
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 font-display text-3xl font-extrabold">Login to Tuition Wallah</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the mobile number you registered with.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Mobile number" htmlFor="phone" required error={errors["phone"]}>
              <Input
                id="phone"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Field label="Password" htmlFor="password" required error={errors["password"]}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy}>
              <LogIn className="size-4" /> {busy ? "Signing in…" : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register as a student
            </Link>{" "}
            or{" "}
            <Link to="/become-a-teacher" className="font-semibold text-primary hover:underline">
              apply as a teacher
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
