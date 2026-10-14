-- Local fixture only (NOW-PROJECT-BLOCKS-001). Run against a disposable database that has every
-- migration BEFORE 20261014120000_project_blocks.sql applied, for example:
--   psql "$DISPOSABLE_DATABASE_URL" -f scripts/fixtures/project-blocks.sql
-- It seeds old-shape Projects (project_media blocks, schema-version-1 private drafts), applies the
-- block migration inside its own transaction, checks the copy and the draft reshape, exercises
-- the aggregate RPC (save, publish, adopt, archive blocks, legacy drafts, roles) and the Stone
-- Library reference guard, then rolls everything back. Never run this against production.
\set ON_ERROR_STOP on
begin;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-0000000000a1','blocks-owner@example.invalid'),
 ('00000000-0000-4000-8000-0000000000a2','blocks-editor@example.invalid'),
 ('00000000-0000-4000-8000-0000000000a3','blocks-viewer@example.invalid');
insert into public.admin_profiles(user_id,email,role) values
 ('00000000-0000-4000-8000-0000000000a1','blocks-owner@example.invalid','owner'),
 ('00000000-0000-4000-8000-0000000000a2','blocks-editor@example.invalid','editor'),
 ('00000000-0000-4000-8000-0000000000a3','blocks-viewer@example.invalid','viewer');
insert into public.finish_definitions(finish_key,display_name) values('fixture-blocks-flamed','Flamed');
insert into public.media_assets(status,source_kind,source_url,media_type,alt) values
 ('published','external_legacy','/images/blocks-one.jpg','image','Granite entry paving'),
 ('published','external_legacy','/images/blocks-two.jpg','image','Material placement photograph'),
 ('published','external_legacy','/images/blocks-three.jpg','image','Gallery photograph'),
 ('published','external_legacy','/images/blocks-four.jpg','image','Fabrication step photograph');

-- Old shape: a Published, approved Project with three body media rows, an archived one and a
-- legacy hero row (not a body block), plus a Draft Project with one draft image.
do $$
declare p bigint; q bigint; m1 bigint; m2 bigint; map1 bigint; owner uuid := '00000000-0000-4000-8000-0000000000a1';
begin
 select id into m1 from public.media_assets where source_url='/images/blocks-one.jpg';
 select id into m2 from public.media_assets where source_url='/images/blocks-two.jpg';
 insert into public.projects(slug,title,status,claim_review_status,summary,hero_media_id,published_at)
  values('fixture-blocks','Fixture Blocks','published','approved','Synthetic project.',m1,now()) returning id into p;
 insert into public.projects(slug,title,status,claim_review_status) values('fixture-blocks-draft','Fixture Draft','draft','approved') returning id into q;
 insert into public.project_material_maps(project_id,media_asset_id,title,status) values(p,m2,'Stone and finish placement','published') returning id into map1;
 insert into public.project_media(project_id,media_asset_id,media_role,label,caption,block_title,sort_order,status) values
  (p,m1,'normal_image','Context','The entry.','Entry view',0,'published');
 insert into public.project_media(project_id,media_asset_id,project_material_map_id,media_role,block_title,sort_order,status) values
  (p,m2,map1,'hotspot_image','Where the stone is',1,'published');
 insert into public.project_media(project_id,media_role,youtube_url,block_title,caption,sort_order,status) values
  (p,'youtube_video','https://youtu.be/abcdefghijk','Installation film','Two minutes.',2,'published');
 insert into public.project_media(project_id,media_asset_id,media_role,label,sort_order,status,archived_at) values
  (p,m2,'normal_image','Retired',3,'archived',now());
 insert into public.project_media(project_id,media_asset_id,media_role,sort_order,status) values(p,m1,'hero',0,'published');
 insert into public.project_media(project_id,media_asset_id,media_role,sort_order,status) values(q,m2,'normal_image',0,'draft');
 insert into private.project_drafts(project_id,draft,revision,base_updated_at,published_revision,created_by,updated_by,published_at)
 select p, jsonb_build_object(
   'project', jsonb_build_object('id',p,'status','published','slug','fixture-blocks','title','Fixture Blocks','location','',
     'projectDateLabel','','completedOn','','summary','Synthetic project.','lead','','client','','landscapeArchitect','',
     'contractor','','address','','quantityLabel','','carbonStatus','','carbonNote','','claimReviewStatus','approved',
     'heroMediaId',m1,'coverMediaId',null,'sortOrder',0),
   'facts','[]'::jsonb,'materials','[]'::jsonb,
   'maps', jsonb_build_array(jsonb_build_object('key','map:'||map1,'id',map1,'mediaAssetId',m2,'title','Stone and finish placement','intro','','sortOrder',0)),
   'mediaBlocks', (select jsonb_agg(jsonb_build_object('key','media:'||pm.id,'id',pm.id,'mediaRole',pm.media_role,
       'mediaAssetId',case when pm.media_role='normal_image' then pm.media_asset_id end,
       'projectMaterialMapKey',case when pm.project_material_map_id is not null then 'map:'||pm.project_material_map_id end,
       'blockTitle',coalesce(pm.block_title,''),'youtubeUrl',coalesce(pm.youtube_url,''),'label',coalesce(pm.label,''),
       'caption',coalesce(pm.caption,''),'sortOrder',pm.sort_order) order by pm.sort_order)
     from public.project_media pm where pm.project_id=p and pm.status='published' and pm.media_role<>'hero')
     || jsonb_build_array(jsonb_build_object('key','media:new:unsaved','id',null,'mediaRole','normal_image','mediaAssetId',m2,
       'projectMaterialMapKey',null,'blockTitle','','youtubeUrl','','label','Unsaved','caption','','sortOrder',3)),
   'hotspots','[]'::jsonb),
  1, updated_at, 1, owner, owner, now()
 from public.projects where id=p;
