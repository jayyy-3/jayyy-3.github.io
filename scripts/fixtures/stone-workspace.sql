-- Local fixture only. Run against a disposable database with both migrations applied.
-- Every fixture row is rolled back. Never run this against production.
\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-000000000091','stone-owner@example.invalid'),
 ('00000000-0000-4000-8000-000000000092','stone-editor@example.invalid'),
 ('00000000-0000-4000-8000-000000000093','stone-viewer@example.invalid');
insert into public.admin_profiles(user_id,email,role) values
 ('00000000-0000-4000-8000-000000000091','stone-owner@example.invalid','owner'),
 ('00000000-0000-4000-8000-000000000092','stone-editor@example.invalid','editor'),
 ('00000000-0000-4000-8000-000000000093','stone-viewer@example.invalid','viewer');
insert into public.finish_definitions(finish_key,display_name) values('fixture-flamed','Flamed');
insert into public.media_assets(status,source_kind,source_url,media_type,alt) values('published','external_legacy','/images/fixture.png','image','Fixture flamed granite');
create function pg_temp.check(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end;$$;
create function pg_temp.write_stone(action text, e jsonb, d jsonb, req uuid default gen_random_uuid()) returns jsonb language sql as $$
 select public.admin_stone_workspace(action,(e->>'stoneId')::bigint,coalesce((e->>'revision')::bigint,0),e->>'liveVersion',req,d,'00000000-0000-4000-8000-000000000092','editor');
$$;
do $$
declare d jsonb; e jsonb; original jsonb; live jsonb; replay jsonb; req uuid:=gen_random_uuid(); sid bigint; vid bigint; fid bigint; mid bigint; pid bigint; aid bigint; f jsonb; denied boolean; old_revision bigint;
begin
 select id into fid from public.finish_definitions where finish_key='fixture-flamed';
 select id into mid from public.media_assets where source_url='/images/fixture.png';
 f:=jsonb_build_object('definitionId',fid,'capability','yes','behaviorNote','Public description','sources',jsonb_build_array('PRIVATE SOURCE'),'internalNote','PRIVATE FINISH NOTE','images',jsonb_build_array(jsonb_build_object('key','img-one','id',null,'mediaAssetId',mid,'role','primary')));
 d:=jsonb_build_object('schemaVersion',1,'stone',jsonb_build_object('id',null,'slug','fixture-stone','name','Fixture Stone','type','Granite','availability','tbc','summary','Public introduction','sourceName','PRIVATE SOURCE','originRegion','PRIVATE REGION','originCountry','PRIVATE COUNTRY','pricingNote','','priceTier',null,'blockLength',null,'blockWidth',null,'blockHeight',null,'internalNote','PRIVATE NOTE','cutOptions',jsonb_build_array(jsonb_build_object('cutOrientation','cross','available',true,'sources',jsonb_build_array('PRIVATE CUT')))),
 'variants',jsonb_build_array(jsonb_build_object('key','variant-one','id',null,'slug','fixture-stone','label','','type','none','enabled',true,'finishes',jsonb_build_array(f))));
 e:=pg_temp.write_stone('save',null,d,req); sid:=(e->>'stoneId')::bigint;
 perform pg_temp.check(e->>'revision'='1','new parent allocated and complete draft saved');
 replay:=pg_temp.write_stone('save',null,d,req);
 perform pg_temp.check(replay->>'stoneId'=e->>'stoneId' and replay->>'replayed'='true','duplicate save returns original receipt without a second stone');
 denied:=false;begin perform pg_temp.write_stone('save',null,jsonb_set(d,'{stone,name}','"Other"'),req);exception when unique_violation then denied:=true;end;
 perform pg_temp.check(denied,'same request ID with different payload rejected');
 perform pg_temp.check((select status='draft' from public.stone_groups where id=sid),'save cannot publish');
 perform pg_temp.check(jsonb_array_length(public.public_stone_catalogue()->'stones')=0,'anonymous catalogue does not expose private draft');
 original:=e;
 e:=pg_temp.write_stone('publish',e,e->'draft');
 vid:=(e->'draft'->'variants'->0->>'id')::bigint;
 perform pg_temp.check(e->>'status'='published' and vid is not null,'Editor can atomically publish parent and variants');
 live:=public.public_stone_catalogue();
 perform pg_temp.check(live::text not like '%PRIVATE%','public catalogue excludes internal notes, origin and cut sources');
 perform pg_temp.check(live->'stones'->0->'draft'->'stone'->>'availability'='tbc','Upcoming supply state survives publication');
 perform pg_temp.check(live->'stones'->0->'draft'->'variants'->0->'finishes'->0->'images'->0->>'mediaAssetId'=mid::text,'published finish uses its exact image');
 d:=jsonb_set(e->'draft','{stone,name}','"Unpublished changed name"');original:=e;e:=pg_temp.write_stone('save',e,d);
 perform pg_temp.check((select display_name='Fixture Stone' from public.stone_groups where id=sid),'editing a live stone remains isolated in private draft');
 perform pg_temp.check(public.public_stone_catalogue()=live,'public catalogue unchanged after draft save');
 denied:=false;begin perform pg_temp.write_stone('save',original,d);exception when serialization_failure then denied:=true;end;
 perform pg_temp.check(denied,'stale editor revision conflicts instead of overwriting');
 old_revision:=(e->>'revision')::bigint;
 denied:=false;begin perform public.admin_stone_workspace('save',sid,old_revision,e->>'liveVersion',gen_random_uuid(),d,'00000000-0000-4000-8000-000000000093','viewer');exception when insufficient_privilege then denied:=true;end;
 perform pg_temp.check(denied,'Viewer cannot save');
 d:=jsonb_set(d,'{stone,slug}','"renamed-address"');denied:=false;begin perform pg_temp.write_stone('save',e,d);exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'published address remains fixed');
 e:=pg_temp.write_stone('publish',e,e->'draft');
 perform pg_temp.check((e->'draft'->'variants'->0->>'id')::bigint=vid,'publishing again preserves variant IDs');
 insert into public.products(slug,name,status) values('fixture-product','Fixture Product','published') returning id into pid;
 insert into public.product_material_defaults(product_id,material_category,stone_group_id) values(pid,'body',sid);
 denied:=false;begin perform pg_temp.write_stone('archive',e,e->'draft');exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'public Product reference blocks hiding');
 update public.products set status='draft' where id=pid;
 insert into public.projects(slug,title,status,claim_review_status) values('fixture-project','Fixture Project','published','approved') returning id into pid;
 insert into public.project_materials(project_id,stone_group_id,stone_variant_id,finish_definition_id,application,status,claim_status) values(pid,sid,vid,fid,'Fixture paving','published','approved');
 d:=jsonb_set(e->'draft','{variants,0,finishes,0,capability}','"no"');
 denied:=false;begin perform pg_temp.write_stone('publish',e,d);exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'public Project finish cannot be disabled');
 d:=jsonb_set(e->'draft','{variants,0,finishes,0,images}','[]');
 denied:=false;begin perform pg_temp.write_stone('publish',e,d);exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'last required finish image cannot be removed');
 denied:=false;begin update public.media_assets set status='archived' where id=mid;set constraints all immediate;exception when check_violation then denied:=true;end;
 set constraints all deferred;
 perform pg_temp.check(denied,'shared image archive cannot break published stone');
 update public.projects set status='draft' where id=pid;
 insert into public.articles(slug,title,status) values('fixture-article','Fixture Article','published') returning id into aid;
 insert into public.article_blocks(article_id,block_type,content,status) values(aid,'rich_text',jsonb_build_object('body','Read /stone-library/fixture-stone for more'),'published');
 denied:=false;begin perform pg_temp.write_stone('archive',e,e->'draft');exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'explicit Article URL blocks hiding');
 update public.articles set status='draft' where id=aid;
 e:=pg_temp.write_stone('archive',e,e->'draft');
 perform pg_temp.check(e->>'status'='archived' and e->'draft'->'variants'->0->>'enabled'='true','hide retains a restorable complete draft');
 perform pg_temp.check(public.public_stone_catalogue()->'managedKeys' ? 'fixture-stone' and jsonb_array_length(public.public_stone_catalogue()->'stones')=0,'hidden stone has tombstone with no public content');
 denied:=false;begin update public.products set status='published' where slug='fixture-product';set constraints all immediate;exception when check_violation then denied:=true;end;
 set constraints all deferred;
 perform pg_temp.check(denied,'later Product publication cannot create reference to hidden stone');
 e:=pg_temp.write_stone('publish',e,e->'draft');
 perform pg_temp.check(e->>'status'='published','hidden stone can be restored with same ID');
 perform pg_temp.check((select count(*)>=4 from private.stone_history where stone_id=sid),'original and published snapshots retained');
 perform pg_temp.check(not has_table_privilege('authenticated','public.stone_groups','UPDATE'),'browser canonical writes revoked');
 perform pg_temp.check(not has_function_privilege('authenticated','public.admin_stone_workspace(text,bigint,bigint,text,uuid,jsonb,uuid,text,jsonb)','EXECUTE'),'browser cannot impersonate actor through RPC');
 perform pg_temp.check(not has_table_privilege('anon','private.stone_drafts','SELECT'),'anonymous draft access denied');
end;
$$;
set constraints all immediate;
rollback;
