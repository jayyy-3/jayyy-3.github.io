import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
    emptyStone,
    isAustralianOrigin,
    stoneDraftToDetail,
    stoneRecordToCard,
    type PublicStoneRecord,
    type StoneFinishDefinition,
} from '../../features/stone-library/stoneDraft';
import type { StoneCardVM } from '../../types/stone-library';
import ImageStage from './ImageStage';
import StoneCard from './StoneCard';

const finishes: StoneFinishDefinition[] = [{ id: 1, key: 'flamed', name: 'Flamed', sortOrder: 1 }];

function draft(originCountry: string) {
    const d = emptyStone(finishes);
    d.stone.name = 'Fixture';
    d.stone.slug = 'fixture';
    d.stone.type = 'Granite';
    d.stone.originCountry = originCountry;
    d.variants[0].slug = 'fixture';
    d.variants[0].finishes[0].capability = 'yes';
    return d;
}

describe('Australian stone derivation', () => {
    it('matches Australia trimmed and in any case', () => {
        for (const value of ['Australia', ' australia ', 'AUSTRALIA']) expect(isAustralianOrigin(value)).toBe(true);
    });

    it('rejects other countries and empty values', () => {
        for (const value of ['China', null, undefined, '', 'Australian', 'South Australia']) {
            expect(isAustralianOrigin(value)).toBe(false);
        }
    });
});

describe('Australian stone mapping', () => {
    it('derives the flag from the private origin for the admin preview', () => {
        expect(stoneDraftToDetail(draft(' Australia '), finishes, [])!.australianStone).toBe(true);
        expect(stoneDraftToDetail(draft('China'), finishes, [])!.australianStone).toBe(false);
    });

    it('uses the public catalogue boolean, whose origin string is blank', () => {
        const yes: PublicStoneRecord = { draft: draft(''), media: [] };
        yes.draft.stone.australianStone = true;
        const no: PublicStoneRecord = { draft: draft(''), media: [] };
        no.draft.stone.australianStone = false;
        expect(stoneDraftToDetail(yes.draft, finishes, [])!.australianStone).toBe(true);
        expect(stoneRecordToCard(yes, finishes).australianStone).toBe(true);
        expect(stoneRecordToCard(no, finishes).australianStone).toBe(false);
        // Pre-migration catalogue: no boolean and a blank origin means no badge.
        expect(stoneRecordToCard({ draft: draft(''), media: [] }, finishes).australianStone).toBe(false);
        expect(stoneRecordToCard(yes, finishes).originLabel).toBe('');
    });
});

describe('Australian stone badge rendering', () => {
    const card: StoneCardVM = {
        stoneGroupId: 'fixture',
        name: 'Fixture',
        stoneType: 'Granite',
        originLabel: 'ZZ-origin-sentinel',
        australianStone: true,
        finishCount: 1,
        availableFinishKeys: ['flamed'],
        variantCount: 1,
    };
    const renderCard = (stone: StoneCardVM) =>
        renderToStaticMarkup(
            <MemoryRouter>
                <StoneCard stone={stone} />
            </MemoryRouter>,
        );

    it('shows the badge as real text on a qualifying card and never the origin string', () => {
        const html = renderCard(card);
        expect(html).toContain('data-australian-stone-badge');
        expect(html).toContain('Australian stone');
        expect(html).not.toContain('ZZ-origin-sentinel');
    });

    it('omits the badge on other cards', () => {
        expect(renderCard({ ...card, australianStone: false })).not.toContain('data-australian-stone-badge');
    });

    it('overlays the detail stage only when flagged', () => {
        const detail = stoneDraftToDetail(draft('Australia'), finishes, [])!;
        const stage = (australianStone: boolean) =>
            renderToStaticMarkup(
                <ImageStage
                    stoneName="Fixture"
                    finishes={detail.finishes}
                    activeFinishKey={null}
                    centerRequestToken={0}
                    onSelect={() => {}}
                    onOpenLightbox={() => {}}
                    australianStone={australianStone}
                />,
            );
        expect(stage(true).match(/data-australian-stone-badge/g)?.length).toBe(1);
        expect(stage(false)).not.toContain('data-australian-stone-badge');
    });
});
