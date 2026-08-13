import { Link } from "@tanstack/react-router";
import { BadgeCheck, GraduationCap, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { teacherPhotoUrl } from "@/lib/brand";

export type TeacherCardData = {
  id: string;
  full_name: string;
  qualification: string;
  experience_years: number;
  subjects: string[];
  classes: string[];
  boards: string[];
  location: string;
  teaching_modes: string[];
  photo_path: string | null;
  rating: number;
  review_count: number;
  verified: boolean;
};

export function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const photo = teacherPhotoUrl(teacher.photo_path);
  const initials = teacher.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start gap-4 p-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-secondary">
          {photo ? (
            <img
              src={photo}
              alt={teacher.full_name}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-xl font-bold text-primary">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-lg font-bold text-foreground">
              {teacher.full_name}
            </h3>
            {teacher.verified ? <BadgeCheck className="size-4 shrink-0 text-gold" /> : null}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <GraduationCap className="size-4" /> {teacher.qualification}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" /> {teacher.location}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="size-4 fill-gold text-gold" />
              {Number(teacher.rating ?? 0).toFixed(1)}
            </span>
            <span className="text-muted-foreground">({teacher.review_count} reviews)</span>
            <span className="text-muted-foreground">· {teacher.experience_years} yrs exp</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 px-5">
        {teacher.subjects.slice(0, 4).map((s) => (
          <Badge key={s} variant="secondary" className="rounded-full font-medium">
            {s}
          </Badge>
        ))}
        {teacher.subjects.length > 4 ? (
          <Badge variant="outline" className="rounded-full">
            +{teacher.subjects.length - 4}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-5 py-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {teacher.teaching_modes.join(" · ")}
        </p>
        <Button asChild size="sm" variant="gold">
          <Link to="/teachers/$id" params={{ id: teacher.id }}>
            View Profile
          </Link>
        </Button>
      </div>
    </article>
  );
}
