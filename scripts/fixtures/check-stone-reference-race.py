"""Disposable database only; seed with stone-workspace.sql committed before use."""
import subprocess, time, sys
container, database = sys.argv[1:]
if not database.startswith('urblo_stone_verify_'):
    raise SystemExit('Refusing a non-fixture database')
base=['docker','exec',container,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-d',database,'-c']
subprocess.run(base+["update public.products set status='draft' where slug='fixture-product'"],check=True,capture_output=True)
first=subprocess.Popen(base+["begin; update public.products set status='published' where slug='fixture-product'; select pg_sleep(2); commit;"],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
time.sleep(.4)
started=time.monotonic()
second=subprocess.run(base+["do $$ declare e jsonb; begin select private.stone_envelope(id) into e from public.stone_groups where stone_group_key='fixture-stone'; perform public.admin_stone_workspace('archive',(e->>'stoneId')::bigint,(e->>'revision')::bigint,e->>'liveVersion',gen_random_uuid(),e->'draft','00000000-0000-4000-8000-000000000092','editor'); end $$;"],capture_output=True,text=True)
first.communicate(timeout=10)
assert first.returncode==0
assert second.returncode!=0 and 'stone_in_use' in second.stderr,second.stderr
assert time.monotonic()-started>1
print('PASS: concurrent Product publish serializes before Stone hide; hide is rejected after the new reference commits.')
