import{j as N,g as C,f as B}from"./index-C4dT9yXW.js";import{p as w}from"./publicEntitySeo-CgpviqMQ.js";import{r as S}from"./publicMediaUrl-BCnm8sfh.js";import{t as f,o as K}from"./publicContentOverlay-C9qA3frw.js";const q="/storage/v1/object/public/",O="/storage/v1/render/image/public/",D="urblo-public-media",F={card:{widths:[480,768,960,1280],fallbackWidth:960,quality:82,sizes:"(min-width: 1024px) calc((100vw - 96px) / 3), (min-width: 640px) calc((100vw - 64px) / 2), calc(100vw - 40px)"},list:{widths:[240,360,480],fallbackWidth:360,quality:82,sizes:"(min-width: 768px) 120px, calc(100vw - 40px)"},hero:{widths:[960,1440,1920,2500],fallbackWidth:1920,quality:88,sizes:"100vw"},detail:{widths:[768,1280,1920,2500],fallbackWidth:1920,quality:86,sizes:"(min-width: 1280px) 1200px, calc(100vw - 40px)"},hotspot:{widths:[768,1280,1920,2500],fallbackWidth:1920,quality:86,sizes:"(min-width: 1280px) 820px, (min-width: 1024px) calc(100vw - 440px), calc(100vw - 40px)"}};function Q(t){try{const e=new URL(t);if(e.protocol!=="https:"||!e.hostname.endsWith(".supabase.co"))return null;const i=e.pathname.indexOf(q);return i===-1||!e.pathname.slice(i+q.length).startsWith(`${D}/`)?null:e}catch{return null}}function $(t,e,i){const o=Q(t);if(!o)return null;const n=Math.min(2500,Math.max(1,Math.round(e))),c=Math.min(100,Math.max(20,Math.round(i)));return o.pathname=o.pathname.replace(q,O),o.search="",o.searchParams.set("width",String(n)),o.searchParams.set("quality",String(c)),o.searchParams.set("format","webp"),o.searchParams.set("resize","contain"),o.toString()}function G(t,e){const i=F[e],o=$(t,i.fallbackWidth,i.quality);return o?{optimized:!0,src:o,srcSet:i.widths.map(n=>`${$(t,n,i.quality)} ${n}w`).join(", "),sizes:i.sizes}:{optimized:!1,src:t,srcSet:void 0,sizes:void 0}}function lt({src:t,profile:e,onError:i,decoding:o="async",...n}){const c=G(t,e);function s(l){const p=l.currentTarget;if(c.optimized&&p.dataset.originalFallbackApplied!=="true"){p.dataset.originalFallbackApplied="true",p.srcset="",p.sizes="",p.src=t;return}i==null||i(l)}return N.jsx("img",{...n,src:c.src,srcSet:c.srcSet,sizes:c.sizes,decoding:o,"data-project-image-profile":e,"data-original-src":c.optimized?t:void 0,onError:s})}function Y(t,e){return typeof t=="string"||Array.isArray(t)&&t.every(i=>typeof i=="string")?t:typeof e=="string"?e:""}function _(t){return Array.isArray(t)?t[0]??null:t??null}function H(t){var e;return((e=t==null?void 0:t.match(/\b(20\d{2}|19\d{2})\b/))==null?void 0:e[0])||""}function J(t){var e;return((e=t==null?void 0:t.match(/\b(NSW|QLD|SA|TAS|VIC|WA|ACT|NT)\b/))==null?void 0:e[0])||""}function V(t){return t==="yes"?"Yes":t==="no"?"No":t==="not_available"?"Not available":t==="tbc"?"To be confirmed":""}function X(t){const e=_(t.stone_groups),i=_(t.finish_definitions);if(!(e!=null&&e.stone_group_key)||!(i!=null&&i.finish_key))return null;const o=_(t.stone_variants);return{stoneGroupId:e.stone_group_key,stoneVariantId:o==null?void 0:o.variant_key,finishKey:i.finish_key,application:t.application,note:t.note||""}}function Z(t,e){if(!t.project_material_id)return null;const i=e.get(t.project_material_id),o=_(i==null?void 0:i.stone_groups),n=_(i==null?void 0:i.finish_definitions);if(!i||!(o!=null&&o.stone_group_key)||!(n!=null&&n.finish_key))return null;const c=_(i.stone_variants);return{id:t.hotspot_key,x:Number(t.x_percent),y:Number(t.y_percent),description:t.note||void 0,stoneGroupId:o.stone_group_key,stoneVariantId:c==null?void 0:c.variant_key,finishKey:n.finish_key,application:t.application||i.application,note:t.note||i.note||""}}function tt(t,e,i,o){const n=_(t.media_assets),c=S(n,o);return c?{image:c,imageAlt:(n==null?void 0:n.alt)||t.title||"Project material map",title:t.title||"Project material map",intro:t.intro||"",hotspots:e.slice().sort((s,l)=>(s.sort_order??0)-(l.sort_order??0)).map(s=>Z(s,i)).filter(s=>!!s)}:null}function et(t){const e=t.trim();if(!e.includes("/"))return e;try{const i=new URL(e);return i.hostname.includes("youtu.be")?i.pathname.replace(/^\//,"")||e:i.searchParams.get("v")||i.pathname.split("/").filter(Boolean).pop()||e}catch{return e.split("/").filter(Boolean).pop()||e}}function at(t,e,i=[],o=[],n=[],c=[],s=[]){var W;const l=_(t.cover_media),p=_(t.hero_media),h=S(l,e)||"/media/launch/contact/project-contact.jpg",P=S(p,e)||h,g=t.project_date_label||t.completed_on,x=H(g),d={};for(const a of i.slice().sort((u,m)=>(u.sort_order??0)-(m.sort_order??0)))d[a.fact_label]=Y(a.fact_value_json,a.fact_value);t.client&&!d.Client&&(d.Client=t.client),t.landscape_architect&&!d["Landscape Architect"]&&(d["Landscape Architect"]=t.landscape_architect),t.contractor&&!d.Contractor&&(d.Contractor=t.contractor),g&&!d.Date&&(d.Date=g),t.address&&!d.Address&&(d.Address=t.address),t.quantity_label&&!d.Quantity&&(d.Quantity=t.quantity_label);const y=V(t.carbon_status);y&&!d["Carbon Offset"]&&(d["Carbon Offset"]=t.carbon_note?`${y} — ${t.carbon_note}`:y);const k=n.slice().sort((a,u)=>(a.sort_order??0)-(u.sort_order??0)),A=new Map(k.map(a=>[a.id,a])),I=k.map(a=>X(a)).filter(a=>!!a),j=new Map;for(const a of s)j.set(a.project_material_map_id,[...j.get(a.project_material_map_id)??[],a]);const r=[];for(const a of c.slice().sort((u,m)=>(u.sort_order??0)-(m.sort_order??0))){const u=tt(a,j.get(a.id)??[],A,e);u&&r.push({row:a,value:u})}const M=new Map(r.map(a=>[a.row.id,a.value])),z=new Set,b=[];for(const a of o.slice().sort((u,m)=>(u.sort_order??0)-(m.sort_order??0))){if(a.media_role==="youtube_video"&&a.youtube_url){b.push({id:`${t.slug}-media-${a.id}`,type:"youtube_video",youtubeId:et(a.youtube_url),title:a.block_title||a.label||"Project video",caption:a.caption||void 0});continue}if(a.media_role==="hotspot_image"&&a.project_material_map_id){const v=M.get(a.project_material_map_id);if(!v)continue;const R=_(a.media_assets),L=S(R,e);z.add(a.project_material_map_id),b.push({id:`${t.slug}-media-${a.id}`,type:"hotspot_image",image:L||v.image,imageAlt:(R==null?void 0:R.alt)||v.imageAlt,title:a.block_title||v.title,intro:v.intro||void 0,caption:a.caption||void 0,hotspots:v.hotspots});continue}const u=_(a.media_assets),m=S(u,e);m&&b.push({id:`${t.slug}-media-${a.id}`,type:"normal_image",src:m,alt:(u==null?void 0:u.alt)||a.label||t.title,title:a.block_title||void 0,label:a.label||void 0,caption:a.caption||void 0})}for(const a of r)z.has(a.row.id)||b.push({id:`${t.slug}-hotspot-${a.row.id}`,type:"hotspot_image",image:a.value.image,imageAlt:a.value.imageAlt,title:a.value.title,intro:a.value.intro||void 0,hotspots:a.value.hotspots});const E=b.flatMap(a=>a.type==="normal_image"?[a.src]:a.type==="hotspot_image"?[a.image]:[]);return{slug:t.slug,name:t.title,contentSource:"cms",seo:w(t.seo),images:E,listing:{title:t.title,location:t.location||"",state:J(t.location),date:g||"",year:x,sector:"Project",category:"Civil landscape",cover:h,imageAlt:(l==null?void 0:l.alt)||t.title,summary:t.summary||void 0},hero:{image:P,alt:(p==null?void 0:p.alt)||(l==null?void 0:l.alt)||t.title},lead:t.lead||t.summary||void 0,story:t.summary?[t.summary]:void 0,details:d,materialMap:(W=r[0])==null?void 0:W.value,materials:I,mediaBlocks:b}}async function it(t){const e=t===void 0?await C():t;if(!e)return[];const{data:i,error:o}=await e.from("projects").select(`
      id,
      slug,
      title,
      location,
      project_date_label,
      completed_on,
      summary,
      lead,
      client,
      landscape_architect,
      contractor,
      address,
      quantity_label,
      carbon_status,
      carbon_note,
      seo,
      sort_order,
      cover_media:media_assets!projects_cover_media_id_fkey (
        status,
        source_kind,
        source_url,
        bucket,
        object_path,
        alt
      ),
      hero_media:media_assets!projects_hero_media_id_fkey (
        status,
        source_kind,
        source_url,
        bucket,
        object_path,
        alt
      )
    `).eq("status","published").order("sort_order",{ascending:!0});if(o||!(i!=null&&i.length))return[];const n=i,c=n.map(r=>r.id),s=new Map,l=new Map,p=new Map,h=new Map,P=new Map,[g,x,d,y]=await Promise.all([e.from("project_facts").select("project_id, fact_label, fact_value, fact_value_json, sort_order, status").in("project_id",c).eq("status","published").eq("claim_status","approved").order("sort_order",{ascending:!0}),e.from("project_media").select(`
        project_id,
        id,
        project_material_map_id,
        media_role,
        label,
        caption,
        block_title,
        youtube_url,
        sort_order,
        media_assets (
          status,
          source_kind,
          source_url,
          bucket,
          object_path,
          alt
        )
      `).in("project_id",c).eq("status","published").order("sort_order",{ascending:!0}),e.from("project_materials").select(`
        id,
        project_id,
        application,
        note,
        sort_order,
        status,
        stone_groups!project_materials_stone_group_id_fkey (
          stone_group_key
        ),
        stone_variants!project_materials_stone_variant_id_fkey (
          variant_key
        ),
        finish_definitions!project_materials_finish_definition_id_fkey (
          finish_key
        )
      `).in("project_id",c).eq("status","published").eq("claim_status","approved").order("sort_order",{ascending:!0}),e.from("project_material_maps").select(`
        id,
        project_id,
        title,
        intro,
        sort_order,
        status,
        media_assets!project_material_maps_media_asset_id_fkey (
          status,
          source_kind,
          source_url,
          bucket,
          object_path,
          alt
        )
      `).in("project_id",c).eq("status","published").order("sort_order",{ascending:!0})]);if(g.error||x.error||d.error||y.error)return[];const k=y.data??[],A=k.map(r=>r.id),I=A.length?await e.from("project_hotspots").select(`
          project_material_map_id,
          project_material_id,
          hotspot_key,
          x_percent,
          y_percent,
          label,
          application,
          note,
          sort_order,
          status,
          preview_media_id
        `).in("project_material_map_id",A).eq("status","published").order("sort_order",{ascending:!0}):{data:[],error:null};if(I.error)return[];for(const r of g.data??[])s.set(r.project_id,[...s.get(r.project_id)??[],r]);for(const r of x.data??[])l.set(r.project_id,[...l.get(r.project_id)??[],r]);for(const r of d.data??[])p.set(r.project_id,[...p.get(r.project_id)??[],r]);const j=new Map;for(const r of k)j.set(r.id,r.project_id),h.set(r.project_id,[...h.get(r.project_id)??[],r]);for(const r of I.data??[]){const M=j.get(r.project_material_map_id);M&&P.set(M,[...P.get(M)??[],r])}return n.map(r=>at(r,e,s.get(r.id),l.get(r.id),p.get(r.id),h.get(r.id),P.get(r.id)))}async function ot(t){const e=t===void 0?await C():t;if(!e)return[];const{data:i,error:o}=await e.rpc("get_archived_project_slugs",void 0,{get:!0});if(o||!Array.isArray(i))return[];const n=new Set(B.map(s=>f(s.slug))),c=new Set;for(const s of i){if(!s||typeof s!="object")continue;const l=s.slug;if(typeof l!="string")continue;const p=f(l);p&&n.has(p)&&c.add(p)}return[...c]}function T(t,e=[]){const i=new Map(B.map(s=>[f(s.slug),s])),o=new Set(e.map(s=>f(s)).filter(Boolean)),n=B.filter(s=>!o.has(f(s.slug))),c=t.map(s=>{const l=i.get(f(s.slug));return l?{...s,listing:{...s.listing,sector:l.listing.sector,category:l.listing.category},gallery:s.gallery??l.gallery,cta:s.cta??l.cta}:s});return K(n,c,s=>s.slug)}class U{static async getAll(){const e=await C();if(!e)return T([]);const[i,o]=await Promise.all([it(e),ot(e)]);return T(i,o)}static async getBySlug(e){const i=await U.getAll(),o=f(e);return i.find(n=>f(n.slug)===o)}}export{lt as P,U as a};
