// src/components/SustainabilitySection.tsx
import { useState, useEffect } from "react";

/* ---------- 可在这里集中修改资源 ---------- */
const FEATURES = [
    {
        key: "carbon",
        icon: "https://urblo.com.au/wp-content/uploads/2025/01/co2-footprint.png",
        label: "Sustainability",
    },
    {
        key: "install",
        icon: "https://urblo.com.au/wp-content/uploads/2024/12/step3-scaled.jpg",
        label: "Installation",
    },
    {
        key: "cost",
        icon: "https://urblo.com.au/wp-content/uploads/2024/12/stone.jpeg",
        label: "Cost Saving",
    },
    {
        key: "process",
        icon: "https://urblo.com.au/wp-content/uploads/2024/12/sketch-concept-design.jpeg",
        label: "9-step Process",
    },
] as const;
type FeatureKey = typeof FEATURES[number]["key"];

export default function FeatureSection() {
    const [active, setActive] = useState<FeatureKey>("carbon");

    return (
        <section className="bg-white py-16">
            {/* ---- CONTENT AREA ---- */}
            <div className="relative mx-auto max-w-6xl px-4">
                {active === "carbon" && <CarbonNeutral />}
                {active === "install" && <InstallSteps />}
                {active === "cost" && <CostComparison />}
                {active === "process" && <ProcessSlider />}
            </div>
            {/* ---- TAB ICONS ---- */}
            <div className="mx-auto mb-10 flex max-w-5xl justify-center gap-6 px-4 py-10">
                {FEATURES.map(({ key, icon, label }) => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        className={`group flex flex-col items-center gap-2
                        transition ${active === key ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
                    >
                        <img src={icon} alt={label} className="h-16 w-16 rounded-full object-cover" />
                        <span className="text-sm font-medium">{label}</span>
                        <div
                            className={`h-0.5 w-6 rounded-full bg-emerald-500 transition-all
                          ${active === key ? "scale-100" : "scale-0 group-hover:scale-50"}`}
                        />
                    </button>
                ))}
            </div>

        </section>
    );
}

/* ------------------------------------------------------------------ */
/* 1 · Carbon Neutral                                                 */
/* ------------------------------------------------------------------ */
function CarbonNeutral() {
    return (
        <div className="grid gap-10 md:grid-cols-2">
            {/* 左侧图 */}
            <div className="relative flex items-center justify-center">
                <img
                    src="https://urblo.com.au/wp-content/uploads/2025/01/co2-footprint.png"
                    alt=""
                    className="max-h-96 object-contain"
                />
                {/* 环形文字 —— 纯 CSS 转圈 */}
                <svg
                    viewBox="0 0 100 100"
                    className="absolute h-72 w-72 animate-spin-slow text-emerald-600"
                >
                    <defs>
                        <path
                            id="circlePath"
                            d="
                M 10, 50
                a 40,40 0 1,1 80,0
                40,40 0 1,1 -80,0
              "
                        />
                    </defs>
                    <text fontSize="5">
                        <textPath href="#circlePath">
                            CARBON NEUTRAL COMMITMENT&nbsp;•&nbsp;
                        </textPath>
                    </text>
                </svg>
                <p className="absolute bottom-4 text-center text-sm font-medium">
                    Urblo offsets&nbsp;CO<sub>2</sub>&nbsp;footprint&nbsp;100%
                </p>
            </div>

            {/* 右侧描述 */}
            <div className="space-y-4 text-gray-700">
                <p>
                    At Urblo, we are unwavering in our commitment to long-term sustainability with project bused carbon neutral offer. Urblo was created by SAl Stone, along with a novice request, greener alternative to concrete seats. We have decided to carry this idea further by offering FULL LIFE CIRCLE carbon dioxide offsets, this includes the production, ocean freight, local freight and energy for end of product line crush/reuse as road base.
                </p>
                <p> </p>
                <p>
                    We actively offset life cycle carbon emissions management, replace polluting building materials, and dedicate ourselves to the responsible restoration of quarries. Our goal is not just to provide stone blocks but to build a future where our actions contribute positively to the planet.
                </p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* 2 · 3-step Installation slider (简易自动轮播)                       */
/* ------------------------------------------------------------------ */
function InstallSteps() {
    const imgs = [
        { id: 0, src: "https://urblo.com.au/wp-content/uploads/2024/12/step1-scaled.jpg", title: "Off-site pre-assembly" },
        { id: 1, src: "https://urblo.com.au/wp-content/uploads/2024/12/step2.jpg", title: "Delivery to site" },
        { id: 2, src: "https://urblo.com.au/wp-content/uploads/2024/12/step3-scaled.jpg", title: "Sling & Place" },
    ];
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setIdx((i) => (i + 1) % imgs.length), 3500);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="flex flex-col items-center gap-8 md:flex-row">
            {/* 图片 */}
            <div className="relative w-full md:w-2/3">
                {imgs.map(({ id, src }) => (
                    <img
                        key={id}
                        src={src}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700
                        ${idx === id ? "opacity-100" : "opacity-0"}`}
                    />
                ))}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* 步骤文本 */}
            <div className="w-full max-w-xs space-y-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Typically 2-3 weeks</p>
                {imgs.map(({ id, title }) => (
                    <div key={id} className="flex items-start gap-3">
            <span
                className={`text-lg font-bold ${
                    idx === id ? "text-emerald-500" : "text-gray-400"
                }`}
            >
              {String(id + 1).padStart(2, "0")}
            </span>
                        <p className={`${idx === id ? "text-gray-900" : "text-gray-500"}`}>{title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* 3 · Cost Comparison — 复用之前条形图                               */
/* ------------------------------------------------------------------ */
function CostComparison() {
    const bars = [
        { label: "Preparation", conc: 30, stone: 25 },
        { label: "Material", conc: 35, stone: 60 },
        { label: "Labour", conc: 70, stone: 30 },
        { label: "Problem solving", conc: 35, stone: 5 },
        { label: "Maintenance", conc: 30, stone: 6 },
        { label: "Total", conc: 100, stone: 55 },
    ];
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Concrete&nbsp;vs&nbsp;Stone — Cost Breakdown</h3>
            <div className="grid grid-cols-12 gap-4 text-sm">
                {bars.map(({ label, conc, stone }) => (
                    <div key={label} className="contents">
                        <div className="col-span-3 font-medium">{label}</div>
                        <div className="col-span-9 flex items-center gap-2">
                            <Bar percent={conc} color="bg-gray-400" />
                            <Bar percent={stone} color="bg-emerald-500" />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500">
                * Typical street-furniture supply &amp; installation in Victoria (AUS). Special conditions may vary.
            </p>
        </div>
    );
}
const Bar = ({ percent, color }: { percent: number; color: string }) => (
    <div className="h-2 w-full bg-gray-200">
        <div style={{ width: `${percent}%` }} className={`h-full ${color}`} />
    </div>
);

/* ------------------------------------------------------------------ */
/* 4 · 9-step Process (纯 CSS 无限滚动，和之前示例保持一致)           */
/* ------------------------------------------------------------------ */
function ProcessSlider() {
    const steps = [
        "Sketch & concept design",
        "Product development",
        "Engineering design",
        "Cost control budgeting",
        "Specification",
        "Shop drawing",
        "Off-site pre-assembly",
        "Manufacture",
        "Installation",
    ];
    return (
        <div className="overflow-hidden py-10">
            <div className="flex w-[200%] gap-6 animate-marquee">
                {steps.concat(steps).map((title, i) => (
                    <div
                        key={i}
                        className={`flex h-28 w-64 shrink-0 items-center justify-center rounded-xl
        ${i % 2 ? "bg-gray-100" : "bg-emerald-50"}`}
                    >
                        <span className="text-center text-sm font-medium">{title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
