-- Remove direct public execution from SECURITY DEFINER helpers.
-- Admin role helpers remain executable by authenticated users because RLS policies call them.

revoke all on function public.current_admin_role() from public;
revoke all on function public.current_admin_role() from anon;
grant execute on function public.current_admin_role() to authenticated;

revoke all on function public.has_admin_role(text[]) from public;
revoke all on function public.has_admin_role(text[]) from anon;
grant execute on function public.has_admin_role(text[]) to authenticated;

-- Hosted Supabase may provision this helper; fresh local stacks do not.
-- Preserve the same revocations whenever it exists without requiring a stub.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public;
    revoke all on function public.rls_auto_enable() from anon;
    revoke all on function public.rls_auto_enable() from authenticated;
  end if;
end;
$$;
