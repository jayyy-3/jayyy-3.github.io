// 可按需扩充
export type MaterialCategory = 'body' | 'frame' | 'battens';

export type SelectedMaterials = Partial<Record<MaterialCategory, string>>;

export interface MaterialRef {
    /** 对应 StoneLibraryService 提供的 stoneGroupId */
    slug: string;
    label: string;
    category: MaterialCategory;
    /** 可选：选项卡/缩略图 */
    img?: string;
}

export interface OptionItem {
    slug: string;
    name: string;
    img: string;
}

export interface ProductModel {
    key: string;          // 例：'core' | 'timberRise'
    label: string;        // UI 显示名
    img: string;          // Hero 图 / 主渲染图
}

export interface Product {
    slug: string;         // 路由路径
    name: string;         // 产品名
    shortDesc?: string;   // 列表卡片描述
    models: ProductModel[];
    /** 限定本产品可用的材质分类（默认全部可用） */
    materialWhitelist?: MaterialCategory[];
    /** 进入详情页时默认选中的材质 slug */
    defaultMaterials?: {
        body?: string;
        frame?: string;
        battens?: string;
    };
    /** 规格参数 (Key → Value) */
    specs?: Record<string, string>;
}
