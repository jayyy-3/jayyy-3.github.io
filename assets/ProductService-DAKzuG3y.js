import{p as l}from"./index-DfGvmQzE.js";import{g as d}from"./publicContentClient-DZjC4UDv.js";function c(r){return Array.isArray(r)?r[0]??null:r??null}function i(r){const s=(r.product_models??[]).slice().sort((e,t)=>(e.sort_order??0)-(t.sort_order??0)).map(e=>{var t;return{key:e.model_key,label:e.label,img:((t=c(e.media_assets))==null?void 0:t.source_url)||"/products/primeBlock/core.png"}}),o=Object.fromEntries((r.product_material_defaults??[]).map(e=>{var t;return[e.material_category,((t=c(e.stone_groups))==null?void 0:t.stone_group_key)||e.material_slug||e.display_label||void 0]})),a=Object.fromEntries((r.product_specs??[]).map(e=>[e.spec_label,e.spec_value]));return{slug:r.slug,name:r.name,shortDesc:r.short_description||void 0,models:s.length?s:[{key:"default",label:"Default",img:"/products/primeBlock/core.png"}],defaultMaterials:o,specs:a}}async function u(){const r=d();if(!r)return[];const{data:s,error:o}=await r.from("products").select(`
            slug,
            name,
            short_description,
            sort_order,
            product_models (
                model_key,
                label,
                sort_order,
                media_assets:media_assets!product_models_image_media_id_fkey (
                    source_url
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
        `).eq("status","published").order("sort_order",{ascending:!0}).order("sort_order",{referencedTable:"product_models",ascending:!0}).order("sort_order",{referencedTable:"product_specs",ascending:!0});return o||!(s!=null&&s.length)?[]:s.map(i)}class p{static async getAll(){const s=await u();return s.length?s:l}static async getBySlug(s){const o=await u();return(o.length?o:l).find(e=>{var t;return e.slug===s||((t=e.legacySlugs)==null?void 0:t.includes(s))})}}export{p as P};
