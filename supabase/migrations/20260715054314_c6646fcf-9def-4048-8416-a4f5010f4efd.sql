
-- 1. Products: restrict SELECT
DROP POLICY IF EXISTS "products read auth" ON public.products;
CREATE POLICY "products read admin" ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "products read own purchases" ON public.products FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.purchases p WHERE p.product_id = products.id AND p.user_id = auth.uid()));

-- 2. Email templates: admin-only read
DROP POLICY IF EXISTS "email_templates read auth" ON public.email_templates;
CREATE POLICY "email_templates read admin" ON public.email_templates FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Remove hardcoded admin email from handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $function$;

-- 4. Tighten SECURITY DEFINER exec grants (RLS engine uses them via table owner, not caller EXECUTE)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_content(uuid, uuid) FROM PUBLIC, anon, authenticated;
