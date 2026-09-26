import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdminFeedback } from './AdminFeedback';
import type { AdminFeedbackState } from './useAdminFeedback';

const state = (overrides: Partial<AdminFeedbackState> = {}): AdminFeedbackState => ({
    id: 1,
    tone: 'success',
    message: 'Product saved.',
    detail: null,
    scope: 'product',
    ...overrides,
});

// Splits the markup into the polite status region and the alert region.
function regions(markup: string) {
    const status = markup.match(/<div role="status"[^>]*>([\s\S]*?)<\/div><div role="alert"/)?.[1] ?? null;
    const alert = markup.match(/<div role="alert"[^>]*>([\s\S]*)<\/div><\/div>$/)?.[1] ?? null;
    return { status, alert };
}

describe('AdminFeedback', () => {
    it('keeps both live regions mounted even with nothing to say', () => {
        const markup = renderToStaticMarkup(<AdminFeedback feedback={null} scope="product" />);
        expect(markup).toContain('role="status"');
        expect(markup).toContain('aria-live="polite"');
        expect(markup).toContain('role="alert"');
        expect(markup).not.toContain('Product saved.');
    });

    it('announces success politely next to its own action bar only', () => {
        const markup = renderToStaticMarkup(<AdminFeedback feedback={state()} scope="product" />);
        const { status, alert } = regions(markup);
        expect(status).toContain('Product saved.');
        expect(alert).toBe('');
        expect(renderToStaticMarkup(<AdminFeedback feedback={state()} scope="model" />)).not.toContain('Product saved.');
        expect(renderToStaticMarkup(<AdminFeedback feedback={state()} scope={['settings', 'product']} />)).toContain('Product saved.');
    });

    it('shows errors as an alert with the raw text behind Details and a dismiss button', () => {
        const markup = renderToStaticMarkup(
            <AdminFeedback
                feedback={state({
                    tone: 'error',
                    message: 'That website URL key is already used by another product.',
                    detail: 'duplicate key value violates unique constraint "products_slug_key" · Code: 23505',
                })}
                scope="product"
                onDismiss={() => undefined}
            />,
        );
        const { status, alert } = regions(markup);
        expect(status).toBe('');
        expect(alert).toContain('That website URL key is already used by another product.');
        expect(alert).toMatch(/<details[^>]*><summary[^>]*>Details<\/summary>/);
        expect(alert).toContain('products_slug_key');
        expect(alert).toContain('aria-label="Dismiss message"');
        expect(alert).toContain('data-feedback-tone="error"');
    });

    it('does not offer dismiss on success, which clears itself', () => {
        const markup = renderToStaticMarkup(<AdminFeedback feedback={state()} scope="product" onDismiss={() => undefined} />);
        expect(markup).not.toContain('Dismiss message');
    });

    it('can repeat a message beside a second button without announcing it twice', () => {
        const markup = renderToStaticMarkup(<AdminFeedback feedback={state()} scope="product" announce={false} />);
        expect(markup).toContain('Product saved.');
        expect(markup).not.toContain('role=');
        expect(markup).not.toContain('aria-live');
    });
});
