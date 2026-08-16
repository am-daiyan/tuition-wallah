-- 1. Move has_role out of the API-exposed public schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Recreate every policy that referenced public.has_role
DROP POLICY IF EXISTS "notif admin read" ON public.admin_notifications;
CREATE POLICY "notif admin read" ON public.admin_notifications FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "complaints admin update" ON public.complaints;
CREATE POLICY "complaints admin update" ON public.complaints FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "complaints own read" ON public.complaints;
CREATE POLICY "complaints own read" ON public.complaints FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own profile read" ON public.profiles;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "repl admin update" ON public.replacement_requests;
CREATE POLICY "repl admin update" ON public.replacement_requests FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "repl own read" ON public.replacement_requests;
CREATE POLICY "repl own read" ON public.replacement_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "reviews own read" ON public.reviews;
CREATE POLICY "reviews own read" ON public.reviews FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "reviews update" ON public.reviews;
CREATE POLICY "reviews update" ON public.reviews FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "student self read" ON public.students;
CREATE POLICY "student self read" ON public.students FOR SELECT TO authenticated
  USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "student self update" ON public.students;
CREATE POLICY "student self update" ON public.students FOR UPDATE TO authenticated
  USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "teacher self read" ON public.teachers;
CREATE POLICY "teacher self read" ON public.teachers FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "teacher self update" ON public.teachers;
CREATE POLICY "teacher self update" ON public.teachers FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (profile_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "assign admin insert" ON public.tuition_assignments;
CREATE POLICY "assign admin insert" ON public.tuition_assignments FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "assign admin update" ON public.tuition_assignments;
CREATE POLICY "assign admin update" ON public.tuition_assignments FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "assign read" ON public.tuition_assignments;
CREATE POLICY "assign read" ON public.tuition_assignments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR private.has_role(auth.uid(), 'admin')
    OR teacher_id IN (SELECT t.id FROM public.teachers t WHERE t.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "req own read" ON public.tuition_requests;
CREATE POLICY "req own read" ON public.tuition_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "req update" ON public.tuition_requests;
CREATE POLICY "req update" ON public.tuition_requests FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (student_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own roles read" ON public.user_roles;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

-- 3. Update trigger guards to use the private helper, then drop public.has_role
CREATE OR REPLACE FUNCTION public.guard_teacher_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NOT private.has_role(auth.uid(),'admin') THEN
    NEW.status := 'pending'; NEW.verified := false; NEW.rating := 0; NEW.review_count := 0;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.guard_teacher_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NOT private.has_role(auth.uid(),'admin') THEN
    NEW.status := OLD.status;
    NEW.verified := OLD.verified;
    NEW.admin_notes := OLD.admin_notes;
    NEW.rating := OLD.rating;
    NEW.review_count := OLD.review_count;
  END IF;
  RETURN NEW;
END; $function$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4. Stop exposing teacher contact details publicly
DROP POLICY IF EXISTS "public approved teachers" ON public.teachers;
REVOKE ALL ON public.teachers FROM anon;

CREATE OR REPLACE VIEW public.teachers_public
WITH (security_invoker = off) AS
  SELECT id, full_name, qualification, experience_years, subjects, classes, boards,
         location, teaching_modes, available_days, available_from, available_to,
         bio, photo_path, verified, rating, review_count, created_at
  FROM public.teachers
  WHERE status = 'approved';

GRANT SELECT ON public.teachers_public TO anon, authenticated;

-- 5. Storage: ownership-scoped access to teacher photos
DROP POLICY IF EXISTS "teacher photos owner read" ON storage.objects;
CREATE POLICY "teacher photos owner read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'teacher-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR owner = auth.uid()
      OR private.has_role(auth.uid(), 'admin')
    )
  );

DROP POLICY IF EXISTS "teacher photos upload" ON storage.objects;
CREATE POLICY "teacher photos upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'teacher-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR private.has_role(auth.uid(), 'admin')
    )
  );

DROP POLICY IF EXISTS "teacher photos owner update" ON storage.objects;
CREATE POLICY "teacher photos owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'teacher-photos'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR owner = auth.uid()
         OR private.has_role(auth.uid(), 'admin'))
  )
  WITH CHECK (
    bucket_id = 'teacher-photos'
    AND ((storage.foldername(name))[1] = auth.uid()::text
         OR private.has_role(auth.uid(), 'admin'))
  );