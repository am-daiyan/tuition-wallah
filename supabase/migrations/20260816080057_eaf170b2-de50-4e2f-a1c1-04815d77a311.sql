-- View now runs with the querying user's permissions (no security definer view)
DROP VIEW IF EXISTS public.teachers_public;
CREATE VIEW public.teachers_public
WITH (security_invoker = on) AS
  SELECT id, full_name, qualification, experience_years, subjects, classes, boards,
         location, teaching_modes, available_days, available_from, available_to,
         bio, photo_path, verified, rating, review_count, created_at
  FROM public.teachers
  WHERE status = 'approved';

GRANT SELECT ON public.teachers_public TO anon, authenticated;

-- Anonymous visitors: approved rows only, and never the contact columns
CREATE POLICY "public approved teachers" ON public.teachers FOR SELECT TO anon, authenticated
  USING (status = 'approved');

REVOKE ALL ON public.teachers FROM anon;
GRANT SELECT (id, full_name, qualification, experience_years, subjects, classes, boards,
              location, teaching_modes, available_days, available_from, available_to,
              bio, photo_path, verified, rating, review_count, created_at)
  ON public.teachers TO anon;