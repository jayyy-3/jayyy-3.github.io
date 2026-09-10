import { expect } from 'playwright/test'
export async function assertArticleSaveUnlocked(page, timeout = 5000) {
  await expect(page.getByRole('button', { name: 'Save article', exact: true })).toBeEnabled({ timeout })
}
