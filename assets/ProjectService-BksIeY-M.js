import{g as q,f as R}from"./index-C9LrqSnP.js";import{p as F}from"./publicEntitySeo-CgpviqMQ.js";import{r as y}from"./publicMediaUrl-BCnm8sfh.js";import{t as f,o as K}from"./publicContentOverlay-C9qA3frw.js";function L(t,o){return typeof t=="string"||Array.isArray(t)&&t.every(r=>typeof r=="string")?t:typeof o=="string"?o:""}function u(t){return Array.isArray(t)?t[0]??null:t??null}function O(t){var o;return((o=t==null?void 0:t.match(/\b(20\d{2}|19\d{2})\b/))==null?void 0:o[0])||""}function Q(t){var o;return((o=t==null?void 0:t.match(/\b(NSW|QLD|SA|TAS|VIC|WA|ACT|NT)\b/))==null?void 0:o[0])||""}function Y(t){return t==="yes"?"Yes":t==="no"?"No":t==="not_available"?"Not available":t==="tbc"?"To be confirmed":""}function G(t,o){const r=u(t.stone_groups),s=u(t.finish_definitions);if(!(r!=null&&r.stone_group_key)||!(s!=null&&s.finish_key))return null;const n=u(t.media_assets),l=y(n,o);return{stoneGroupId:r.stone_group_key,finishKey:s.finish_key,application:t.application,note:t.note||"",image:l||void 0,imageAlt:(n==null?void 0:n.alt)||void 0}}function U(t,o,r){if(!t.project_material_id)return null;const s=o.get(t.project_material_id),n=u(s==null?void 0:s.stone_groups),l=u(s==null?void 0:s.finish_definitions);if(!s||!(n!=null&&n.stone_group_key)||!(l!=null&&l.finish_key))return null;const a=u(t.preview_media)||u(s.media_assets),c=y(a,r);return{id:t.hotspot_key,x:Number(t.x_percent),y:Number(t.y_percent),title:t.label||void 0,description:t.note||void 0,stoneGroupId:n.stone_group_key,finishKey:l.finish_key,application:t.application||s.application,note:t.note||s.note||"",image:c||void 0,imageAlt:(a==null?void 0:a.alt)||void 0}}function z(t,o,r,s){const n=u(t.media_assets),l=y(n,s);return l?{image:l,imageAlt:(n==null?void 0:n.alt)||t.title||"Project material map",title:t.title||"Project material map",intro:t.intro||"",hotspots:o.slice().sort((a,c)=>(a.sort_order??0)-(c.sort_order??0)).map(a=>U(a,r,s)).filter(a=>!!a)}:null}function E(t){const o=t.trim();if(!o.includes("/"))return o;try{const r=new URL(o);return r.hostname.includes("youtu.be")?r.pathname.replace(/^\//,"")||o:r.searchParams.get("v")||r.pathname.split("/").filter(Boolean).pop()||o}catch{return o.split("/").filter(Boolean).pop()||o}}function H(t,o,r=[],s=[],n=[],l=[],a=[]){var N;const c=u(t.cover_media),p=u(t.hero_media),h=y(c,o)||"/media/launch/contact/project-contact.jpg",P=y(p,o)||h,g=t.project_date_label||t.completed_on,S=O(g),d={};for(const e of r.slice().sort((_,m)=>(_.sort_order??0)-(m.sort_order??0)))d[e.fact_label]=L(e.fact_value_json,e.fact_value);t.client&&!d.Client&&(d.Client=t.client),t.landscape_architect&&!d["Landscape Architect"]&&(d["Landscape Architect"]=t.landscape_architect),t.contractor&&!d.Contractor&&(d.Contractor=t.contractor),g&&!d.Date&&(d.Date=g),t.address&&!d.Address&&(d.Address=t.address),t.quantity_label&&!d.Quantity&&(d.Quantity=t.quantity_label);const j=Y(t.carbon_status);j&&!d["Carbon Offset"]&&(d["Carbon Offset"]=t.carbon_note?`${j} — ${t.carbon_note}`:j);const M=n.slice().sort((e,_)=>(e.sort_order??0)-(_.sort_order??0)),B=new Map(M.map(e=>[e.id,e])),I=M.map(e=>G(e,o)).filter(e=>!!e),b=new Map;for(const e of a)b.set(e.project_material_map_id,[...b.get(e.project_material_map_id)??[],e]);const i=[];for(const e of l.slice().sort((_,m)=>(_.sort_order??0)-(m.sort_order??0))){const _=z(e,b.get(e.id)??[],B,o);_&&i.push({row:e,value:_})}const A=new Map(i.map(e=>[e.row.id,e.value])),$=new Set,v=[];for(const e of s.slice().sort((_,m)=>(_.sort_order??0)-(m.sort_order??0))){if(e.media_role==="youtube_video"&&e.youtube_url){v.push({id:`${t.slug}-media-${e.id}`,type:"youtube_video",youtubeId:E(e.youtube_url),title:e.block_title||e.label||"Project video",caption:e.caption||void 0});continue}if(e.media_role==="hotspot_image"&&e.project_material_map_id){const k=A.get(e.project_material_map_id);if(!k)continue;const C=u(e.media_assets),D=y(C,o);$.add(e.project_material_map_id),v.push({id:`${t.slug}-media-${e.id}`,type:"hotspot_image",image:D||k.image,imageAlt:(C==null?void 0:C.alt)||k.imageAlt,title:e.block_title||k.title,intro:k.intro||void 0,caption:e.caption||void 0,hotspots:k.hotspots});continue}const _=u(e.media_assets),m=y(_,o);m&&v.push({id:`${t.slug}-media-${e.id}`,type:"normal_image",src:m,alt:(_==null?void 0:_.alt)||e.label||t.title,title:e.block_title||void 0,label:e.label||void 0,caption:e.caption||void 0})}for(const e of i)$.has(e.row.id)||v.push({id:`${t.slug}-hotspot-${e.row.id}`,type:"hotspot_image",image:e.value.image,imageAlt:e.value.imageAlt,title:e.value.title,intro:e.value.intro||void 0,hotspots:e.value.hotspots});const W=v.flatMap(e=>e.type==="normal_image"?[e.src]:e.type==="hotspot_image"?[e.image]:[]);return{slug:t.slug,name:t.title,contentSource:"cms",seo:F(t.seo),images:W,listing:{title:t.title,location:t.location||"",state:Q(t.location),date:g||"",year:S,sector:"Project",category:"Civil landscape",cover:h,imageAlt:(c==null?void 0:c.alt)||t.title,summary:t.summary||void 0},hero:{image:P,alt:(p==null?void 0:p.alt)||(c==null?void 0:c.alt)||t.title},lead:t.lead||t.summary||void 0,story:t.summary?[t.summary]:void 0,details:d,materialMap:(N=i[0])==null?void 0:N.value,materials:I,mediaBlocks:v}}async function J(t){const o=t===void 0?await q():t;if(!o)return[];const{data:r,error:s}=await o.from("projects").select(`
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
    `).eq("status","published").order("sort_order",{ascending:!0});if(s||!(r!=null&&r.length))return[];const n=r,l=n.map(i=>i.id),a=new Map,c=new Map,p=new Map,h=new Map,P=new Map,[g,S,d,j]=await Promise.all([o.from("project_facts").select("project_id, fact_label, fact_value, fact_value_json, sort_order, status").in("project_id",l).eq("status","published").eq("claim_status","approved").order("sort_order",{ascending:!0}),o.from("project_media").select(`
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
      `).in("project_id",l).eq("status","published").order("sort_order",{ascending:!0}),o.from("project_materials").select(`
        id,
        project_id,
        application,
        note,
        sort_order,
        status,
        stone_groups!project_materials_stone_group_id_fkey (
          stone_group_key
        ),
        finish_definitions!project_materials_finish_definition_id_fkey (
          finish_key
        ),
        media_assets!project_materials_media_asset_id_fkey (
          status,
          source_kind,
          source_url,
          bucket,
          object_path,
          alt
        )
      `).in("project_id",l).eq("status","published").eq("claim_status","approved").order("sort_order",{ascending:!0}),o.from("project_material_maps").select(`
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
      `).in("project_id",l).eq("status","published").order("sort_order",{ascending:!0})]);if(g.error||S.error||d.error||j.error)return[];const M=j.data??[],B=M.map(i=>i.id),I=B.length?await o.from("project_hotspots").select(`
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
          preview_media:media_assets!project_hotspots_preview_media_id_fkey (
            status,
            source_kind,
            source_url,
            bucket,
            object_path,
            alt
          )
        `).in("project_material_map_id",B).eq("status","published").order("sort_order",{ascending:!0}):{data:[],error:null};if(I.error)return[];for(const i of g.data??[])a.set(i.project_id,[...a.get(i.project_id)??[],i]);for(const i of S.data??[])c.set(i.project_id,[...c.get(i.project_id)??[],i]);for(const i of d.data??[])p.set(i.project_id,[...p.get(i.project_id)??[],i]);const b=new Map;for(const i of M)b.set(i.id,i.project_id),h.set(i.project_id,[...h.get(i.project_id)??[],i]);for(const i of I.data??[]){const A=b.get(i.project_material_map_id);A&&P.set(A,[...P.get(A)??[],i])}return n.map(i=>H(i,o,a.get(i.id),c.get(i.id),p.get(i.id),h.get(i.id),P.get(i.id)))}async function X(t){const o=t===void 0?await q():t;if(!o)return[];const{data:r,error:s}=await o.rpc("get_archived_project_slugs",void 0,{get:!0});if(s||!Array.isArray(r))return[];const n=new Set(R.map(a=>f(a.slug))),l=new Set;for(const a of r){if(!a||typeof a!="object")continue;const c=a.slug;if(typeof c!="string")continue;const p=f(c);p&&n.has(p)&&l.add(p)}return[...l]}function x(t,o=[]){const r=new Map(R.map(a=>[f(a.slug),a])),s=new Set(o.map(a=>f(a)).filter(Boolean)),n=R.filter(a=>!s.has(f(a.slug))),l=t.map(a=>{const c=r.get(f(a.slug));return c?{...a,listing:{...a.listing,sector:c.listing.sector,category:c.listing.category},gallery:a.gallery??c.gallery,cta:a.cta??c.cta}:a});return K(n,l,a=>a.slug)}class T{static async getAll(){const o=await q();if(!o)return x([]);const[r,s]=await Promise.all([J(o),X(o)]);return x(r,s)}static async getBySlug(o){const r=await T.getAll(),s=f(o);return r.find(n=>f(n.slug)===s)}}export{T as P};
