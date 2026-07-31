CREATE OR REPLACE FUNCTION public.normalize_auth_user_login_fields(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET
    confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change = coalesce(email_change, ''),
    phone_change = coalesce(phone_change, ''),
    phone_change_token = coalesce(phone_change_token, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    reauthentication_token = coalesce(reauthentication_token, ''),
    updated_at = now()
  WHERE id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_auth_user_login_fields(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_auth_user_login_fields(uuid) TO service_role;