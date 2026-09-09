import StoneLibraryService from './StoneLibraryService';
import { getStoneFinishImageResolution } from '../data/stoneFinishImages';
import type { QrMaterialSelection } from '../types/image-qr';
import type { FinishVM, StoneDetailVM } from '../types/stone-library';

export interface QrMaterialDetail {
  detail: StoneDetailVM;
  finish: FinishVM;
  variantLabel: string | null;
}

export async function loadQrMaterial(selection: QrMaterialSelection): Promise<QrMaterialDetail | null> {
  const detail = await StoneLibraryService.getPublishedStoneDetail(selection.stoneGroupId, selection.stoneVariantId)
    || StoneLibraryService.getStoneDetail(selection.stoneGroupId, selection.stoneVariantId);
  // The general Stone Library may choose its first variant; a fixed QR must not.
  if (!detail || detail.status !== 'active' || detail.activeVariantId !== selection.stoneVariantId) return null;
  const finish = detail.finishes.find((entry) => entry.finishKey === selection.finishKey);
  if (!finish || finish.capability !== 'yes' || !finish.imageUrl) return null;
  const staticImage = getStoneFinishImageResolution(selection.stoneVariantId, selection.finishKey);
  const hasExactStaticImage = staticImage.role === 'finish-specific' && staticImage.asset?.imageUrl === finish.imageUrl;
  if (finish.imageRole !== 'finish-specific' && !hasExactStaticImage) return null;
  const variant = detail.variants.find((entry) => entry.stoneVariantId === selection.stoneVariantId);
  return { detail, finish, variantLabel: variant?.label && variant.label !== 'Standard' ? variant.label : null };
}

export function qrStoneLibraryUrl(selection: QrMaterialSelection): string {
  const query = new URLSearchParams({ variant: selection.stoneVariantId, finish: selection.finishKey });
  return `/stone-library/${encodeURIComponent(selection.stoneGroupId)}?${query}`;
}

export function formatQrBlockSize(label: string): string {
  const trimmed = label.trim();
  if (/^\d+\s*[x×]\s*\d+\s*[x×]\s*\d+\s*(mm)?$/i.test(trimmed)) {
    return `${trimmed.replace(/\s*mm$/i, '').split(/[x×]/).map((part) => part.trim()).join(' × ')} mm`;
  }
  return trimmed;
}
