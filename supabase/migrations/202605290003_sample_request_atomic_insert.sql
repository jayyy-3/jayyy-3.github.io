-- Keep sample request and first requested item creation atomic for server-side form writes.
-- The function is called only from Cloudflare Pages Functions with the service role key.

create or replace function public.submit_sample_request_with_item(
  p_request jsonb,
  p_item jsonb
)
returns table (
  sample_request_id bigint,
  sample_request_item_id bigint
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  inserted_request_id bigint;
  inserted_item_id bigint;
begin
  insert into public.sample_requests (
    name,
    email,
    phone,
    company,
    shipping_address,
    project_name,
    message,
    source_route,
    turnstile_success,
    notification_status
  )
  values (
    p_request->>'name',
    p_request->>'email',
    nullif(p_request->>'phone', ''),
    nullif(p_request->>'company', ''),
    p_request->>'shipping_address',
    nullif(p_request->>'project_name', ''),
    nullif(p_request->>'message', ''),
    p_request->>'source_route',
    (p_request->>'turnstile_success')::boolean,
    coalesce(nullif(p_request->>'notification_status', ''), 'pending')
  )
  returning id into inserted_request_id;

  insert into public.sample_request_items (
    sample_request_id,
    stone_group_id,
    finish_definition_id,
    quantity,
    notes
  )
  values (
    inserted_request_id,
    nullif(p_item->>'stone_group_id', '')::bigint,
    nullif(p_item->>'finish_definition_id', '')::bigint,
    coalesce(nullif(p_item->>'quantity', '')::integer, 1),
    nullif(p_item->>'notes', '')
  )
  returning id into inserted_item_id;

  sample_request_id := inserted_request_id;
  sample_request_item_id := inserted_item_id;
  return next;
end;
$$;

revoke all on function public.submit_sample_request_with_item(jsonb, jsonb) from public;
revoke execute on function public.submit_sample_request_with_item(jsonb, jsonb) from anon;
revoke execute on function public.submit_sample_request_with_item(jsonb, jsonb) from authenticated;
grant execute on function public.submit_sample_request_with_item(jsonb, jsonb) to service_role;

notify pgrst, 'reload schema';
