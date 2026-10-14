// Restricted Markdown for content-block body copy. Recognises only paragraphs (blank-line
// separated), `**bold**`, `[label](url)` links and `- ` unordered lists. Everything else,
// including any HTML, stays literal text: the result is a small tree that renderers turn
// into elements, never an HTML string.
import { toSafePublicContentDestination } from './publicContentLink.ts';

export type RichInline =
    | { kind: 'text'; text: string }
    | { kind: 'strong'; children: RichInline[] }
    | { kind: 'link'; href: string; external: boolean; children: RichInline[] };

export type RichBlock =
    | { kind: 'paragraph'; children: RichInline[] }
    | { kind: 'list'; items: RichInline[][] };

const LIST_ITEM = /^\s*-\s+(.*)$/;

function pushText(nodes: RichInline[], text: string) {
    if (!text) return;
    const last = nodes[nodes.length - 1];
    if (last?.kind === 'text') last.text += text;
    else nodes.push({ kind: 'text', text });
}

/** Parses inline `**bold**` and `[label](url)`; unsafe or unclosed syntax stays literal. */
export function parseRichInline(source: string, allowLinks = true): RichInline[] {
    const nodes: RichInline[] = [];
    let index = 0;
    while (index < source.length) {
        if (source.startsWith('**', index)) {
            const close = source.indexOf('**', index + 2);
            if (close > index + 2) {
                nodes.push({ kind: 'strong', children: parseRichInline(source.slice(index + 2, close), allowLinks) });
                index = close + 2;
                continue;
            }
        }
        if (allowLinks && source[index] === '[') {
            const labelEnd = source.indexOf('](', index + 1);
            const urlEnd = labelEnd > index + 1 ? source.indexOf(')', labelEnd + 2) : -1;
            if (labelEnd > index + 1 && urlEnd > labelEnd + 2) {
                const label = source.slice(index + 1, labelEnd);
                const destination = toSafePublicContentDestination(source.slice(labelEnd + 2, urlEnd));
                const children = parseRichInline(label, false);
                if (destination) {
                    nodes.push({ kind: 'link', href: destination.href, external: destination.kind === 'external', children });
                } else {
                    // An unsafe destination keeps its words but loses the link.
                    children.forEach((child) => (child.kind === 'text' ? pushText(nodes, child.text) : nodes.push(child)));
                }
                index = urlEnd + 1;
                continue;
            }
        }
        const nextSpecial = [source.indexOf('**', index + 1), allowLinks ? source.indexOf('[', index + 1) : -1]
            .filter((position) => position > index)
            .reduce((least, position) => Math.min(least, position), source.length);
        pushText(nodes, source.slice(index, nextSpecial));
        index = nextSpecial;
    }
    return nodes;
}

/** Splits body copy into paragraphs and lists. Lines inside a paragraph join with a space. */
export function parseRichText(source: string): RichBlock[] {
    const blocks: RichBlock[] = [];
    const chunks = source.replace(/\r\n?/g, '\n').split(/\n\s*\n/);
    for (const chunk of chunks) {
        let paragraph: string[] = [];
        let list: RichInline[][] | null = null;
        const flushParagraph = () => {
            const text = paragraph.join(' ').trim();
            if (text) blocks.push({ kind: 'paragraph', children: parseRichInline(text) });
            paragraph = [];
        };
        const flushList = () => {
            if (list?.length) blocks.push({ kind: 'list', items: list });
            list = null;
        };
        for (const line of chunk.split('\n')) {
            const item = LIST_ITEM.exec(line);
            if (item) {
                flushParagraph();
                list ??= [];
                list.push(parseRichInline(item[1].trim()));
            } else if (line.trim()) {
                flushList();
                paragraph.push(line.trim());
            }
        }
        flushParagraph();
        flushList();
    }
    return blocks;
}
