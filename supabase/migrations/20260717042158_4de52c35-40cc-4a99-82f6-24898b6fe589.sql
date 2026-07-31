-- Restore SECURITY DEFINER role checks in RLS policies to avoid recursive reads on user_roles.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- profiles
DROP POLICY IF EXISTS "profiles self select" ON public.profiles;
DROP POLICY IF EXISTS "profiles self update" ON public.profiles;
DROP POLICY IF EXISTS "profiles admin insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles admin delete" ON public.profiles;

CREATE POLICY "profiles self select" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles self update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles admin insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles admin delete" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- user_roles
DROP POLICY IF EXISTS "user_roles self select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles admin insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles admin update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles admin delete" ON public.user_roles;

CREATE POLICY "user_roles self select" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles admin insert" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles admin update" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles admin delete" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- products
DROP POLICY IF EXISTS "products read admin" ON public.products;
DROP POLICY IF EXISTS "products admin insert" ON public.products;
DROP POLICY IF EXISTS "products admin update" ON public.products;
DROP POLICY IF EXISTS "products admin delete" ON public.products;

CREATE POLICY "products read admin" ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "products admin insert" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin update" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin delete" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- purchases
DROP POLICY IF EXISTS "purchases self select" ON public.purchases;
DROP POLICY IF EXISTS "purchases admin delete" ON public.purchases;

CREATE POLICY "purchases self select" ON public.purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "purchases admin delete" ON public.purchases
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- admin_logs
DROP POLICY IF EXISTS "admin_logs admin all" ON public.admin_logs;
CREATE POLICY "admin_logs admin all" ON public.admin_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- email_templates
DROP POLICY IF EXISTS "email_templates read admin" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates admin write" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates admin update" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates admin delete" ON public.email_templates;

CREATE POLICY "email_templates read admin" ON public.email_templates
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "email_templates admin write" ON public.email_templates
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "email_templates admin update" ON public.email_templates
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "email_templates admin delete" ON public.email_templates
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- user_progress / prefs
DROP POLICY IF EXISTS "Admins view all progress" ON public.user_progress;
DROP POLICY IF EXISTS "Admins view all prefs" ON public.user_profile_prefs;

CREATE POLICY "Admins view all progress" ON public.user_progress
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins view all prefs" ON public.user_profile_prefs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));