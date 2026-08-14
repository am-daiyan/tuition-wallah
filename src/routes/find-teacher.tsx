import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHero, PageShell } from "@/components/layout/PageShell";
import { TeacherCard, type TeacherCardData } from "@/components/teachers/TeacherCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BOARDS, CLASSES, MODES, SUBJECTS } from "@/lib/brand";

const TITLE = "Find a Home Tutor in Gorakhpur — Tuition Wallah";
const DESCRIPTION =
  "Browse verified home tutors by class, subject, board and teaching mode. CBSE, ICSE and U.P. Board tutors for Class 1 to 12.";

const ANY = "any";

export const Route = createFileRoute("/find-teacher")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: FindTeacherPage,
});

function FindTeacherPage() {
  const [search, setSearch] = useState("");
  const [studentClass, setStudentClass] = useState(ANY);
  const [subject, setSubject] = useState(ANY);
  const [board, setBoard] = useState(ANY);
  const [mode, setMode] = useState(ANY);
  const [sort, setSort] = useState("rating");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["approved-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select(
          "id, full_name, qualification, experience_years, subjects, classes, boards, location, teaching_modes, photo_path, rating, review_count, verified",
        )
        .eq("status", "approved")
        .order("rating", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as TeacherCardData[];
    },
  });

  const teachers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (data ?? []).filter((t) => {
      if (studentClass !== ANY && !t.classes.includes(studentClass)) return false;
      if (subject !== ANY && !t.subjects.includes(subject) && !t.subjects.includes("All Subjects"))
        return false;
      if (board !== ANY && !t.boards.includes(board)) return false;
      if (mode !== ANY && !t.teaching_modes.includes(mode)) return false;
      if (!term) return true;
      return (
        t.full_name.toLowerCase().includes(term) ||
        t.location.toLowerCase().includes(term) ||
        t.subjects.join(" ").toLowerCase().includes(term) ||
        t.qualification.toLowerCase().includes(term)
      );
    });
    return [...list].sort((a, b) => {
      if (sort === "experience") return b.experience_years - a.experience_years;
      if (sort === "reviews") return b.review_count - a.review_count;
      return Number(b.rating) - Number(a.rating);
    });
  }, [data, search, studentClass, subject, board, mode, sort]);

  function reset() {
    setSearch("");
    setStudentClass(ANY);
    setSubject(ANY);
    setBoard(ANY);
    setMode(ANY);
    setSort("rating");
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Find a teacher"
        title="Verified home tutors, matched to your class"
        description="Filter by class, subject, board and teaching mode to find a tutor who fits your schedule and syllabus."
      />

      <section className="container-page py-10">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <SlidersHorizontal className="size-4" /> Filters
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, subject or area"
                className="pl-9"
                aria-label="Search teachers"
              />
            </div>
            <Select value={studentClass} onValueChange={setStudentClass}>
              <SelectTrigger aria-label="Class">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All classes</SelectItem>
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger aria-label="Subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All subjects</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={board} onValueChange={setBoard}>
              <SelectTrigger aria-label="Board">
                <SelectValue placeholder="Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All boards</SelectItem>
                {BOARDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger aria-label="Mode">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any mode</SelectItem>
                {MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading teachers…" : `${teachers.length} teacher(s) found`}
            </p>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44" aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top rated</SelectItem>
                  <SelectItem value="experience">Most experienced</SelectItem>
                  <SelectItem value="reviews">Most reviewed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={reset}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
            We couldn't load teachers right now. Please refresh the page.
          </p>
        ) : teachers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="font-display text-xl font-bold">No teachers match these filters</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try widening your filters, or post your requirement and we'll find a teacher for you.
            </p>
            <Button variant="gold" className="mt-6" onClick={reset}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
