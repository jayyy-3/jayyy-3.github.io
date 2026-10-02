import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { stoneCompareRegistry, type StoneCompareAttribute } from '../../lib/stoneCompareRegistry';
import { finishOrder, staticSubject } from '../../lib/stoneCompare.testUtils';
import StoneCompareView, { type StoneCompareViewProps } from './StoneCompareView';

function render(props: Partial<StoneCompareViewProps> & Pick<StoneCompareViewProps, 'stones'>) {
    return renderToStaticMarkup(
        <MemoryRouter>
            <StoneCompareView finishOrder={finishOrder} {...props} />
        </MemoryRouter>,
    );
}

function rowKeys(html: string) {
    return [...html.matchAll(/data-compare-row="([^"]+)"/g)].map((match) => match[1]);
}

describe('StoneCompareView', () => {
    it('renders one column per stone and every public registry row', () => {
        const stones = [staticSubject('juparana'), staticSubject('tuscany'), staticSubject('zen-grey')];
        const html = render({ stones });
        expect(html).toContain('data-compare-count="3"');
        for (const stone of stones) expect(html).toContain(`Remove ${stone.detail.name} from comparison`);
        const keys = rowKeys(html);
        for (const key of ['finish-image', 'type', 'available-as', 'price-tier', 'finish-capability', 'cut-options', 'raw-block', 'variants', 'used-in-projects']) {
            expect(keys).toContain(key);
        }
        expect(keys.filter((key) => key.startsWith('finish-capability:')).length).toBeGreaterThan(0);
    });

    it('renders a new registry entry as a row with no page change', () => {
        const fake: StoneCompareAttribute = {
            key: 'test-slip-rating',
            label: 'Test slip rating',
            unit: 'P',
            kind: 'boolean',
            public: true,
            order: 35,
            source: 'test fixture',
            resolve: ({ detail }) => ({ kind: 'boolean', value: detail.stoneGroupId === 'juparana' }),
        };
        const html = render({
            stones: [staticSubject('juparana'), staticSubject('tuscany')],
            registry: [...stoneCompareRegistry, fake],
        });
        const keys = rowKeys(html);
        expect(keys).toContain('test-slip-rating');
        expect(keys.indexOf('test-slip-rating')).toBe(keys.indexOf('price-tier') + 1);
        expect(html).toContain('Test slip rating');
    });

    it('never renders origin or any other non-public attribute', () => {
        const alpine = staticSubject('alpine-white');
        alpine.detail = { ...alpine.detail, originLabel: 'ZZ-origin-sentinel' };
        const hidden: StoneCompareAttribute = {
            key: 'internal-note',
            label: 'Internal sourcing note',
            kind: 'text',
            public: false,
            order: 5,
            source: 'test fixture',
            resolve: () => ({ kind: 'text', text: 'ZZ-internal-sentinel' }),
        };
        const html = render({ stones: [alpine, staticSubject('new-grey')], registry: [...stoneCompareRegistry, hidden] });
        expect(stoneCompareRegistry.find((attribute) => attribute.key === 'origin')?.public).toBe(false);
        expect(rowKeys(html)).not.toContain('origin');
        expect(rowKeys(html)).not.toContain('internal-note');
        expect(html).not.toContain('ZZ-origin-sentinel');
        expect(html).not.toContain('ZZ-internal-sentinel');
        expect(html).not.toMatch(/>Origin</);
    });

    it('hides identical rows when Differences only is on', () => {
        // Both Granite: the type row matches and disappears; price tiers differ and stay.
        const stones = [staticSubject('alpine-white'), staticSubject('angola-black')];
        const all = rowKeys(render({ stones }));
        const differences = rowKeys(render({ stones, initialDifferencesOnly: true }));
        expect(all).toContain('type');
        expect(differences).not.toContain('type');
        expect(differences).toContain('price-tier');
        expect(differences.length).toBeLessThan(all.length);
    });

    it('shows Available as with visible states and no stone-level status pill', () => {
        const juparana = staticSubject('juparana');
        juparana.detail = {
            ...juparana.detail,
            availableAs: [
                { key: 'blocks', label: 'Blocks', offered: true },
                { key: 'pavers', label: 'Pavers', offered: false },
            ],
        };
        const html = render({ stones: [juparana, staticSubject('zen-grey')] });
        expect(rowKeys(html)).toContain('available-as');
        expect(html).toContain('Available as');
        expect(html).toContain('Not offered');
        expect(html).toContain('data-offered="false"');
        expect(html).not.toContain('data-status-pill');
        // Finish capability keeps its own legend; the stone column heads carry no state.
        const head = html.slice(html.indexOf('<thead>'), html.indexOf('</thead>'));
        expect(head).not.toMatch(/Available|Upcoming/);
    });

    it('links the sample request CTA with the stones prefilled', () => {
        const html = render({ stones: [staticSubject('juparana'), staticSubject('zen-grey')] });
        expect(html).toContain('Request samples');
        expect(html).toContain('href="/contact?intent=sample-request&amp;stone=Juparana%2C+Zen+Grey"');
    });

    it('reports ignored ids and the four-stone cap', () => {
        const html = render({
            stones: [staticSubject('juparana'), staticSubject('zen-grey')],
            missingIds: ['not-a-stone'],
            overflowCount: 1,
        });
        expect(html).toContain('not found in the Stone Library and left out: not-a-stone');
        expect(html).toContain('Compare shows up to 4 stones; 1 more was left out.');
    });

    it('shows an empty state linking back to the Stone Library', () => {
        const html = render({ stones: [], missingIds: ['nope'] });
        expect(html).toContain('data-compare-state="empty"');
        expect(html).toContain('No stones to compare yet.');
        expect(html).toContain('href="/stone-library"');
        expect(html).not.toContain('<table');
    });
});
