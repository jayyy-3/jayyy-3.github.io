// Parses docs/ADMIN_EDITOR_GUIDE.md for the admin Help drawer. The guide is limited to a small
// Markdown subset (title, section headings, bullet/numbered lists, paragraphs and **bold** control
// labels); scripts/check-admin-guide.mjs rejects anything else so the drawer renders it faithfully.
export type GuideInline = { text: string; strong: boolean };

export type GuideBlock =
    | { kind: 'title'; text: string }
    | { kind: 'heading'; text: string }
    | { kind: 'paragraph'; inline: GuideInline[] }
    | { kind: 'list'; ordered: boolean; items: GuideInline[][] };

export function parseGuideInline(text: string): GuideInline[] {
    return text
        .split('**')
        .map((part, index) => ({ text: part, strong: index % 2 === 1 }))
        .filter((part) => part.text.length > 0);
}

export function parseGuide(markdown: string): GuideBlock[] {
    const blocks: GuideBlock[] = [];
    let list: Extract<GuideBlock, { kind: 'list' }> | null = null;

    for (const rawLine of markdown.split(/\r?\n/)) {
        const line = rawLine.trim();
        const bullet = /^-\s+(.*)$/.exec(line);
        const numbered = /^\d+\.\s+(.*)$/.exec(line);
        const itemText = bullet?.[1] ?? numbered?.[1];

        if (itemText !== undefined) {
            const ordered = Boolean(numbered);
            if (!list || list.ordered !== ordered) {
                list = { kind: 'list', ordered, items: [] };
                blocks.push(list);
            }
            list.items.push(parseGuideInline(itemText));
            continue;
        }

        list = null;
        if (!line) continue;
        if (line.startsWith('## ')) blocks.push({ kind: 'heading', text: line.slice(3).trim() });
        else if (line.startsWith('# ')) blocks.push({ kind: 'title', text: line.slice(2).trim() });
        else blocks.push({ kind: 'paragraph', inline: parseGuideInline(line) });
    }

    return blocks;
}
