import{g as j,f as g}from"./index-Bh6LqeZQ.js";import{p as h}from"./publicEntitySeo-CgpviqMQ.js";import{n as v}from"./projectFactValue-CROx5WB9.js";import{r as p}from"./publicMediaUrl-DnH1XMRj.js";import{t as f,o as P}from"./publicContentOverlay-DLdr1C4F.js";function d(t){return Array.isArray(t)?t[0]??null:t??null}function k(t){var a;return((a=t==null?void 0:t.match(/\b(20\d{2}|19\d{2})\b/))==null?void 0:a[0])||""}function A(t){var a;return((a=t==null?void 0:t.match(/\b(NSW|QLD|SA|TAS|VIC|WA|ACT|NT)\b/))==null?void 0:a[0])||""}function C(t,a,i=[],s=[]){const o=d(t.cover_media),c=d(t.hero_media),l=p(o,a)||"/media/launch/contact/project-contact.jpg",u=p(c,a)||l,_=k(t.project_date_label),r={};for(const e of i.sort((n,m)=>(n.sort_order??0)-(m.sort_order??0)))r[e.fact_label]=v(e.fact_value_json,e.fact_value);return t.landscape_architect&&!r["Landscape Architect"]&&(r["Landscape Architect"]=t.landscape_architect),t.contractor&&!r.Contractor&&(r.Contractor=t.contractor),t.project_date_label&&!r.Date&&(r.Date=t.project_date_label),t.address&&!r.Address&&(r.Address=t.address),t.quantity_label&&!r.Quantity&&(r.Quantity=t.quantity_label),{slug:t.slug,name:t.title,contentSource:"cms",seo:h(t.seo),images:s.map(e=>p(d(e.media_assets),a)).filter(e=>!!e),listing:{title:t.title,location:t.location||"",state:A(t.location),date:t.project_date_label||"",year:_,sector:"Project",category:"Civil landscape",cover:l,imageAlt:(o==null?void 0:o.alt)||t.title,summary:t.summary||void 0},hero:{image:u,alt:(c==null?void 0:c.alt)||(o==null?void 0:o.alt)||t.title},lead:t.lead||t.summary||void 0,story:t.summary?[t.summary]:void 0,details:r,mediaBlocks:s.slice().sort((e,n)=>(e.sort_order??0)-(n.sort_order??0)).map((e,n)=>{var m;if(e.media_role==="youtube_video"&&e.youtube_url){const y=e.youtube_url.split("/").pop()||e.youtube_url;return{id:`${t.slug}-video-${n+1}`,type:"youtube_video",youtubeId:y,title:e.block_title||e.label||"Project video",caption:e.caption||void 0}}return{id:`${t.slug}-image-${n+1}`,type:"normal_image",src:p(d(e.media_assets),a)||l,alt:((m=d(e.media_assets))==null?void 0:m.alt)||e.label||t.title,title:e.block_title||void 0,label:e.label||void 0,caption:e.caption||void 0}})}}async function S(t){const a=await j();if(!a)return[];const{data:i,error:s}=await a.from("projects").select(`
      id,
      slug,
      title,
      location,
      project_date_label,
      summary,
      lead,
      landscape_architect,
      contractor,
      address,
      quantity_label,
      carbon_status,
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
    `).eq("status","published").order("sort_order",{ascending:!0});if(s||!(i!=null&&i.length))return[];const o=i,c=o.map(e=>e.id),l=new Map,u=new Map,[_,r]=await Promise.all([a.from("project_facts").select("project_id, fact_label, fact_value, fact_value_json, sort_order").in("project_id",c).order("sort_order",{ascending:!0}),a.from("project_media").select(`
        project_id,
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
      `).in("project_id",c).eq("status","published").order("sort_order",{ascending:!0})]);if(_.error||r.error)return[];for(const e of _.data??[])l.set(e.project_id,[...l.get(e.project_id)??[],e]);for(const e of r.data??[])u.set(e.project_id,[...u.get(e.project_id)??[],e]);return o.map(e=>C(e,a,l.get(e.id),u.get(e.id)))}function B(t){const a=new Map(g.map(s=>[f(s.slug),s])),i=t.map(s=>{const o=a.get(f(s.slug));return o?{...s,listing:{...s.listing,sector:o.listing.sector,category:o.listing.category},materialMap:s.materialMap??o.materialMap,materials:s.materials??o.materials,gallery:s.gallery??o.gallery,cta:s.cta??o.cta}:s});return P(g,i,s=>s.slug)}class b{static async getAll(){const a=await S();return B(a)}static async getBySlug(a){const i=await b.getAll(),s=f(a);return i.find(o=>f(o.slug)===s)}}export{b as P};
