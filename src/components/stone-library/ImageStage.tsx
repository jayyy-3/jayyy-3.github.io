interface ImageStageProps {
    stoneName: string;
    finishLabel?: string;
    imageUrl?: string;
    imageAlt?: string;
}

export default function ImageStage({
    stoneName,
    finishLabel,
    imageUrl,
    imageAlt,
}: ImageStageProps) {
    return (
        <figure className="overflow-hidden border border-neutral-300 bg-neutral-950">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={imageAlt || `${stoneName} ${finishLabel || ''}`.trim()}
                    className="h-[460px] w-full object-cover transition-opacity duration-200"
                    loading="eager"
                />
            ) : (
                <div className="flex h-[460px] items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-600 px-6 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#00FF19]">
                        Image coming soon
                    </p>
                </div>
            )}
            <figcaption className="flex items-center justify-between border-t border-neutral-300 bg-white px-4 py-3 text-xs uppercase tracking-[0.12em] text-neutral-600">
                <span>{stoneName}</span>
                {finishLabel ? <span>{finishLabel}</span> : null}
            </figcaption>
        </figure>
    );
}
