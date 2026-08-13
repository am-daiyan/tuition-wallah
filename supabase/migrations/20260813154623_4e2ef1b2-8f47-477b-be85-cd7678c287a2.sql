
CREATE TYPE public.app_role AS ENUM ('admin','teacher','student');
CREATE TYPE public.teacher_status AS ENUM ('pending','under_review','interview','approved','rejected','suspended');
CREATE TYPE public.request_status AS ENUM ('open','assigned','closed','cancelled');
CREATE TYPE public.assignment_status AS ENUM ('active','ended','replaced');
CREATE TYPE public.complaint_status AS ENUM ('open','under_review','resolved','closed');
CREATE TYPE public.replacement_status AS ENUM ('open','under_review','assigned','rejected');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text UNIQUE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.students (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_class text NOT NULL,
  board text NOT NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  location text NOT NULL DEFAULT '',
  preferred_timing text,
  teaching_mode text NOT NULL DEFAULT 'Home Tuition',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student self read" ON public.students FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "student self insert" ON public.students FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "student self update" ON public.students FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  photo_path text,
  qualification text NOT NULL,
  experience_years integer NOT NULL DEFAULT 0,
  subjects text[] NOT NULL DEFAULT '{}',
  classes text[] NOT NULL DEFAULT '{}',
  boards text[] NOT NULL DEFAULT '{}',
  location text NOT NULL DEFAULT '',
  teaching_modes text[] NOT NULL DEFAULT '{}',
  available_days text[] NOT NULL DEFAULT '{}',
  available_from text,
  available_to text,
  bio text,
  status public.teacher_status NOT NULL DEFAULT 'pending',
  verified boolean NOT NULL DEFAULT false,
  admin_notes text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.teachers TO authenticated;
GRANT SELECT ON public.teachers TO anon;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public approved teachers" ON public.teachers FOR SELECT TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY "teacher self read" ON public.teachers FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "teacher self insert" ON public.teachers FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
CREATE POLICY "teacher self update" ON public.teachers FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER teachers_updated BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.guard_teacher_status() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    NEW.status := OLD.status;
    NEW.verified := OLD.verified;
    NEW.admin_notes := OLD.admin_notes;
    NEW.rating := OLD.rating;
    NEW.review_count := OLD.review_count;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER teachers_guard BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.guard_teacher_status();

CREATE OR REPLACE FUNCTION public.guard_teacher_insert() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    NEW.status := 'pending'; NEW.verified := false; NEW.rating := 0; NEW.review_count := 0;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER teachers_guard_insert BEFORE INSERT ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.guard_teacher_insert();

CREATE TABLE public.tuition_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_class text NOT NULL,
  board text NOT NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  location text NOT NULL,
  preferred_days text[] NOT NULL DEFAULT '{}',
  preferred_time text,
  teaching_mode text NOT NULL DEFAULT 'Home Tuition',
  requirements text,
  preferred_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  status public.request_status NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.tuition_requests TO authenticated;
GRANT ALL ON public.tuition_requests TO service_role;
ALTER TABLE public.tuition_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "req own read" ON public.tuition_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "req own insert" ON public.tuition_requests FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "req update" ON public.tuition_requests FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER req_updated BEFORE UPDATE ON public.tuition_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tuition_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.tuition_requests(id) ON DELETE SET NULL,
  subjects text[] NOT NULL DEFAULT '{}',
  days text[] NOT NULL DEFAULT '{}',
  time_slot text,
  start_date date,
  end_date date,
  teaching_mode text NOT NULL DEFAULT 'Home Tuition',
  meeting_link text,
  status public.assignment_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.tuition_assignments TO authenticated;
GRANT ALL ON public.tuition_assignments TO service_role;
ALTER TABLE public.tuition_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assign read" ON public.tuition_assignments FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(),'admin')
    OR teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
  );
CREATE POLICY "assign admin insert" ON public.tuition_assignments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "assign admin update" ON public.tuition_assignments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER assign_updated BEFORE UPDATE ON public.tuition_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  author_name text NOT NULL DEFAULT '',
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, student_id)
);
GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (hidden = false);
CREATE POLICY "reviews own read" ON public.reviews FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reviews insert own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "reviews update" ON public.reviews FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.refresh_teacher_rating() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tid uuid;
BEGIN
  tid := COALESCE(NEW.teacher_id, OLD.teacher_id);
  UPDATE public.teachers t SET
    rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric,1) FROM public.reviews r WHERE r.teacher_id = tid AND r.hidden = false),0),
    review_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.teacher_id = tid AND r.hidden = false)
  WHERE t.id = tid;
  RETURN NULL;
END; $$;
CREATE TRIGGER reviews_rating AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_teacher_rating();

CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  category text NOT NULL,
  details text NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'open',
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints own read" ON public.complaints FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "complaints insert own" ON public.complaints FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "complaints admin update" ON public.complaints FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.replacement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.tuition_assignments(id) ON DELETE SET NULL,
  current_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  new_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  reason text NOT NULL,
  requirements text,
  preferred_timing text,
  extra_info text,
  status public.replacement_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.replacement_requests TO authenticated;
GRANT ALL ON public.replacement_requests TO service_role;
ALTER TABLE public.replacement_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repl own read" ON public.replacement_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "repl insert own" ON public.replacement_requests FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "repl admin update" ON public.replacement_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER repl_updated BEFORE UPDATE ON public.replacement_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  recipient text,
  status text NOT NULL DEFAULT 'pending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif admin read" ON public.admin_notifications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "teacher photos upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'teacher-photos');
CREATE POLICY "teacher photos owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'teacher-photos');
CREATE POLICY "teacher photos owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'teacher-photos' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'teacher-photos' AND owner = auth.uid());

CREATE INDEX teachers_status_idx ON public.teachers (status);
CREATE INDEX assignments_student_idx ON public.tuition_assignments (student_id);
CREATE INDEX reviews_teacher_idx ON public.reviews (teacher_id);
