
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_teacher_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_teacher_insert() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_teacher_rating() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
