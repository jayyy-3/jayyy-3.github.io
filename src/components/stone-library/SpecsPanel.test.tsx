import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import FinishAccordion from './FinishAccordion';
import SpecsPanel from './SpecsPanel';
import type { FinishVM } from '../../types/stone-library';

function panel() {
    return renderToStaticMarkup(
        <MemoryRouter>
            <SpecsPanel
                stoneName="Zen Grey"
                stoneType="Granite"
                rawBlockLabel="Raw block"
                availableAs={[{ key: 'blocks', label: 'Blocks', offered: false }]}
                priceRange=""
                priceTierLevel={null}
                priceTierLabel={null}
                pricePrimaryLabel="On request"
                finishCapabilities={[
                    { finishKey: 'honed', label: 'Honed', capability: 'yes' },
                    { finishKey: 'flamed', label: 'Flamed', capability: 'no' },
                    { finishKey: 'bush-hammered', label: 'Bush Hammered', capability: 'tbc' },
                ]}
                cutOptions={[{ cutOrientation: 'vein-cut', available: false } as never]}
            />
        </MemoryRouter>,
    );
}

describe('SpecsPanel finish capability wording', () => {
    it('reads yes as Samples In Stock and no as a tailored sample link', () => {
        const html = panel();
        expect(html).toContain('Samples In Stock');
        expect(html).toContain('Request a Tailored Sample');
        expect(html).toContain('Upcoming');
        expect(html).toContain('href="/contact?intent=sample-request&amp;stone=Zen+Grey+-+Flamed"');
        // Only the tailored pill is a link; Samples In Stock and Upcoming are not.
        expect(html.match(/data-tailored-sample-link/g)).toHaveLength(1);
        // Cut options and Available as keep their own wording.
        expect(html).toContain('Not offered');
    });

    it('labels the finish selector rail with Samples In Stock and Upcoming', () => {
        const finish = (capability: 'yes' | 'tbc'): FinishVM =>
            ({
                finishKey: capability,
                label: capability,
                capability,
                behavior: { summary: '', slip: '', glare: '', maintenance: '' },
                secondaryImages: [],
            }) as unknown as FinishVM;
        const html = renderToStaticMarkup(
            <FinishAccordion finishes={[finish('yes'), finish('tbc')]} activeFinishKey={null} onSelect={() => undefined} />,
        );
        expect(html).toContain('Samples In Stock');
        expect(html).toContain('Upcoming');
        expect(html).not.toContain('>Available<');
    });
});
