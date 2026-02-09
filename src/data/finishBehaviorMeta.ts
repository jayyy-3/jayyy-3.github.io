import type { FinishBehaviorMeta, FinishKey } from '../types/stone-library';

const fallbackBehavior: FinishBehaviorMeta = {
    summary: 'Performance notes are being refined for this finish.',
    slip: 'Project-specific test required',
    glare: 'Project-specific assessment required',
    maintenance: 'Standard stone maintenance protocol',
};

const finishBehaviorByKey: Record<string, FinishBehaviorMeta> = {
    flamed: {
        summary: 'Textured thermal finish commonly used for external paving.',
        slip: 'High grip in wet conditions',
        glare: 'Low reflectance',
        maintenance: 'Routine wash-down and periodic reseal',
    },
    sawn: {
        summary: 'Linear-cut finish with controlled texture and clean geometry.',
        slip: 'Medium to high grip depending on grain',
        glare: 'Low to medium reflectance',
        maintenance: 'Low maintenance with periodic cleaning',
    },
    honed: {
        summary: 'Smooth matte finish balancing visual calm and practicality.',
        slip: 'Medium grip; external use requires design review',
        glare: 'Low reflectance',
        maintenance: 'Easy day-to-day cleaning and periodic sealing',
    },
    polished: {
        summary: 'Reflective finish suited for low-slip-risk feature areas.',
        slip: 'Low to medium grip; not preferred for wet traffic paths',
        glare: 'High reflectance',
        maintenance: 'Frequent cleaning to preserve sheen',
    },
    bush_hammered: {
        summary: 'Dense pitted texture for robust, tactile hardscape applications.',
        slip: 'High grip',
        glare: 'Very low reflectance',
        maintenance: 'Durable finish with low upkeep',
    },
    combed: {
        summary: 'Directional grooved texture that emphasizes movement.',
        slip: 'High grip when grooves are oriented correctly',
        glare: 'Low reflectance',
        maintenance: 'Occasional brushing to clear groove buildup',
    },
    rippling: {
        summary: 'Sculpted surface that creates a dynamic light-shadow effect.',
        slip: 'High grip',
        glare: 'Low reflectance with textured highlights',
        maintenance: 'Brush clean to maintain texture definition',
    },
    rippling__fine: {
        summary: 'Fine rippling texture with controlled tactile variation.',
        slip: 'Medium to high grip',
        glare: 'Low reflectance',
        maintenance: 'Routine cleaning recommended',
    },
    rippling__rough: {
        summary: 'Rough rippling texture with stronger tactile character.',
        slip: 'High grip',
        glare: 'Very low reflectance',
        maintenance: 'Low maintenance; periodic pressure clean',
    },
    rock_face: {
        summary: 'Split-face profile for expressive edge and wall applications.',
        slip: 'High grip on exposed texture',
        glare: 'Very low reflectance',
        maintenance: 'Low maintenance with occasional debris removal',
    },
    sparrow_peck: {
        summary: 'Fine pecked texture adding controlled roughness.',
        slip: 'High grip',
        glare: 'Low reflectance',
        maintenance: 'Routine external cleaning',
    },
    sandblasted: {
        summary: 'Matte grit texture built for subtle anti-slip performance.',
        slip: 'Medium to high grip',
        glare: 'Low reflectance',
        maintenance: 'Periodic cleaning and seal maintenance',
    },
};

export function getFinishBehaviorMeta(
    finishKey: FinishKey,
    finishId: string,
): FinishBehaviorMeta {
    return (
        finishBehaviorByKey[finishKey] ||
        finishBehaviorByKey[finishId] ||
        fallbackBehavior
    );
}
