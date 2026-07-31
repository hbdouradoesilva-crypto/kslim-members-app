-- Defense-in-depth: authenticated users only need SELECT on admin_logs
-- (the RLS policy already blocks non-admins, but revoking write grants
-- removes an entire class of attack surface). Webhook and admin server
-- functions use the service_role client, which is unaffected.
REVOKE INSERT, UPDATE, DELETE ON public.admin_logs FROM authenticated;