end;
$$;

\ir ../../supabase/migrations/20261014120000_project_blocks.sql

create function pg_temp.check(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end;$$;
-- Calls the aggregate RPC with the stored draft's current revision and baseline.
create function pg_temp.agg(action text, pid bigint, d jsonb, actor uuid default '00000000-0000-4000-8000-0000000000a1', actor_role text default 'owner')
returns jsonb language plpgsql as $$
declare r bigint; b timestamptz;
begin
 select revision, base_updated_at into r, b from private.project_drafts where project_id=pid;
 return public.admin_project_aggregate(action,pid,coalesce(r,0),b,d,actor,actor_role,'[]'::jsonb);
end;$$;

do $$
declare p bigint; q bigint; m1 bigint; m2 bigint; m3 bigint; m4 bigint; map1 bigint; d jsonb; e jsonb; ids bigint[]; copied record;
 n integer; denied boolean; sid bigint; fid bigint; vid bigint; f jsonb; sd jsonb; se jsonb; video_id bigint;
begin
 select id into p from public.projects where slug='fixture-blocks';
 select id into q from public.projects where slug='fixture-blocks-draft';
 select id into m1 from public.media_assets where source_url='/images/blocks-one.jpg';
 select id into m2 from public.media_assets where source_url='/images/blocks-two.jpg';
 select id into m3 from public.media_assets where source_url='/images/blocks-three.jpg';
 select id into m4 from public.media_assets where source_url='/images/blocks-four.jpg';
 select id into map1 from public.project_material_maps where project_id=p;

 -- 1. Copy: one block per body media row, any status; project_media untouched.
 perform pg_temp.check((select count(*) from public.project_media where project_id in (p,q))=6,'project_media keeps all six rows');
 perform pg_temp.check((select count(*) from public.project_blocks where project_id=p)=4 and (select count(*) from public.project_blocks where project_id=q)=1,'every normal/hotspot/video media row became one block; the hero row did not');
 perform pg_temp.check((select array_agg(block_type order by sort_order) from public.project_blocks where project_id=p and status='published')=array['image','hotspot_image','video'],'published body keeps type and order');
 perform pg_temp.check((select count(*) from public.project_blocks where project_id=p and status='archived')=1 and (select status from public.project_blocks where project_id=q)='draft','archived and draft rows keep their status');
 select * into copied from public.project_blocks where project_id=p and block_type='image' and status='published';
 perform pg_temp.check(copied.block_key='block:'||copied.id and copied.media_asset_id=m1
   and copied.content->>'alt'='Granite entry paving' and copied.content->>'label'='Context' and copied.content->>'caption'='The entry.'
   and copied.content->>'title'='Entry view' and (copied.content->>'legacyProjectMediaId')::bigint=(select id from public.project_media where project_id=p and media_role='normal_image' and status='published'),
   'image block keeps media, words, key and source row id');
 perform pg_temp.check((select project_material_map_id=map1 and media_asset_id=m2 and content->>'title'='Where the stone is' and not content ? 'projectMaterialMapKey'
   from public.project_blocks where project_id=p and block_type='hotspot_image'),'points block keeps its map in the map column');
 perform pg_temp.check((select content->>'youtubeUrl'='https://youtu.be/abcdefghijk' and media_asset_id is null from public.project_blocks where project_id=p and block_type='video'),'video block keeps its YouTube link');

 -- 2. Draft reshape.
 select draft into d from private.project_drafts where project_id=p;
 perform pg_temp.check(d->'schemaVersion'='2'::jsonb and not d ? 'mediaBlocks' and jsonb_array_length(d->'blocks')=4,'draft has schemaVersion 2, blocks and no mediaBlocks');
 perform pg_temp.check((d->'blocks'->0->>'id')::bigint=copied.id and d->'blocks'->0->>'key'='block:'||copied.id and d->'blocks'->0->'content'->>'alt'='Granite entry paving','saved media block takes its copied row id, key and description');
 perform pg_temp.check(d->'blocks'->1->'content'->>'projectMaterialMapKey'='map:'||map1 and d->'blocks'->2->>'type'='video','points and video blocks reshaped');
 perform pg_temp.check(d->'blocks'->3->>'id' is null and d->'blocks'->3->>'key'='block:legacy:media:new:unsaved' and (d->'blocks'->3->'content'->>'mediaAssetId')::bigint=m2,'unsaved media block becomes a new block');

 -- 3. Public boundary and grants.
 set local role anon;
 perform pg_temp.check((select count(*) from public.project_blocks)=3,'anonymous readers see only Published blocks of the Published, approved Project');
 reset role;
 perform pg_temp.check(not has_table_privilege('anon','public.project_blocks','INSERT') and not has_table_privilege('authenticated','public.project_blocks','UPDATE')
   and not has_table_privilege('authenticated','public.project_blocks','DELETE') and has_table_privilege('anon','public.project_blocks','SELECT'),'browser roles read project_blocks only');
 perform pg_temp.check(not has_function_privilege('authenticated','private.project_upgrade_draft(jsonb)','EXECUTE')
   and not has_function_privilege('authenticated','public.admin_project_aggregate(text,bigint,bigint,timestamptz,jsonb,uuid,text,jsonb)','EXECUTE'),'browser cannot call the helpers or the RPC');

 -- 4. Publish the reshaped draft: existing rows are kept, the unsaved block is inserted.
 select array_agg(id order by id) into ids from public.project_blocks where project_id=p;
 e:=pg_temp.agg('publish',p,d);
 perform pg_temp.check(e->>'status'='published' and e->'draft'->'schemaVersion'='2'::jsonb,'publish returns the block draft');
 perform pg_temp.check((select array_agg(id order by sort_order) from public.project_blocks where project_id=p and status='published')[1:3]=(select array_agg(x) from unnest(ids) x where x<>(select id from public.project_blocks where project_id=p and status='archived' and content->>'label'='Retired'))
   ,'republishing keeps the copied row ids');
 perform pg_temp.check((select count(*) from public.project_blocks where project_id=p and status='published')=4 and (e->'draft'->'blocks'->3->>'id') is not null,'the unsaved block is published with a row id');
 perform pg_temp.check((select count(*) from public.project_media where project_id=p and status='published')=4,'publish no longer writes project_media');

 -- 5. A cached older editor's mediaBlocks draft is upgraded on Save and adopted on Publish.
 d:=((e->'draft') - 'blocks' - 'schemaVersion') || jsonb_build_object('mediaBlocks', jsonb_build_array(
   jsonb_build_object('key','media:legacy-client','id',(select (content->>'legacyProjectMediaId')::bigint from public.project_blocks where id=copied.id),'mediaRole','normal_image','mediaAssetId',m1,
     'projectMaterialMapKey',null,'blockTitle','','youtubeUrl','','label','Context again','caption','','sortOrder',0)));
 e:=pg_temp.agg('save',p,d);
 perform pg_temp.check(e->'draft'->'schemaVersion'='2'::jsonb and not (e->'draft') ? 'mediaBlocks' and e->'draft'->'blocks'->0->>'type'='image'
   and e->'draft'->'blocks'->0->>'id' is null and (select draft->'blocks'->0->'content'->>'label' from private.project_drafts where project_id=p)='Context again','legacy Save is stored in the block shape');
 e:=pg_temp.agg('publish',p,e->'draft');
 perform pg_temp.check((e->'draft'->'blocks'->0->>'id')::bigint=copied.id,'legacy Publish adopts the row copied from the same media row');
 perform pg_temp.check((select array_agg(block_type) from public.project_blocks where project_id=p and status='published')=array['image'] and (select count(*) from public.project_blocks where project_id=p)=5,'omitted blocks are archived, never deleted');
 perform pg_temp.check((select content->>'alt' from public.project_blocks where id=copied.id)='','the RPC stores the content it is given (the Function fills descriptions before Publish)');

 -- 6. Every block type publishes; references land in their columns.
 d:=jsonb_set(e->'draft','{blocks}', (e->'draft'->'blocks') || jsonb_build_array(
   jsonb_build_object('key','block:new:heading','id',null,'type','heading','sortOrder',1,'content',jsonb_build_object('eyebrow','Background','title','Why stone','intro','')),
   jsonb_build_object('key','block:new:text','id',null,'type','text','sortOrder',2,'content',jsonb_build_object('body','Body with **bold**.')),
   jsonb_build_object('key','block:new:quote','id',null,'type','quote','sortOrder',3,'content',jsonb_build_object('quote','Buildable.','attribution','A. Designer','role','')),
   jsonb_build_object('key','block:new:callout','id',null,'type','callout','sortOrder',4,'content',jsonb_build_object('title','','body','Note.','tone','lime')),
   jsonb_build_object('key','block:new:stats','id',null,'type','stats','sortOrder',5,'content',jsonb_build_object('items',jsonb_build_array(jsonb_build_object('value','1,200','unit','m²','label','Paving')),'caption','')),
   jsonb_build_object('key','block:new:steps','id',null,'type','steps','sortOrder',6,'content',jsonb_build_object('intro','','items',jsonb_build_array(jsonb_build_object('title','Cut','body','Blocks cut.','mediaAssetId',m4,'alt','Cutting')))),
   jsonb_build_object('key','block:new:spec','id',null,'type','spec_table','sortOrder',7,'content',jsonb_build_object('title','','rows',jsonb_build_array(jsonb_build_object('label','Finish','value','Flamed')))),
   jsonb_build_object('key','block:new:compare','id',null,'type','comparison_table','sortOrder',8,'content',jsonb_build_object('title','','columns',jsonb_build_array('A','B'),'rows',jsonb_build_array(jsonb_build_object('label','Slip','cells',jsonb_build_array('P5','P4'))))),
   jsonb_build_object('key','block:new:gallery','id',null,'type','gallery','sortOrder',9,'content',jsonb_build_object('items',jsonb_build_array(jsonb_build_object('mediaAssetId',m3,'alt','One'),jsonb_build_object('mediaAssetId',m4,'alt','Two')))),
   jsonb_build_object('key','block:new:points','id',null,'type','hotspot_image','sortOrder',10,'content',jsonb_build_object('projectMaterialMapKey','map:'||map1,'title','','label','','caption','')),
   jsonb_build_object('key','block:new:video','id',null,'type','video','sortOrder',11,'content',jsonb_build_object('youtubeUrl','https://www.youtube.com/watch?v=abcdefghijk','title','Film','label','','caption','')),
   jsonb_build_object('key','block:new:cta','id',null,'type','cta','sortOrder',12,'content',jsonb_build_object('title','Talk to us','body','','primary',jsonb_build_object('label','Discuss a project','href','/contact'),'secondary',null))));
 e:=pg_temp.agg('publish',p,d);
 perform pg_temp.check((select count(*) from public.project_blocks where project_id=p and status='published')=13,'all body block types publish');
 perform pg_temp.check((select project_material_map_id=map1 and media_asset_id=m2 from public.project_blocks where project_id=p and block_key='block:new:points'),'new points block stores its map and map image');
 perform pg_temp.check((select media_asset_id is null and content->'items'->1->>'mediaAssetId'=m4::text from public.project_blocks where project_id=p and block_key='block:new:gallery'),'gallery keeps its media in content');
 perform pg_temp.check((select count(*) from public.project_blocks where project_id=p and status='published' and linked_stone_group_ids<>'{}')=0,'only stone cards carry stone links');
 select id into video_id from public.project_blocks where project_id=p and block_key='block:new:video';

 -- 7. Publish integrity in the transaction.
 denied:=false;begin perform pg_temp.agg('publish',p,jsonb_set(e->'draft','{blocks}',(e->'draft'->'blocks') || jsonb_build_array(jsonb_build_object('key','block:new:video-two','id',null,'type','video','sortOrder',13,'content',jsonb_build_object('youtubeUrl','abcdefghijk')))));
  exception when sqlstate 'PGRST' then denied:=true; end;
 perform pg_temp.check(denied,'a second video is refused');
 denied:=false;begin perform pg_temp.agg('publish',p,jsonb_set(e->'draft','{blocks,0,content,mediaAssetId}','null'));
  exception when sqlstate 'PGRST' then denied:=true; end;
 perform pg_temp.check(denied,'an image block without an image is refused');
 denied:=false;begin perform pg_temp.agg('publish',p,jsonb_set(e->'draft','{blocks,0,type}','"banner"'));
  exception when invalid_parameter_value then denied:=true; end;
 perform pg_temp.check(denied,'an unknown block type is refused');
 denied:=false;begin perform pg_temp.agg('publish',p,jsonb_set(e->'draft','{blocks,1,id}',to_jsonb((select id from public.project_blocks where project_id=q))));
  exception when insufficient_privilege then denied:=true; end;
 perform pg_temp.check(denied,'a block row of another Project cannot be claimed');
 denied:=false;begin perform pg_temp.agg('save',p,e->'draft','00000000-0000-4000-8000-0000000000a3','viewer');
  exception when insufficient_privilege then denied:=true; end;
 perform pg_temp.check(denied,'Viewer cannot save');
 e:=pg_temp.agg('publish',p,e->'draft','00000000-0000-4000-8000-0000000000a2','editor');
 perform pg_temp.check(e->>'status'='published' and (select id from public.project_blocks where project_id=p and block_key='block:new:video')=video_id,'Editor publishes; block ids stay stable');

 -- 8. Stone cards: Live stones only, and the Stone Library guard protects them.
 select id into fid from public.finish_definitions where finish_key='fixture-blocks-flamed';
 f:=jsonb_build_object('definitionId',fid,'capability','yes','behaviorNote','','sources','[]'::jsonb,'internalNote','','images',jsonb_build_array(jsonb_build_object('key','img','id',null,'mediaAssetId',m3,'role','primary')));
 sd:=jsonb_build_object('schemaVersion',1,'stone',jsonb_build_object('id',null,'slug','fixture-blocks-stone','name','Fixture Blocks Stone','type','Granite','availableAs',jsonb_build_array('pavers'),'summary','','sourceName','','originRegion','','originCountry','','pricingNote','','priceTier',null,'blockLength',null,'blockWidth',null,'blockHeight',null,'internalNote','','cutOptions','[]'::jsonb),
  'variants',jsonb_build_array(jsonb_build_object('key','v','id',null,'slug','fixture-blocks-stone','label','','type','none','enabled',true,'finishes',jsonb_build_array(f))));
 se:=public.admin_stone_workspace('save',null,0,null,gen_random_uuid(),sd,'00000000-0000-4000-8000-0000000000a1','owner');
 sid:=(se->>'stoneId')::bigint;
 d:=jsonb_set(e->'draft','{blocks}',(e->'draft'->'blocks') || jsonb_build_array(jsonb_build_object('key','block:new:stones','id',null,'type','stone_cards','sortOrder',13,
   'content',jsonb_build_object('title','Stones','items',jsonb_build_array(jsonb_build_object('stoneGroupId',sid,'finishKey','fixture-blocks-flamed','note','Paving'))))));
 denied:=false;begin perform pg_temp.agg('publish',p,d);exception when sqlstate 'PGRST' then denied:=true; end;
 perform pg_temp.check(denied,'stone cards cannot publish a Draft stone');
 perform pg_temp.check((select count(*) from jsonb_array_elements(private.stone_usage(sid)) r where r->>'source'='draft' and r->>'module'='projects')=0,'nothing saved yet');
 e:=pg_temp.agg('save',p,d);
 perform pg_temp.check((select count(*) from jsonb_array_elements(private.stone_usage(sid)) r where r->>'source'='draft' and r->>'module'='projects')=1,'a saved stone card is listed as a draft Stone Library reference');
 se:=public.admin_stone_workspace('publish',sid,(se->>'revision')::bigint,se->>'liveVersion',gen_random_uuid(),se->'draft','00000000-0000-4000-8000-0000000000a1','owner');
 e:=pg_temp.agg('publish',p,e->'draft');
 perform pg_temp.check((select linked_stone_group_ids=array[sid] from public.project_blocks where project_id=p and block_key='block:new:stones'),'stone card links its stone');
 perform pg_temp.check(exists(select 1 from jsonb_array_elements(private.stone_usage(sid)) r where (r->>'live')::boolean and r->>'module'='projects'),'a published stone card is a live Stone Library reference');
 denied:=false;begin perform public.admin_stone_workspace('archive',sid,(se->>'revision')::bigint,se->>'liveVersion',gen_random_uuid(),se->'draft','00000000-0000-4000-8000-0000000000a1','owner');
  exception when check_violation then denied:=true; end;
 perform pg_temp.check(denied,'a stone shown in a published stone card cannot be hidden');
 denied:=false;begin update public.stone_groups set status='draft' where id=sid; set constraints all immediate; exception when check_violation then denied:=true; end;
 set constraints all deferred;
 perform pg_temp.check(denied,'the deferred reference guard also protects stone cards');

 -- 9. Hide archives every block and leaves project_media alone.
 select count(*) into n from public.project_blocks where project_id=p;
 e:=pg_temp.agg('archive',p,e->'draft');
 perform pg_temp.check((select count(*) from public.project_blocks where project_id=p and status<>'archived')=0,'Hide archives every body block');
 perform pg_temp.check((select count(*) from public.project_blocks where project_id=p)=n,'Hide deletes nothing');
 perform pg_temp.check((select count(*) from public.project_media where project_id in (p,q))=6,'project_media still has all six rows');
 set local role anon;
 perform pg_temp.check((select count(*) from public.project_blocks)=0,'hidden Project exposes no blocks');
 reset role;
end;
$$;
set constraints all immediate;
rollback;
