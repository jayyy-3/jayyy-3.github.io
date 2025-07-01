import { materialCategories, type MaterialItem } from '../data/materialData';

/**
 * 给定 slug 返回完整的 MaterialItem（e.g. 用于产品选中材质图标）
 */
export function getMaterialBySlug(slug: string): MaterialItem | undefined {
    for (const category of materialCategories) {
        for (const sub of category.subCategories) {
            for (const item of sub.items) {
                if (item.slug === slug) return item;
            }
        }
    }
    return undefined;
}
