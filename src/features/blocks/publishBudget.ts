// NOW-PUBLISH-COPY-BUDGET-001: the number of not-yet-public images one Project Publish can make
// public. Mirrors `PUBLISH_STORAGE_COPY_BUDGET` in functions/_lib/admin-projects.js (derivation
// there and in docs/architecture/media.md); tests/publish-budget.test.ts asserts both values are equal.
export const PUBLISH_NEW_IMAGE_BUDGET = 30;

/** Review-step note for an import package that references more images than one Publish takes. */
export function packagePublishBudgetMessage(imageCount: number): string {
    return `This package has ${imageCount} images. The website publishes up to ${PUBLISH_NEW_IMAGE_BUDGET} new images at a time: publish with up to ${PUBLISH_NEW_IMAGE_BUDGET} images first, then add the remaining images and publish again.`;
}

/** Editor publish note; the wording matches the server's refusal. */
export function projectPublishBudgetMessage(newImageCount: number): string {
    return `This project has ${newImageCount} new images. Up to ${PUBLISH_NEW_IMAGE_BUDGET} new images can go live in one publish. Publish it with fewer new images first, then add the rest and publish again.`;
}
