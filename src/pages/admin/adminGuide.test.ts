import { describe, expect, it } from 'vitest';
import guideMarkdown from '../../../docs/ADMIN_EDITOR_GUIDE.md?raw';
import { parseGuide, parseGuideInline } from './adminGuide';

describe('admin quick guide parser', () => {
    it('splits bold control labels from plain text', () => {
        expect(parseGuideInline('Press **Save**, then **Publish**.')).toEqual([
            { text: 'Press ', strong: false },
            { text: 'Save', strong: true },
            { text: ', then ', strong: false },
            { text: 'Publish', strong: true },
            { text: '.', strong: false },
        ]);
    });

    it('groups consecutive list items and separates ordered from bullet lists', () => {
        const blocks = parseGuide('# Title\n\n## Part\n- one\n- two\n1. first\n2. second\n\nAfter.');
        expect(blocks.map((block) => block.kind)).toEqual(['title', 'heading', 'list', 'list', 'paragraph']);
        expect(blocks[2]).toMatchObject({ kind: 'list', ordered: false, items: [[{ text: 'one' }], [{ text: 'two' }]] });
        expect(blocks[3]).toMatchObject({ kind: 'list', ordered: true });
    });

    it('renders the bundled guide as one title followed by the colleague task sections', () => {
        const blocks = parseGuide(guideMarkdown);
        expect(blocks[0]).toEqual({ kind: 'title', text: 'Urblo admin quick guide' });
        const headings = blocks.flatMap((block) => (block.kind === 'heading' ? [block.text] : []));
        expect(headings).toEqual([
            'Sign in',
            'Save, Publish and Update live page',
            'Change an image on a project page',
            'Add or update a project and mark materials',
            'Edit a product',
            'Handle an enquiry or sample request',
            'Update company addresses and contact details',
            'Who to ask',
        ]);
        expect(blocks.filter((block) => block.kind === 'title')).toHaveLength(1);
    });
});
