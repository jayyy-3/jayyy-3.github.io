-- Move admin-role SECURITY DEFINER helpers out of the exposed public API schema.
-- RLS and Storage policies call private.has_admin_role(...) directly, while
-- public helper RPC execution is revoked from browser roles.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

create or replace function private.current_admin_role()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select admin_profiles.role
  from public.admin_profiles
  where admin_profiles.user_id = (select auth.uid())
    and admin_profiles.is_active
  limit 1;
$$;

create or replace function private.has_admin_role(allowed_roles text[])
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(private.current_admin_role() = any(allowed_roles), false);
$$;

revoke all on function private.current_admin_role() from public;
revoke all on function private.current_admin_role() from anon;
grant execute on function private.current_admin_role() to authenticated;

revoke all on function private.has_admin_role(text[]) from public;
revoke all on function private.has_admin_role(text[]) from anon;
grant execute on function private.has_admin_role(text[]) to authenticated;

do $$
declare
  policy_record record;
  policy_sql text;
  updated_using_expr text;
  updated_check_expr text;
begin
  for policy_record in
    select
      namespaces.nspname as schema_name,
      classes.relname as table_name,
      policies.polname as policy_name,
      pg_get_expr(policies.polqual, policies.polrelid) as using_expr,
      pg_get_expr(policies.polwithcheck, policies.polrelid) as check_expr
    from pg_policy policies
    join pg_class classes on classes.oid = policies.polrelid
    join pg_namespace namespaces on namespaces.oid = classes.relnamespace
    where pg_get_expr(policies.polqual, policies.polrelid) like '%has_admin_role(%'
       or pg_get_expr(policies.polwithcheck, policies.polrelid) like '%has_admin_role(%'
  loop
    updated_using_expr := case
      when policy_record.using_expr is null then null
      else replace(
        replace(
          replace(policy_record.using_expr, 'private.has_admin_role(', 'has_admin_role('),
          'public.has_admin_role(',
          'has_admin_role('
        ),
        'has_admin_role(',
        'private.has_admin_role('
      )
    end;

    updated_check_expr := case
      when policy_record.check_expr is null then null
      else replace(
        replace(
          replace(policy_record.check_expr, 'private.has_admin_role(', 'has_admin_role('),
          'public.has_admin_role(',
          'has_admin_role('
        ),
        'has_admin_role(',
        'private.has_admin_role('
      )
    end;

    policy_sql := format(
      'alter policy %I on %I.%I',
      policy_record.policy_name,
      policy_record.schema_name,
      policy_record.table_name
    );

    if updated_using_expr is not null then
      policy_sql := policy_sql || format(' using (%s)', updated_using_expr);
    end if;

    if updated_check_expr is not null then
      policy_sql := policy_sql || format(' with check (%s)', updated_check_expr);
    end if;

    execute policy_sql;
  end loop;
end $$;

revoke all on function public.current_admin_role() from public;
revoke all on function public.current_admin_role() from anon;
revoke all on function public.current_admin_role() from authenticated;

revoke all on function public.has_admin_role(text[]) from public;
revoke all on function public.has_admin_role(text[]) from anon;
revoke all on function public.has_admin_role(text[]) from authenticated;
