-- Backfill: garantir que todo admin tenha linha de prefs com onboarded=true
INSERT INTO public.user_profile_prefs (user_id, onboarded)
SELECT ur.user_id, true
FROM public.user_roles ur
WHERE ur.role = 'admin'
ON CONFLICT (user_id) DO UPDATE SET onboarded = true;

-- Backfill: garantir profile ativo para admins
UPDATE public.profiles p
SET is_active = true
FROM public.user_roles ur
WHERE ur.user_id = p.user_id AND ur.role = 'admin' AND p.is_active IS DISTINCT FROM true;

-- Trigger: quando alguém vira admin, cria prefs com onboarded=true automaticamente
CREATE OR REPLACE FUNCTION public.ensure_admin_prefs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_profile_prefs (user_id, onboarded)
    VALUES (NEW.user_id, true)
    ON CONFLICT (user_id) DO UPDATE SET onboarded = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_roles_ensure_admin_prefs ON public.user_roles;
CREATE TRIGGER trg_user_roles_ensure_admin_prefs
AFTER INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.ensure_admin_prefs();
