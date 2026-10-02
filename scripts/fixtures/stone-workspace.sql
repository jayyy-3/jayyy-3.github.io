-- Local fixture only. Run against a disposable database with every Stone migration applied
-- (workspace, reference lockdown and Available as).
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
declare d jsonb; e jsonb; original jsonb; live jsonb; replay jsonb; req uuid:=gen_random_uuid(); sid bigint; vid bigint; fid bigint; mid bigint; pid bigint; aid bigint; f jsonb; denied boolean; old_revision bigint; n integer; oreq uuid:=gen_random_uuid();
begin
 select id into fid from public.finish_definitions where finish_key='fixture-flamed';
 select id into mid from public.media_assets where source_url='/images/fixture.png';
 f:=jsonb_build_object('definitionId',fid,'capability','yes','behaviorNote','Public description','sources',jsonb_build_array('PRIVATE SOURCE'),'internalNote','PRIVATE FINISH NOTE','images',jsonb_build_array(jsonb_build_object('key','img-one','id',null,'mediaAssetId',mid,'role','primary')));
 d:=jsonb_build_object('schemaVersion',1,'stone',jsonb_build_object('id',null,'slug','fixture-stone','name','Fixture Stone','type','Granite','availability','tbc','availableAs',jsonb_build_array('pavers','pavers'),'summary','Public introduction','sourceName','PRIVATE SOURCE','originRegion','PRIVATE REGION','originCountry','PRIVATE COUNTRY','pricingNote','','priceTier',null,'blockLength',null,'blockWidth',null,'blockHeight',null,'internalNote','PRIVATE NOTE','cutOptions',jsonb_build_array(jsonb_build_object('cutOrientation','cross','available',true,'sources',jsonb_build_array('PRIVATE CUT')))),
 'variants',jsonb_build_array(jsonb_build_object('key','variant-one','id',null,'slug','fixture-stone','label','','type','none','enabled',true,'finishes',jsonb_build_array(f))));
 e:=pg_temp.write_stone('save',null,d,req); sid:=(e->>'stoneId')::bigint;
 perform pg_temp.check(e->>'revision'='1','new parent allocated and complete draft saved');
 perform pg_temp.check(not (e->'draft'->'stone' ? 'availability') and e->'draft'->'stone'->'availableAs'='["pavers"]'::jsonb,'retired availability is stripped and Available as is stored de-duplicated');
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
 perform pg_temp.check(live->'stones'->0->'draft'->'stone'->'availableAs'='["pavers"]'::jsonb and not (live->'stones'->0->'draft'->'stone' ? 'availability'),'published Available as selection reaches the catalogue without the retired state');
 perform pg_temp.check((select available_as='{pavers}' from public.stone_groups where id=sid),'publication writes the canonical Available as column');
 perform pg_temp.check(jsonb_array_length(live->'availabilityOptions')=3 and live->'availabilityOptions'->0->>'key'='blocks','catalogue lists published options in order');
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

 insert into public.image_qr_resources(slug,name,object_path,mime_type,width_px,height_px,size_bytes,material_selection)
 values('fixture-stone-qr','Fixture QR','fixture-qr.png','image/png',1,1,100,jsonb_build_object('stoneGroupId','fixture-stone','stoneVariantId','fixture-stone','finishKey','fixture-flamed'));
 update public.articles set status='draft' where id=aid;
 denied:=false;begin perform pg_temp.write_stone('archive',e,e->'draft');exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'active Image QR material prevents hiding its stone');
 update public.image_qr_resources set status='hidden' where slug='fixture-stone-qr';
 perform pg_temp.check(private.stone_qr_default('Toscany · Cross Cut')->>'stoneVariantId'='tuscany--cross-cut' and private.stone_qr_default('Unknown')->>'stoneGroupId'='zen-grey','legacy QR defaults match source without rewriting resources');

 e:=pg_temp.write_stone('archive',e,e->'draft');
 perform pg_temp.check(e->>'status'='archived' and e->'draft'->'variants'->0->>'enabled'='true','hide retains a restorable complete draft');
 perform pg_temp.check(public.public_stone_catalogue()->'managedKeys' ? 'fixture-stone' and jsonb_array_length(public.public_stone_catalogue()->'stones')=0,'hidden stone has tombstone with no public content');
 denied:=false;begin update public.products set status='published' where slug='fixture-product';set constraints all immediate;exception when check_violation then denied:=true;end;
 set constraints all deferred;
 perform pg_temp.check(denied,'later Product publication cannot create reference to hidden stone');
 e:=pg_temp.write_stone('publish',e,e->'draft');
 perform pg_temp.check(e->>'status'='published','hidden stone can be restored with same ID');
 perform pg_temp.check((select count(*)>=4 from private.stone_history where stone_id=sid),'original and published snapshots retained');
 -- Available as: draft validation.
 denied:=false;begin perform pg_temp.write_stone('save',e,jsonb_set(e->'draft','{stone,availableAs}','["kerbs"]'));exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'unknown Available as option rejected');
 denied:=false;begin perform pg_temp.write_stone('save',e,e->'draft' #- '{stone,availableAs}');exception when invalid_parameter_value then denied:=true;end;
 perform pg_temp.check(denied,'draft without Available as rejected');
 -- Available as: option management.
 denied:=false;begin perform public.admin_stone_availability_options('create','00000000-0000-4000-8000-000000000092','editor',gen_random_uuid(),'{"name":"Kerbs"}');exception when insufficient_privilege then denied:=true;end;
 perform pg_temp.check(denied,'Editor cannot change Available as options');
 perform pg_temp.check(jsonb_array_length(public.admin_stone_availability_options('list','00000000-0000-4000-8000-000000000093','viewer',null,'{}')->'published')=3,'Viewer can list options');
 replay:=public.admin_stone_availability_options('create','00000000-0000-4000-8000-000000000091','owner',oreq,'{"name":"  Kerbs "}');
 perform pg_temp.check(replay->'published'->3->>'key'='kerbs' and replay->'published'->3->>'name'='Kerbs' and (replay->'published'->3->>'sortOrder')::int=40,'owner creates a trimmed option with a slug key at the end');
 perform pg_temp.check(public.admin_stone_availability_options('create','00000000-0000-4000-8000-000000000091','owner',oreq,'{"name":"  Kerbs "}')->>'replayed'='true','duplicate option request replays its receipt');
 denied:=false;begin perform public.admin_stone_availability_options('create','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),'{"name":"kerbs"}');exception when unique_violation then denied:=true;end;
 perform pg_temp.check(denied,'duplicate option name rejected');
 aid:=(replay->'published'->3->>'id')::bigint;
 d:=jsonb_set(e->'draft','{stone,availableAs}','["kerbs","blocks"]');e:=pg_temp.write_stone('save',e,d);
 perform pg_temp.check(e->'draft'->'stone'->'availableAs'='["blocks","kerbs"]'::jsonb,'saved selection follows option order');
 e:=pg_temp.write_stone('publish',e,e->'draft');
 perform pg_temp.check(public.public_stone_catalogue()->'stones'->0->'draft'->'stone'->'availableAs'='["blocks","kerbs"]'::jsonb,'new option published on the stone');
 replay:=public.admin_stone_availability_options('rename','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),jsonb_build_object('id',aid,'name','Kerb stones'));
 perform pg_temp.check((select option_key='kerbs' and display_name='Kerb stones' from public.stone_availability_options where id=aid),'rename keeps the key');
 denied:=false;begin perform public.admin_stone_availability_options('reorder','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),jsonb_build_object('ids',jsonb_build_array(aid)));exception when serialization_failure then denied:=true;end;
 perform pg_temp.check(denied,'stale reorder rejected');
 replay:=public.admin_stone_availability_options('reorder','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),jsonb_build_object('ids',(select jsonb_agg(id order by case when id=aid then 0 else 1 end,sort_order) from public.stone_availability_options where status='published')));
 perform pg_temp.check(replay->'published'->0->>'key'='kerbs' and (replay->'published'->0->>'sortOrder')::int=10,'reorder rewrites sort order');
 replay:=public.admin_stone_availability_options('archive','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),jsonb_build_object('id',aid));
 perform pg_temp.check(replay->'archived'->0->>'key'='kerbs' and jsonb_array_length(replay->'published')=3,'archive moves the option to Hidden options');
 perform pg_temp.check((select available_as='{blocks}' from public.stone_groups where id=sid) and (select draft->'stone'->'availableAs'='["blocks"]'::jsonb from private.stone_drafts where stone_id=sid),'archive removes the key from every stone and draft');
 perform pg_temp.check(public.public_stone_catalogue()->'stones'->0->'draft'->'stone'->'availableAs'='["blocks"]'::jsonb and not (public.public_stone_catalogue()->'availabilityOptions')::text like '%kerbs%','catalogue no longer shows the hidden option');
 replay:=public.admin_stone_availability_options('restore','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),jsonb_build_object('id',aid));
 perform pg_temp.check(jsonb_array_length(replay->'published')=4 and (select available_as='{blocks}' from public.stone_groups where id=sid),'restore does not re-add the option to stones');
 perform pg_temp.check((select count(*)=5 from public.admin_audit_events where entity_type='stone_availability_options'),'option writes are audited');
 for n in 1..20 loop perform public.admin_stone_availability_options('create','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),jsonb_build_object('name','Fixture option '||n)); end loop;
 denied:=false;begin perform public.admin_stone_availability_options('create','00000000-0000-4000-8000-000000000091','owner',gen_random_uuid(),'{"name":"One too many"}');exception when check_violation then denied:=true;end;
 perform pg_temp.check(denied,'published options are limited to 24');
 perform pg_temp.check(not has_table_privilege('authenticated','public.stone_availability_options','INSERT') and has_table_privilege('anon','public.stone_availability_options','SELECT'),'options are read-only for browser roles');
 perform pg_temp.check(not has_function_privilege('authenticated','public.admin_stone_availability_options(text,uuid,text,uuid,jsonb)','EXECUTE'),'browser cannot call the option RPC');
 perform pg_temp.check(not has_table_privilege('authenticated','public.stone_groups','UPDATE'),'browser canonical writes revoked');
 perform pg_temp.check(not has_function_privilege('authenticated','public.admin_stone_workspace(text,bigint,bigint,text,uuid,jsonb,uuid,text,jsonb)','EXECUTE'),'browser cannot impersonate actor through RPC');
 perform pg_temp.check(not has_table_privilege('anon','private.stone_drafts','SELECT'),'anonymous draft access denied');
end;
$$;
set constraints all immediate;
rollback;
