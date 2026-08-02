-- Production migration 20260802103337 narrows the public Project tombstone
-- endpoint to the five bundled fallback
-- slugs that are already public in src/data/projectData.ts. The expand
-- migration could enumerate every archived canonical slug plus archived
-- private-draft slugs even though the public runtime only needs tombstones for
-- bundled fallback records.
--
-- This remains an intentionally public, read-only SECURITY DEFINER endpoint:
-- archived rows are hidden by normal RLS, and callers receive only a known
-- public slug when that exact bundled fallback has been archived.

create or replace function public.get_archived_project_slugs()
returns table (slug text)
language sql
stable
security definer
set search_path = ''
as $function$
  with static_fallback_slugs (slug) as (
    values
      ('australian-catholic-university'::text),
      ('west-side-place'::text),
      ('xavier-college'::text),
      ('artisan-park-yarrabend'::text),
      ('moon-gate-woolley-street'::text)
  )
  select fallback.slug
  from static_fallback_slugs as fallback
  where exists (
    select 1
    from public.projects as projects
    where lower(btrim(projects.slug)) = fallback.slug
      and projects.status = 'archived'
  )
  order by fallback.slug;
$function$;

comment on function public.get_archived_project_slugs() is
  'Returns only known bundled public Project slugs whose canonical CMS row is archived; never reads private project drafts.';

revoke all on function public.get_archived_project_slugs() from public, anon, authenticated;
grant execute on function public.get_archived_project_slugs() to anon, authenticated, service_role;

notify pgrst, 'reload schema';
