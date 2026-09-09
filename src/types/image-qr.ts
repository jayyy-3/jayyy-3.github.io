export interface QrMaterialSelection {
  stoneGroupId: string;
  stoneVariantId: string;
  finishKey: string;
}

export interface QrMaterialOption extends QrMaterialSelection {
  stoneName: string;
  variantName: string;
  finishName: string;
}

export interface PublicImageQrResource {
  slug: string;
  name: string;
  productImageUrl: string;
  materialSelection: QrMaterialSelection;
}
