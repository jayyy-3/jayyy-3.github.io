import { createContext, type ReactNode } from 'react';

export interface BlockImageFieldRequest {
  label: string;
  value: number | null;
  /** Stable per block and item so a pending upload never moves to another field. */
  instanceKey: string;
  /** Receives the chosen media item and its description (to prefill the block's own). */
  onChange: (mediaAssetId: number | null, description: string) => void;
}

export interface BlockStoneOption {
  id: number;
  label: string;
  status: string;
}

export interface BlockFinishOption {
  key: string;
  label: string;
}

/**
 * What a host editor (Projects now, Articles later) supplies to the shared block forms: the
 * lock state, its media picker and the Stone Library options.
 */
export interface BlockFormHost {
  disabled: boolean;
  renderImageField: (request: BlockImageFieldRequest) => ReactNode;
  stones: readonly BlockStoneOption[];
  finishes: readonly BlockFinishOption[];
}

export const BlockFormContext = createContext<BlockFormHost>({
  disabled: true,
  renderImageField: () => null,
  stones: [],
  finishes: [],
});
