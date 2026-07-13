import{g as j,f as g}from"./index-Im5Dl7xa.js";import{p as h}from"./publicEntitySeo-CgpviqMQ.js";import{n as v}from"./projectFactValue-CROx5WB9.js";import{r as p}from"./publicMediaUrl-DnH1XMRj.js";import{t as f,o as P}from"./publicContentOverlay-DLdr1C4F.js";function d(t){return Array.isArray(t)?t[0]??null:t??null}function k(t){var s;return((s=t==null?void 0:t.match(/\b(20\d{2}|19\d{2})\b/))==null?void 0:s[0])||""}function A(t){var s;return((s=t==null?void 0:t.match(/\b(NSW|QLD|SA|TAS|VIC|WA|ACT|NT)\b/))==null?void 0:s[0])||""}function C(t,s,c=[],r=[]){const o=d(t.cover_media),i=d(t.hero_media),l=p(o,s)||"/media/launch/contact/project-contact.jpg",u=p(i,s)||l,_=k(t.project_date_label),e={};for(const a of c.sort((n,m)=>(n.sort_order??0)-(m.sort_order??0)))e[a.fact_label]=v(a.fact_value_json,a.fact_value);return t.landscape_architect&&!e["Landscape Architect"]&&(e["Landscape Architect"]=t.landscape_architect),t.contractor&&!e.Contractor&&(e.Contractor=t.contractor),t.project_date_label&&!e.Date&&(e.Date=t.project_date_label),t.address&&!e.Address&&(e.Address=t.address),t.quantity_label&&!e.Quantity&&(e.Quantity=t.quantity_label),{slug:t.slug,name:t.title,contentSource:"cms",seo:h(t.seo),images:r.map(a=>p(d(a.media_assets),s)).filter(a=>!!a),listing:{title:t.title,location:t.location||"",state:A(t.location),date:t.project_date_label||"",year:_,sector:"Project",category:"Civil landscape",cover:l,imageAlt:(o==null?void 0:o.alt)||t.title,summary:t.summary||void 0},hero:{image:u,alt:(i==null?void 0:i.alt)||(o==null?void 0:o.alt)||t.title},lead:t.lead||t.summary||void 0,story:t.summary?[t.summary]:void 0,details:e,mediaBlocks:r.slice().sort((a,n)=>(a.sort_order??0)-(n.sort_order??0)).map((a,n)=>{var m;if(a.media_role==="youtube_video"&&a.youtube_url){const y=a.youtube_url.split("/").pop()||a.youtube_url;return{id:`${t.slug}-video-${n+1}`,type:"youtube_video",youtubeId:y,title:a.block_title||a.label||"Project video",caption:a.caption||void 0}}return{id:`${t.slug}-image-${n+1}`,type:"normal_image",src:p(d(a.media_assets),s)||l,alt:((m=d(a.media_assets))==null?void 0:m.alt)||a.label||t.title,title:a.block_title||void 0,label:a.label||void 0,caption:a.caption||void 0}})}}async function S(t=j()){if(!t)return[];const{data:s,error:c}=await t.from("projects").select(`
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
    `).eq("status","published").order("sort_order",{ascending:!0});if(c||!(s!=null&&s.length))return[];const r=s,o=r.map(e=>e.id),i=new Map,l=new Map,[u,_]=await Promise.all([t.from("project_facts").select("project_id, fact_label, fact_value, fact_value_json, sort_order").in("project_id",o).order("sort_order",{ascending:!0}),t.from("project_media").select(`
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
      `).in("project_id",o).eq("status","published").order("sort_order",{ascending:!0})]);if(u.error||_.error)return[];for(const e of u.data??[])i.set(e.project_id,[...i.get(e.project_id)??[],e]);for(const e of _.data??[])l.set(e.project_id,[...l.get(e.project_id)??[],e]);return r.map(e=>C(e,t,i.get(e.id),l.get(e.id)))}function B(t){const s=new Map(g.map(r=>[f(r.slug),r])),c=t.map(r=>{const o=s.get(f(r.slug));return o?{...r,listing:{...r.listing,sector:o.listing.sector,category:o.listing.category},materialMap:r.materialMap??o.materialMap,materials:r.materials??o.materials,gallery:r.gallery??o.gallery,cta:r.cta??o.cta}:r});return P(g,c,r=>r.slug)}class b{static async getAll(){const s=await S();return B(s)}static async getBySlug(s){const c=await b.getAll(),r=f(s);return c.find(o=>f(o.slug)===r)}}export{b as P};
