import { useMemo, useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import StoneDialog from '../../features/stone-library/StoneDialog';
// The colleague quick guide is bundled from its single Markdown source at build time.
import guideMarkdown from '../../../docs/ADMIN_EDITOR_GUIDE.md?raw';
import { parseGuide, type GuideBlock, type GuideInline } from './adminGuide';

const helpButtonClass =
    'inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--urblo-lime)]';

export function AdminHelpButton({ className = '' }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-haspopup="dialog"
                className={`${helpButtonClass} ${className}`}
                data-testid="admin-help-button"
            >
                <CircleHelp className="h-4 w-4" />
                Help
            </button>
            {isOpen ? <AdminHelpDrawer onClose={() => setIsOpen(false)} /> : null}
        </>
    );
}

function AdminHelpDrawer({ onClose }: { onClose: () => void }) {
    // Title and introduction span the sheet; each task section stays whole inside a column so the
    // complete guide fits one desktop screen.
    const sections = useMemo(() => {
        const groups: GuideBlock[][] = [[]];
        for (const block of parseGuide(guideMarkdown)) {
            if (block.kind === 'heading') groups.push([]);
            groups[groups.length - 1].push(block);
        }
        return groups.filter((group) => group.length > 0);
    }, []);
    const [intro, ...tasks] = sections;

    return (
        <StoneDialog label="Admin quick guide" onClose={onClose} className="fixed inset-0 z-[90] flex justify-end">
            <div className="absolute inset-0 bg-black/45" aria-hidden="true" onClick={onClose} />
            <section
                className="relative flex h-full w-full max-w-[1080px] flex-col bg-white text-left text-black shadow-[0_24px_70px_rgba(0,0,0,0.2)]"
                data-testid="admin-help-drawer"
            >
                <div className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-3 md:px-8">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">Help</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 px-3 text-xs font-bold uppercase tracking-[0.12em] transition hover:border-black"
                    >
                        <X className="h-4 w-4" />
                        Close
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-sm leading-[1.55] text-black/75 md:px-8">
                    {intro ? <GuideBlocks blocks={intro} /> : null}
                    <div className="mt-1 gap-10 lg:columns-2">
                        {tasks.map((blocks, index) => (
                            <div key={index} className="break-inside-avoid pt-4">
                                <GuideBlocks blocks={blocks} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </StoneDialog>
    );
}

function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
    return (
        <>
            {blocks.map((block, index) => {
                if (block.kind === 'title') {
                    return (
                        <h2 key={index} className="text-2xl font-semibold tracking-[-0.02em] text-black">
                            {block.text}
                        </h2>
                    );
                }
                if (block.kind === 'heading') {
                    return (
                        <h3 key={index} className="text-base font-semibold text-black">
                            {block.text}
                        </h3>
                    );
                }
                if (block.kind === 'paragraph') {
                    return (
                        <p key={index} className="mt-1.5">
                            <GuideText inline={block.inline} />
                        </p>
                    );
                }
                const ListTag = block.ordered ? 'ol' : 'ul';
                return (
                    <ListTag
                        key={index}
                        className={`mt-1.5 space-y-1 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
                    >
                        {block.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                                <GuideText inline={item} />
                            </li>
                        ))}
                    </ListTag>
                );
            })}
        </>
    );
}

function GuideText({ inline }: { inline: GuideInline[] }) {
    return (
        <>
            {inline.map((part, index) =>
                part.strong ? (
                    <strong key={index} className="font-semibold text-black">
                        {part.text}
                    </strong>
                ) : (
                    <span key={index}>{part.text}</span>
                ),
            )}
        </>
    );
}
