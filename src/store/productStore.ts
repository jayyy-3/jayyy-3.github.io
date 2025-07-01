import { create } from 'zustand';
import type { MaterialCategory, SelectedMaterials } from '../types/product';

interface ProductStoreState {
    /** Which swatch slug is chosen for each category */
    selectedMaterials: SelectedMaterials;

    /** Which model (Core / TimberRise …) is showing for the current product */
    currentModelKey: string;

    /** Current product slug, if you keep it */
    productSlug?: string;

    /* ────── setters ────── */
    setMaterial: (category: MaterialCategory, slug: string) => void;
    setProduct: (slug: string, defaultModel: string) => void;
    selectModel: (modelKey: string) => void;
}

export const useProductStore = create<ProductStoreState>((set) => ({
    selectedMaterials: {},
    currentModelKey: '',
    setMaterial: (category, slug) =>
        set((s) => ({
            selectedMaterials: { ...s.selectedMaterials, [category]: slug },
        })),
    setProduct: (slug, defaultModel) =>
        set(() => ({
            productSlug: slug,
            currentModelKey: defaultModel,
            selectedMaterials: {},            // reset on product change
        })),
    selectModel: (modelKey) =>          // ← 新增
        set(() => ({ currentModelKey: modelKey })),
}));
