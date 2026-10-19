import { describe, expect, test } from 'vitest';
import { PUBLISH_STORAGE_COPY_BUDGET } from '../functions/_lib/admin-projects.js';
import { createEmptyProjectAggregateDraft, getProjectPublishBlockers, type ProjectMediaOption } from '../src/features/projects/projectAggregate.ts';
import { PUBLISH_NEW_IMAGE_BUDGET, packagePublishBudgetMessage, projectPublishBudgetMessage } from '../src/features/blocks/publishBudget.ts';

describe('publish new-image budget', () => {
    test('the editor constant mirrors the Function budget', () => {
        expect(PUBLISH_NEW_IMAGE_BUDGET).toBe(PUBLISH_STORAGE_COPY_BUDGET);
    });

    test('messages carry the counts and the budget in plain words', () => {
        expect(packagePublishBudgetMessage(42)).toBe(
            `This package has 42 images. The website publishes up to ${PUBLISH_NEW_IMAGE_BUDGET} new images at a time: publish with up to ${PUBLISH_NEW_IMAGE_BUDGET} images first, then add the remaining images and publish again.`,
        );
        for (const message of [packagePublishBudgetMessage(42), projectPublishBudgetMessage(42)]) {
            expect(message).not.toMatch(/bucket|storage|subrequest|copy|promot/i);
        }
    });

    test('the editor shows the budget note only above the budget of not-yet-public images', () => {
        const media = (count: number, overrides: Partial<ProjectMediaOption> = {}): ProjectMediaOption[] =>
            Array.from({ length: count }, (_, index) => ({
                id: index + 1, bucket: 'urblo-admin-media', alt: `Photo ${index + 1}`, caption: null,
                objectPath: `p/${index + 1}.jpg`, sourceUrl: null, sourceKind: 'storage', mediaType: 'image', status: 'draft',
                ...overrides,
            }));
        const draftWith = (count: number) => {
            const draft = createEmptyProjectAggregateDraft();
            draft.project.heroMediaId = 1;
            for (let id = 2; id <= count; id += 1) {
                draft.blocks.push({ key: `block:new:${id}`, id: null, type: 'image', content: { mediaAssetId: id, alt: '', title: '', label: '', caption: '' }, sortOrder: id } as (typeof draft.blocks)[number]);
            }
            return draft;
        };
        const context = (assets: ProjectMediaOption[]) => ({ media: assets, stones: [], stoneVariants: [], finishes: [], finishCapabilities: [], finishImages: [] });
        const note = (count: number, assets: ProjectMediaOption[]) =>
            getProjectPublishBlockers(draftWith(count), context(assets)).find((blocker) => blocker.id === 'publish-image-budget');
        const over = PUBLISH_NEW_IMAGE_BUDGET + 1;
        expect(note(PUBLISH_NEW_IMAGE_BUDGET, media(PUBLISH_NEW_IMAGE_BUDGET))).toBeUndefined();
        expect(note(over, media(over))?.message).toBe(projectPublishBudgetMessage(over));
        expect(note(over, media(over, { bucket: 'urblo-public-media', status: 'published' }))).toBeUndefined();
    });
});
