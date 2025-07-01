import type {Product} from '../types/product';

// 6 个座椅的示例数据 —— 可自行删改 / 拆分为独立文件
export const products: Product[] = [
    {
        slug: 'primeBlock',
        name: 'Prime Block',
        shortDesc: 'The PrimeBlock Series delivers foundational elegance with its clean, square profile, ideal for minimalist urban spaces requiring durability and understated design.',
        models: [
            {key: 'core', label: 'Core', img: '/products/primeBlock/core.png'},
            {key: 'timberRise', label: 'Timber Rise', img: '/products/primeBlock/timberRise.png'},
            {key: 'timberFlush', label: 'Timber Flush', img: '/products/primeBlock/timberFlush.png'},
            {key: 'timberRiseP', label: 'Timber Flush +', img: '/products/primeBlock/timberRiseP.png'},
            {key: 'timberFlushP', label: 'Timber Flush +', img: '/products/primeBlock/timberFlushP.png'},
        ],
        defaultMaterials: {
            body: 'ken-black',         // ← 对应 materialData.ts 的 slug
            frame: 'stainless-finish',
            battens: 'spotted-gum'
        },
        specs: {
            'Linear Metre Weight': '≈ 126 kg / lm',
            'Max Span': '2200 mm',
            'Fixings': 'M12 SS316',
            // ……
        }
    },

    {
        slug: 'primeLume',
        name: 'Prime Lume',
        shortDesc: 'The PrimeLume Series redefines minimalism with dual-side grooves for integrated lighting or drainage. Built on Urblo’s signature robustness, it transforms functional details into sleek design statements.',
        models: [
            {key: 'core', label: 'Core', img: '/products/primeLume/core.png'},
            {key: 'timberRise', label: 'Timber Rise', img: '/products/primeLume/timberRise.png'},
            {key: 'timberFlush', label: 'Timber Flush', img: '/products/primeLume/timberFlush.png'},
            {key: 'timberRiseP', label: 'Timber Flush +', img: '/products/primeLume/timberRiseP.png'},
            {key: 'timberFlushP', label: 'Timber Flush +', img: '/products/primeLume/timberFlushP.png'},
        ],
        defaultMaterials: {
            body: 'ken-black',         // ← 对应 materialData.ts 的 slug
            frame: 'stainless-finish',
            battens: 'spotted-gum'
        },
        specs: {
            'Linear Metre Weight': '≈ 126 kg / lm',
            'Max Span': '2200 mm',
            'Fixings': 'M12 SS316',
            // ……
        }
    },

    {
        slug: 'terraLine',
        name: 'Terra Line',
        shortDesc: 'Crafted for modern landscapes, this modular series seamlessly integrates natural stone and timber, offering versatile configurations from minimalist benches to ergonomic seating. The signature tapered profile and recessed base channel (LED-ready) blend functionality with sleek design, while embedded wood elements add warmth to urban rigidity. Whether illuminating pathways or framing plazas, TerraLine adapts to any space with tailored elegance.',
        models: [
            {key: 'core', label: 'Core', img: '/products/terraLine/core.png'},
            {key: 'timberRise', label: 'Timber Rise', img: '/products/terraLine/timberRise.png'},
            {key: 'timberFlush', label: 'Timber Flush', img: '/products/terraLine/timberFlush.png'},
            {key: 'timberRiseP', label: 'Timber Flush +', img: '/products/terraLine/timberRiseP.png'},
            {key: 'timberFlushP', label: 'Timber Flush +', img: '/products/terraLine/timberFlushP.png'},
        ],
        defaultMaterials: {
            body: 'ken-black',         // ← 对应 materialData.ts 的 slug
            frame: 'stainless-finish',
            battens: 'spotted-gum'
        },
        specs: {
            'Linear Metre Weight': '≈ 126 kg / lm',
            'Max Span': '2200 mm',
            'Fixings': 'M12 SS316',
            // ……
        }
    },


    {
        slug: 'strataBench',
        name: 'Strata Bench',
        shortDesc: 'Engineered for bustling public spaces, this wide-profile bench series offers versatile double-sided seating, seamlessly blending robust stone bases with optional timber accents for organic warmth.',
        models: [
            {key: 'core', label: 'Core', img: '/products/strataBench/core.jpg'},
            {key: 'timberSpan', label: 'Timber Span', img: '/products/strataBench/timberSpan.jpg'},
            {key: 'timberSpanP', label: 'Timber Span +', img: '/products/strataBench/timberSpanP.jpg'},
        ],
        defaultMaterials: {
            body: 'ken-black',         // ← 对应 materialData.ts 的 slug
            frame: 'stainless-finish',
            battens: 'spotted-gum'
        },
        specs: {
            'Linear Metre Weight': '≈ 126 kg / lm',
            'Max Span': '2200 mm',
            'Fixings': 'M12 SS316',
            // ……
        }
    },

    {
        slug: 'primeCurve',
        name: 'Prime Curve',
        shortDesc: 'The PrimeCurve Series extends PrimeLume’s innovation into sweeping profiles, merging signature light-ready grooves with organic curves for plazas, pathways, or sculptural installations. Engineered stone ensures durability adapts to any landscape poetry.',
        models: [
            {key: 'core', label: 'Core', img: '/products/primeCurve/core.png'},
            {key: 'timberRise', label: 'Timber Rise', img: '/products/primeCurve/timberRise.png'},
            {key: 'timberFlush', label: 'Timber Flush', img: '/products/primeCurve/timberFlush.png'},
            {key: 'timberRiseP', label: 'Timber Flush +', img: '/products/primeCurve/timberRiseP.png'},
            {key: 'timberFlushP', label: 'Timber Flush +', img: '/products/primeCurve/timberFlushP.png'},
        ],
        defaultMaterials: {
            body: 'ken-black',         // ← 对应 materialData.ts 的 slug
            frame: 'stainless-finish',
            battens: 'spotted-gum'
        },
        specs: {
            'Linear Metre Weight': '≈ 126 kg / lm',
            'Max Span': '2200 mm',
            'Fixings': 'M12 SS316',
            // ……
        }
    },

    {
        slug: 'terraArc',
        name: 'Terra Arc',
        shortDesc: 'Fluid curves meet TerraLine’s iconic taper and grooves. Precision-carved stone arcs with LED-ready channels, paired with sweeping timber accents for ergonomic comfort. Adapts seamlessly from sculptural park seats to waterfront rings—durable, dynamic, and designed to connect.',
        models: [
            {key: 'core', label: 'Core', img: '/products/terraArc/core.png'},
            {key: 'timberRise', label: 'Timber Rise', img: '/products/terraArc/timberRise.png'},
            {key: 'timberFlush', label: 'Timber Flush', img: '/products/terraArc/timberFlush.png'},
            {key: 'timberRiseP', label: 'Timber Flush +', img: '/products/terraArc/timberRiseP.png'},
            {key: 'timberFlushP', label: 'Timber Flush +', img: '/products/terraArc/timberFlushP.png'},
        ],
        defaultMaterials: {
            body: 'ken-black',         // ← 对应 materialData.ts 的 slug
            frame: 'stainless-finish',
            battens: 'spotted-gum'
        },
        specs: {
            'Linear Metre Weight': '≈ 126 kg / lm',
            'Max Span': '2200 mm',
            'Fixings': 'M12 SS316',
            // ……
        }
    },
];

export default products;
