import { readFileSync } from 'node:fs'
import { assertLocalContainer, docker, LOCAL_PROJECT } from './_lib/local-environment.mjs'
assertLocalContainer()
const migration = readFileSync('supabase/migrations/202605280005_security_definer_function_grants.sql', 'utf8')
const sql = `begin;
create or replace function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $helper$ begin return; end; $helper$;
grant execute on function public.rls_auto_enable() to public, anon, authenticated;
${migration}
do $proof$ begin
if has_function_privilege('anon', 'public.rls_auto_enable()', 'execute') or has_function_privilege('authenticated', 'public.rls_auto_enable()', 'execute') then raise exception 'Hosted helper privilege regression'; end if;
end; $proof$;
rollback;`
docker(['exec', `supabase_db_${LOCAL_PROJECT}`, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', sql])
console.log('Local transactional proof passed: existing hosted helper loses browser-role execution; test rolled back.')
