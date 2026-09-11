import { createContext } from "react";
import type { ProjectAggregateDraft } from "../../../../features/projects/projectAggregate";

/** True while the Viewer role, a save, a conflict or a pending image change locks edits. */
export const ProjectMutationDisabledContext = createContext(false);

export const fieldClass =
  "mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/45";
export const textareaClass = `${fieldClass} min-h-28 py-3 leading-6`;
export const secondaryButtonClass =
  "inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/30";

export type ProjectDraftCollection = "facts" | "materials" | "mediaBlocks" | "hotspots";
export type UpdateProjectCollection = <Collection extends ProjectDraftCollection>(
  collection: Collection,
  key: string,
  changes: Partial<ProjectAggregateDraft[Collection][number]>,
) => void;

export function safeDomKey(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function mediaBlockId(key: string) {
  return `project-media-block-${safeDomKey(key)}`;
}
