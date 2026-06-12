import{f as j}from"./index-DfGvmQzE.js";import{g as b}from"./publicContentClient-DZjC4UDv.js";function u(t){return Array.isArray(t)?t[0]??null:t??null}function g(t){var a;return((a=t==null?void 0:t.match(/\b(20\d{2}|19\d{2})\b/))==null?void 0:a[0])||""}function y(t){var a;return((a=t==null?void 0:t.match(/\b(NSW|QLD|SA|TAS|VIC|WA|ACT|NT)\b/))==null?void 0:a[0])||""}function h(t,a=[],l=[]){const s=u(t.cover_media),o=u(t.hero_media),i=(s==null?void 0:s.source_url)||"/media/launch/contact/project-contact.jpg",d=(o==null?void 0:o.source_url)||i,_=g(t.project_date_label),c={};for(const e of a.sort((r,n)=>(r.sort_order??0)-(n.sort_order??0)))c[e.fact_label]=e.fact_value_json||e.fact_value||"";return t.landscape_architect&&!c["Landscape Architect"]&&(c["Landscape Architect"]=t.landscape_architect),t.contractor&&!c.Contractor&&(c.Contractor=t.contractor),t.project_date_label&&!c.Date&&(c.Date=t.project_date_label),t.address&&!c.Address&&(c.Address=t.address),t.quantity_label&&!c.Quantity&&(c.Quantity=t.quantity_label),{slug:t.slug,name:t.title,images:l.map(e=>{var r;return(r=u(e.media_assets))==null?void 0:r.source_url}).filter(e=>!!e),listing:{title:t.title,location:t.location||"",state:y(t.location),date:t.project_date_label||"",year:_,sector:"Project",category:"Civil landscape",cover:i,imageAlt:(s==null?void 0:s.alt)||t.title,summary:t.summary||void 0},hero:{image:d,alt:(o==null?void 0:o.alt)||(s==null?void 0:s.alt)||t.title},lead:t.lead||t.summary||void 0,story:t.summary?[t.summary]:void 0,details:c,mediaBlocks:l.slice().sort((e,r)=>(e.sort_order??0)-(r.sort_order??0)).map((e,r)=>{var n,p;if(e.media_role==="youtube_video"&&e.youtube_url){const f=e.youtube_url.split("/").pop()||e.youtube_url;return{id:`${t.slug}-video-${r+1}`,type:"youtube_video",youtubeId:f,title:e.block_title||e.label||"Project video",caption:e.caption||void 0}}return{id:`${t.slug}-image-${r+1}`,type:"normal_image",src:((n=u(e.media_assets))==null?void 0:n.source_url)||i,alt:((p=u(e.media_assets))==null?void 0:p.alt)||e.label||t.title,title:e.block_title||void 0,label:e.label||void 0,caption:e.caption||void 0}})}}async function v(){const t=b();if(!t)return[];const{data:a,error:l}=await t.from("projects").select(`
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
      sort_order,
      cover_media:media_assets!projects_cover_media_id_fkey (
        source_url,
        alt
      ),
      hero_media:media_assets!projects_hero_media_id_fkey (
        source_url,
        alt
      )
    `).eq("status","published").order("sort_order",{ascending:!0});if(l||!(a!=null&&a.length))return[];const s=a,o=s.map(e=>e.id),i=new Map,d=new Map,{data:_}=await t.from("project_facts").select("project_id, fact_label, fact_value, fact_value_json, sort_order").in("project_id",o).order("sort_order",{ascending:!0});for(const e of _??[])i.set(e.project_id,[...i.get(e.project_id)??[],e]);const{data:c}=await t.from("project_media").select(`
      project_id,
      media_role,
      label,
      caption,
      block_title,
      youtube_url,
      sort_order,
      media_assets (
        source_url,
        alt
      )
    `).in("project_id",o).eq("status","published").order("sort_order",{ascending:!0});for(const e of c??[])d.set(e.project_id,[...d.get(e.project_id)??[],e]);return s.map(e=>h(e,i.get(e.id),d.get(e.id)))}class m{static async getAll(){const a=await v();return a.length?a:j}static async getBySlug(a){return(await m.getAll()).find(s=>s.slug===a)}}export{m as P};
