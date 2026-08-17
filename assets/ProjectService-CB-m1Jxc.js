import{g as q,f as R}from"./index-XschtLYP.js";import{p as F}from"./publicEntitySeo-CgpviqMQ.js";import{r as A}from"./publicMediaUrl-BCnm8sfh.js";import{t as f,o as K}from"./publicContentOverlay-C9qA3frw.js";function L(t,o){return typeof t=="string"||Array.isArray(t)&&t.every(a=>typeof a=="string")?t:typeof o=="string"?o:""}function u(t){return Array.isArray(t)?t[0]??null:t??null}function O(t){var o;return((o=t==null?void 0:t.match(/\b(20\d{2}|19\d{2})\b/))==null?void 0:o[0])||""}function Q(t){var o;return((o=t==null?void 0:t.match(/\b(NSW|QLD|SA|TAS|VIC|WA|ACT|NT)\b/))==null?void 0:o[0])||""}function Y(t){return t==="yes"?"Yes":t==="no"?"No":t==="not_available"?"Not available":t==="tbc"?"To be confirmed":""}function G(t){const o=u(t.stone_groups),a=u(t.finish_definitions);if(!(o!=null&&o.stone_group_key)||!(a!=null&&a.finish_key))return null;const s=u(t.stone_variants);return{stoneGroupId:o.stone_group_key,stoneVariantId:s==null?void 0:s.variant_key,finishKey:a.finish_key,application:t.application,note:t.note||""}}function U(t,o){if(!t.project_material_id)return null;const a=o.get(t.project_material_id),s=u(a==null?void 0:a.stone_groups),c=u(a==null?void 0:a.finish_definitions);if(!a||!(s!=null&&s.stone_group_key)||!(c!=null&&c.finish_key))return null;const _=u(a.stone_variants);return{id:t.hotspot_key,x:Number(t.x_percent),y:Number(t.y_percent),description:t.note||void 0,stoneGroupId:s.stone_group_key,stoneVariantId:_==null?void 0:_.variant_key,finishKey:c.finish_key,application:t.application||a.application,note:t.note||a.note||""}}function z(t,o,a,s){const c=u(t.media_assets),_=A(c,s);return _?{image:_,imageAlt:(c==null?void 0:c.alt)||t.title||"Project material map",title:t.title||"Project material map",intro:t.intro||"",hotspots:o.slice().sort((r,n)=>(r.sort_order??0)-(n.sort_order??0)).map(r=>U(r,a)).filter(r=>!!r)}:null}function E(t){const o=t.trim();if(!o.includes("/"))return o;try{const a=new URL(o);return a.hostname.includes("youtu.be")?a.pathname.replace(/^\//,"")||o:a.searchParams.get("v")||a.pathname.split("/").filter(Boolean).pop()||o}catch{return o.split("/").filter(Boolean).pop()||o}}function H(t,o,a=[],s=[],c=[],_=[],r=[]){var N;const n=u(t.cover_media),p=u(t.hero_media),y=A(n,o)||"/media/launch/contact/project-contact.jpg",k=A(p,o)||y,g=t.project_date_label||t.completed_on,S=O(g),l={};for(const e of a.slice().sort((d,m)=>(d.sort_order??0)-(m.sort_order??0)))l[e.fact_label]=L(e.fact_value_json,e.fact_value);t.client&&!l.Client&&(l.Client=t.client),t.landscape_architect&&!l["Landscape Architect"]&&(l["Landscape Architect"]=t.landscape_architect),t.contractor&&!l.Contractor&&(l.Contractor=t.contractor),g&&!l.Date&&(l.Date=g),t.address&&!l.Address&&(l.Address=t.address),t.quantity_label&&!l.Quantity&&(l.Quantity=t.quantity_label);const h=Y(t.carbon_status);h&&!l["Carbon Offset"]&&(l["Carbon Offset"]=t.carbon_note?`${h} — ${t.carbon_note}`:h);const P=c.slice().sort((e,d)=>(e.sort_order??0)-(d.sort_order??0)),B=new Map(P.map(e=>[e.id,e])),I=P.map(e=>G(e)).filter(e=>!!e),j=new Map;for(const e of r)j.set(e.project_material_map_id,[...j.get(e.project_material_map_id)??[],e]);const i=[];for(const e of _.slice().sort((d,m)=>(d.sort_order??0)-(m.sort_order??0))){const d=z(e,j.get(e.id)??[],B,o);d&&i.push({row:e,value:d})}const M=new Map(i.map(e=>[e.row.id,e.value])),$=new Set,b=[];for(const e of s.slice().sort((d,m)=>(d.sort_order??0)-(m.sort_order??0))){if(e.media_role==="youtube_video"&&e.youtube_url){b.push({id:`${t.slug}-media-${e.id}`,type:"youtube_video",youtubeId:E(e.youtube_url),title:e.block_title||e.label||"Project video",caption:e.caption||void 0});continue}if(e.media_role==="hotspot_image"&&e.project_material_map_id){const v=M.get(e.project_material_map_id);if(!v)continue;const C=u(e.media_assets),D=A(C,o);$.add(e.project_material_map_id),b.push({id:`${t.slug}-media-${e.id}`,type:"hotspot_image",image:D||v.image,imageAlt:(C==null?void 0:C.alt)||v.imageAlt,title:e.block_title||v.title,intro:v.intro||void 0,caption:e.caption||void 0,hotspots:v.hotspots});continue}const d=u(e.media_assets),m=A(d,o);m&&b.push({id:`${t.slug}-media-${e.id}`,type:"normal_image",src:m,alt:(d==null?void 0:d.alt)||e.label||t.title,title:e.block_title||void 0,label:e.label||void 0,caption:e.caption||void 0})}for(const e of i)$.has(e.row.id)||b.push({id:`${t.slug}-hotspot-${e.row.id}`,type:"hotspot_image",image:e.value.image,imageAlt:e.value.imageAlt,title:e.value.title,intro:e.value.intro||void 0,hotspots:e.value.hotspots});const W=b.flatMap(e=>e.type==="normal_image"?[e.src]:e.type==="hotspot_image"?[e.image]:[]);return{slug:t.slug,name:t.title,contentSource:"cms",seo:F(t.seo),images:W,listing:{title:t.title,location:t.location||"",state:Q(t.location),date:g||"",year:S,sector:"Project",category:"Civil landscape",cover:y,imageAlt:(n==null?void 0:n.alt)||t.title,summary:t.summary||void 0},hero:{image:k,alt:(p==null?void 0:p.alt)||(n==null?void 0:n.alt)||t.title},lead:t.lead||t.summary||void 0,story:t.summary?[t.summary]:void 0,details:l,materialMap:(N=i[0])==null?void 0:N.value,materials:I,mediaBlocks:b}}async function J(t){const o=t===void 0?await q():t;if(!o)return[];const{data:a,error:s}=await o.from("projects").select(`
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
    `).eq("status","published").order("sort_order",{ascending:!0});if(s||!(a!=null&&a.length))return[];const c=a,_=c.map(i=>i.id),r=new Map,n=new Map,p=new Map,y=new Map,k=new Map,[g,S,l,h]=await Promise.all([o.from("project_facts").select("project_id, fact_label, fact_value, fact_value_json, sort_order, status").in("project_id",_).eq("status","published").eq("claim_status","approved").order("sort_order",{ascending:!0}),o.from("project_media").select(`
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
      `).in("project_id",_).eq("status","published").order("sort_order",{ascending:!0}),o.from("project_materials").select(`
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
      `).in("project_id",_).eq("status","published").eq("claim_status","approved").order("sort_order",{ascending:!0}),o.from("project_material_maps").select(`
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
      `).in("project_id",_).eq("status","published").order("sort_order",{ascending:!0})]);if(g.error||S.error||l.error||h.error)return[];const P=h.data??[],B=P.map(i=>i.id),I=B.length?await o.from("project_hotspots").select(`
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
        `).in("project_material_map_id",B).eq("status","published").order("sort_order",{ascending:!0}):{data:[],error:null};if(I.error)return[];for(const i of g.data??[])r.set(i.project_id,[...r.get(i.project_id)??[],i]);for(const i of S.data??[])n.set(i.project_id,[...n.get(i.project_id)??[],i]);for(const i of l.data??[])p.set(i.project_id,[...p.get(i.project_id)??[],i]);const j=new Map;for(const i of P)j.set(i.id,i.project_id),y.set(i.project_id,[...y.get(i.project_id)??[],i]);for(const i of I.data??[]){const M=j.get(i.project_material_map_id);M&&k.set(M,[...k.get(M)??[],i])}return c.map(i=>H(i,o,r.get(i.id),n.get(i.id),p.get(i.id),y.get(i.id),k.get(i.id)))}async function X(t){const o=t===void 0?await q():t;if(!o)return[];const{data:a,error:s}=await o.rpc("get_archived_project_slugs",void 0,{get:!0});if(s||!Array.isArray(a))return[];const c=new Set(R.map(r=>f(r.slug))),_=new Set;for(const r of a){if(!r||typeof r!="object")continue;const n=r.slug;if(typeof n!="string")continue;const p=f(n);p&&c.has(p)&&_.add(p)}return[..._]}function x(t,o=[]){const a=new Map(R.map(r=>[f(r.slug),r])),s=new Set(o.map(r=>f(r)).filter(Boolean)),c=R.filter(r=>!s.has(f(r.slug))),_=t.map(r=>{const n=a.get(f(r.slug));return n?{...r,listing:{...r.listing,sector:n.listing.sector,category:n.listing.category},gallery:r.gallery??n.gallery,cta:r.cta??n.cta}:r});return K(c,_,r=>r.slug)}class T{static async getAll(){const o=await q();if(!o)return x([]);const[a,s]=await Promise.all([J(o),X(o)]);return x(a,s)}static async getBySlug(o){const a=await T.getAll(),s=f(o);return a.find(c=>f(c.slug)===s)}}export{T as P};
