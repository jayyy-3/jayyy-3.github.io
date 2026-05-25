export type StatusPillTone = 'available' | 'upcoming' | 'unavailable';
export type StatusPillSurface = 'light' | 'dark' | 'overlay';

interface StatusPillProps {
    label: string;
    tone: StatusPillTone;
    surface?: StatusPillSurface;
    className?: string;
}

function surfaceClass(tone: StatusPillTone, surface: StatusPillSurface): string {
    if (tone === 'available') {
        if (surface === 'dark') {
            return 'border border-[rgba(0,255,25,0.38)] bg-[rgba(0,255,25,0.1)] text-white';
        }

        return 'border border-[rgba(0,255,25,0.44)] bg-[rgba(0,255,25,0.1)] text-black/72';
    }

    if (surface === 'overlay') {
        return 'border border-white/55 bg-white/75 text-black/60 shadow-[0_8px_18px_rgba(0,0,0,0.1)] backdrop-blur-sm';
    }

    if (surface === 'dark') {
        return 'border border-white/20 bg-white/10 text-white/75';
    }

    return 'border border-black/10 bg-white text-black/55';
}

function dotClass(tone: StatusPillTone, surface: StatusPillSurface): string {
    if (tone === 'available') {
        return 'bg-[var(--urblo-lime)]';
    }

    if (tone === 'upcoming') {
        return surface === 'light'
            ? 'border border-black/30 bg-white'
            : 'border border-white/50 bg-black/40';
    }

    return surface === 'light'
        ? 'border border-black/25 bg-black/10'
        : 'border border-white/30 bg-white/20';
}

export default function StatusPill({
    label,
    tone,
    surface = 'light',
    className = '',
}: StatusPillProps) {
    return (
        <span
            data-status-pill="true"
            className={[
                'inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[10px] font-medium uppercase leading-none tracking-[0.04em]',
                surfaceClass(tone, surface),
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <span
                className={[
                    'h-1.5 w-1.5 flex-none rounded-full',
                    dotClass(tone, surface),
                ].join(' ')}
                aria-hidden="true"
            />
            <span>{label}</span>
        </span>
    );
}
