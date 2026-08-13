
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_teacher_status() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_teacher_insert() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_teacher_rating() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
