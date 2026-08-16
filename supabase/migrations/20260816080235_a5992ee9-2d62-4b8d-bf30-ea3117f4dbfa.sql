REVOKE ALL ON public.teachers FROM anon;
GRANT SELECT (id, full_name, qualification, experience_years, subjects, classes, boards,
              location, teaching_modes, available_days, available_from, available_to,
              bio, photo_path, verified, rating, review_count, created_at)
  ON public.teachers TO anon;
GRANT SELECT ON public.teachers_public TO anon, authenticated;