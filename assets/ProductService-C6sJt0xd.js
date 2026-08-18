import{g as d,p as u}from"./index-Gy3RztLc.js";import{p}from"./publicEntitySeo-CgpviqMQ.js";import{r as g}from"./publicMediaUrl-BCnm8sfh.js";import{t as c,o as _}from"./publicContentOverlay-C9qA3frw.js";function n(s){return Array.isArray(s)?s[0]??null:s??null}function m(s,r){const a=(s.product_models??[]).slice().sort((e,l)=>(e.sort_order??0)-(l.sort_order??0)).map(e=>({key:e.model_key,label:e.label,img:g(n(e.media_assets),r)||"/products/primeBlock/core.png"})),t=Object.fromEntries((s.product_material_defaults??[]).map(e=>{var l;return[e.material_category,((l=n(e.stone_groups))==null?void 0:l.stone_group_key)||e.material_slug||e.display_label||void 0]})),o=Object.fromEntries((s.product_specs??[]).map(e=>[e.spec_label,e.spec_value]));return{slug:s.slug,name:s.name,shortDesc:s.short_description||void 0,contentSource:"cms",seo:p(s.seo),models:a.length?a:[{key:"default",label:"Default",img:"/products/primeBlock/core.png"}],defaultMaterials:t,specs:o}}async function b(){const s=await d();if(!s)return[];const{data:r,error:a}=await s.from("products").select(`
            slug,
            name,
            short_description,
            seo,
            sort_order,
            product_models (
                model_key,
                label,
                sort_order,
                media_assets:media_assets!product_models_image_media_id_fkey (
                    status,
                    source_kind,
                    source_url,
                    bucket,
                    object_path
                )
            ),
            product_material_defaults (
                material_category,
                material_slug,
                display_label,
                stone_groups (
                    stone_group_key
                )
            ),
            product_specs (
                spec_label,
                spec_value,
                sort_order
            )
        `).eq("status","published").order("sort_order",{ascending:!0}).order("sort_order",{referencedTable:"product_models",ascending:!0}).order("sort_order",{referencedTable:"product_specs",ascending:!0});return a||!(r!=null&&r.length)?[]:r.map(t=>m(t,s))}function f(s){const r=new Map(u.map(t=>[c(t.slug),t])),a=s.map(t=>{var e;const o=r.get(c(t.slug));return(e=o==null?void 0:o.legacySlugs)!=null&&e.length?{...t,legacySlugs:t.legacySlugs??o.legacySlugs}:t});return _(u,a,t=>t.slug)}class i{static async getAll(){const r=await b();return f(r)}static async getBySlug(r){const a=await i.getAll(),t=c(r);return a.find(o=>{var e;return c(o.slug)===t||((e=o.legacySlugs)==null?void 0:e.some(l=>c(l)===t))})}}export{i as P};
