import { useContext, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { ChevronDown, Copy, MapPin, MapPinOff, Plus } from "lucide-react";
import {
  addBlock,
  blockImageId,
  createProjectDraftKey,
  defaultMaterialPointImageTitle,
  disableBlockPoints,
  enableBlockPoints,
  duplicateBlock,
  hotspotsForBlock,
  insertBlocks,
  removeBlock,
  setBlockImage,
  updateBlockContent,
  type ProjectAggregateDraft,
  type ProjectAggregateMappingContext,
  type ProjectBlockDraft,
  type ProjectFinishOption,
  type ProjectHotspotDraft,
  type ProjectMaterialDraft,
  type ProjectMediaOption,
  type ProjectMoveDirection,
  type ProjectOrderedCollection,
  type ProjectStoneFinishCapabilityOption,
  type ProjectStoneOption,
  type ProjectStoneVariantOption,
} from "../../../../features/projects/projectAggregate";
import {
  BLOCK_TEXT_LIMITS,
  contentBlockDefinition,
  summarizeContentBlock,
  type ContentBlockType,
} from "../../../../features/blocks/schema";
import AddBlockPanel from "../../../../components/admin/blocks/AddBlockPanel";
import BlockForm from "../../../../components/admin/blocks/BlockForm";
import { BlockTextField } from "../../../../components/admin/blocks/BlockFormControls";
import BlockTypeIcon from "../../../../components/admin/blocks/BlockTypeIcon";
import {
  BlockFormContext,
  type BlockFormHost,
} from "../../../../components/admin/blocks/blockFormContext";
import InlineMediaField from "../InlineMediaField";
import VisualHotspotEditor from "../VisualHotspotEditor";
import {
  EmptyCopy,
  InlineConfirm,
  MaterialFields,
  OrderControls,
  ProjectSection,
  RemoveButton,
  StoneLibraryMaterialPreview,
  TextField,
} from "./EditorControls";
import {
  ProjectMutationDisabledContext,
  fieldClass,
  mediaBlockId,
  safeDomKey,
  secondaryButtonClass,
  textareaClass,
  type UpdateProjectCollection,
} from "./editorContext";

type PendingRemoval = { kind: "points" | "block"; key: string; count: number };

const newMaterialOptionValue = "__new_material__";

interface BodySectionProps {
  draft: ProjectAggregateDraft;
  context: ProjectAggregateMappingContext;
  media: readonly ProjectMediaOption[];
  stones: readonly ProjectStoneOption[];
  stoneVariants: readonly ProjectStoneVariantOption[];
  finishes: readonly ProjectFinishOption[];
  finishCapabilities: readonly ProjectStoneFinishCapabilityOption[];
  userId: string | null;
  canEdit: boolean;
  canCleanUpStorage: boolean;
  isSaving: boolean;
  showReload: boolean;
  hasPendingMedia: boolean;
  open: boolean;
  /** Block to open and bring into view (a publish blocker was chosen). */
  revealBlock: { key: string } | null;
  onToggle: () => void;
  onChange: (draft: ProjectAggregateDraft) => void;
  buildMaterial: () => ProjectMaterialDraft;
  mediaFieldDisabled: (instanceKey: string) => boolean;
  onMediaPendingChange: (instanceKey: string, pending: boolean) => void;
  onMediaBusyChange: (instanceKey: string, busy: boolean) => void;
  onAssetCreated: (asset: ProjectMediaOption) => void;
  moveItem: (
    collection: ProjectOrderedCollection,
    key: string,
    direction: ProjectMoveDirection,
  ) => void;
  updateCollection: UpdateProjectCollection;
}

/**
 * The page body: ordered content blocks with an Add block panel, collapsible block cards and
 * one form per block type. Material points are placed directly on image blocks.
 */
export default function BodySection({
  draft,
  context,
  media,
  stones,
  stoneVariants,
  finishes,
  finishCapabilities,
  userId,
  canEdit,
  canCleanUpStorage,
  isSaving,
  showReload,
  hasPendingMedia,
  open,
  revealBlock,
  onToggle,
  onChange,
  buildMaterial,
  mediaFieldDisabled,
  onMediaPendingChange,
  onMediaBusyChange,
  onAssetCreated,
  moveItem,
  updateCollection,
}: BodySectionProps) {
  const editorFieldsDisabled = useContext(ProjectMutationDisabledContext);
  const [selectedPointKeys, setSelectedPointKeys] = useState<
    Record<string, string>
  >({});
  const [materialEditorPointKey, setMaterialEditorPointKey] = useState<
    string | null
  >(null);
  const [replacedImageBlockKeys, setReplacedImageBlockKeys] = useState<
    Set<string>
  >(() => new Set());
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null,
  );
  const hasYoutubeVideo = draft.blocks.some((block) => block.type === "video");
  const [openBlockKeys, setOpenBlockKeys] = useState<Set<string>>(() => new Set());
  const [insertAt, setInsertAt] = useState<number | null>(null);

  useEffect(() => {
    if (!revealBlock) return;
    setOpenBlockKeys((current) => new Set(current).add(revealBlock.key));
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.getElementById(mediaBlockId(revealBlock.key))?.scrollIntoView({ behavior: "smooth", block: "start" }),
      ),
    );
  }, [revealBlock]);

  const formHost = useMemo<BlockFormHost>(
    () => ({
      disabled: editorFieldsDisabled,
      stones: stones.map((stone) => ({ id: stone.id, label: stone.label, status: stone.status })),
      finishes: finishes
        .filter((finish) => finish.status !== "archived")
        .map((finish) => ({ key: finish.key, label: finish.label })),
      renderImageField: (request) => (
        <InlineMediaField
          key={request.instanceKey}
          label={request.label}
          value={request.value}
          assets={media}
          userId={userId}
          canCleanUpStorage={canCleanUpStorage}
          disabled={mediaFieldDisabled(request.instanceKey)}
          instanceKey={request.instanceKey}
          onPendingChange={onMediaPendingChange}
          onBusyChange={onMediaBusyChange}
          onChange={(value) => request.onChange(value, describedAlt(value))}
          onAssetCreated={onAssetCreated}
        />
      ),
    }),
    // describedAlt reads the same media list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorFieldsDisabled, stones, finishes, media, userId, canCleanUpStorage, mediaFieldDisabled, onMediaPendingChange, onMediaBusyChange, onAssetCreated],
  );

  function describedAlt(mediaAssetId: number | null) {
    return mediaAssetId ? media.find((asset) => asset.id === mediaAssetId)?.alt?.trim() ?? "" : "";
  }

  function toggleBlock(key: string) {
    setOpenBlockKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function showNewBlock(nextDraft: ProjectAggregateDraft, key: string) {
    onChange(nextDraft);
    setOpenBlockKeys((current) => new Set(current).add(key));
    setInsertAt(null);
    requestAnimationFrame(() =>
      document.getElementById(mediaBlockId(key))?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function addNewBlock(type: ContentBlockType, index: number) {
    const added = addBlock(draft, type, index);
    showNewBlock(added.draft, added.key);
  }

  function copyBlock(block: ProjectBlockDraft, index: number) {
    const copy = duplicateBlock(draft, block.key, describedAlt(blockImageId(draft, block)));
    if (copy) showNewBlock(insertBlocks(draft, index + 1, [copy]), copy.key);
  }

  function updateContent(block: ProjectBlockDraft, changes: Record<string, unknown>) {
    onChange(updateBlockContent(draft, block.key, { ...block.content, ...changes } as ProjectBlockDraft["content"]));
  }

  function contentText(block: ProjectBlockDraft, field: string) {
    const value = (block.content as unknown as Record<string, unknown>)[field];
    return typeof value === "string" ? value : "";
  }

  function requestBlockRemoval(block: ProjectBlockDraft) {
    const count = hotspotsForBlock(draft, block.key).length;
    if (count === 0) {
      setPendingRemoval(null);
      onChange(removeBlock(draft, block.key));
    } else {
      setPendingRemoval({ kind: "block", key: block.key, count });
    }
  }

  function requestPointsRemoval(block: ProjectBlockDraft) {
    const count = hotspotsForBlock(draft, block.key).length;
    if (count === 0) {
      setPendingRemoval(null);
      onChange(disableBlockPoints(draft, block.key));
    } else {
      setPendingRemoval({ kind: "points", key: block.key, count });
    }
  }

  function confirmPendingRemoval() {
    if (!pendingRemoval) return;
    const { kind, key } = pendingRemoval;
    setPendingRemoval(null);
    if (kind === "block") onChange(removeBlock(draft, key));
    else onChange(disableBlockPoints(draft, key));
  }

  function enablePoints(block: ProjectBlockDraft) {
    setPendingRemoval(null);
    onChange(enableBlockPoints(draft, block.key));
  }

  function changeBlockImage(block: ProjectBlockDraft, value: number | null) {
    const hasPoints =
      block.type === "hotspot_image" &&
      hotspotsForBlock(draft, block.key).length > 0;
    onChange(setBlockImage(draft, block.key, value, describedAlt(value)));
    if (hasPoints && value !== blockImageId(draft, block)) {
      setReplacedImageBlockKeys((current) => new Set(current).add(block.key));
    }
  }

  function selectPoint(blockKey: string, hotspotKey: string) {
    setSelectedPointKeys((current) => ({ ...current, [blockKey]: hotspotKey }));
  }

  function addHotspot(
    block: ProjectBlockDraft,
    position: { xPercent: number; yPercent: number },
  ) {
    if (block.type !== "hotspot_image" || !block.content.projectMaterialMapKey) return;
    const onlyMaterial = draft.materials.length === 1 ? draft.materials[0] : null;
    const key = createProjectDraftKey("hotspot");
    const next: ProjectHotspotDraft = {
      key,
      id: null,
      projectMaterialMapKey: block.content.projectMaterialMapKey,
      projectMaterialKey: onlyMaterial?.key ?? null,
      xPercent: position.xPercent,
      yPercent: position.yPercent,
      label: "",
      application: "",
      note: "",
      previewMediaId: null,
      sortOrder: hotspotsForBlock(draft, block.key).length,
    };
    onChange({
      ...draft,
      hotspots: [...draft.hotspots, next],
    });
    selectPoint(block.key, key);
  }

  function removeHotspot(key: string) {
    onChange({
      ...draft,
      hotspots: draft.hotspots.filter((hotspot) => hotspot.key !== key),
    });
  }

  function choosePointMaterial(hotspot: ProjectHotspotDraft, value: string) {
    if (value === newMaterialOptionValue) {
      const material = buildMaterial();
      onChange({
        ...draft,
        materials: [...draft.materials, material],
        hotspots: draft.hotspots.map((entry) =>
          entry.key === hotspot.key
            ? { ...entry, projectMaterialKey: material.key }
            : entry,
        ),
      });
      setMaterialEditorPointKey(hotspot.key);
      return;
    }
    updateCollection("hotspots", hotspot.key, {
      projectMaterialKey: value || null,
    });
  }

  function handlePointTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    blockKey: string,
    points: readonly ProjectHotspotDraft[],
    currentIndex: number,
  ) {
    if (points.length < 2) return;
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + points.length) % points.length;
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % points.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = points.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const nextPoint = points[nextIndex];
    selectPoint(blockKey, nextPoint.key);
    requestAnimationFrame(() =>
      document.getElementById(pointTabId(nextPoint.key))?.focus(),
    );
  }

  function materialOptionLabel(material: ProjectMaterialDraft, index: number) {
    const stone = stones.find((entry) => entry.id === material.stoneGroupId);
    const finish = finishes.find((entry) => entry.id === material.finishDefinitionId);
    const name = [stone?.label, finish?.label].filter(Boolean).join(" · ");
    const use = material.application.trim();
    if (name && use) return `${name} — ${use}`;
    return name || use || `Material ${index + 1}`;
  }

  function renderPendingRemoval(kind: PendingRemoval["kind"], key: string) {
    if (!pendingRemoval || pendingRemoval.kind !== kind || pendingRemoval.key !== key)
      return null;
    const count = pendingRemoval.count;
    const points = `${count} material ${count === 1 ? "point" : "points"}`;
    const copy: Record<PendingRemoval["kind"], { message: string; confirmLabel: string; keepLabel: string }> = {
      points: {
        message: `Turn off material points? This deletes ${points}; the image stays on the page.`,
        confirmLabel: "Delete points",
        keepLabel: "Keep points",
      },
      block: {
        message: `Remove this image and its ${points}?`,
        confirmLabel: "Remove image",
        keepLabel: "Keep image",
      },
    };
    return (
      <InlineConfirm
        message={copy[kind].message}
        confirmLabel={copy[kind].confirmLabel}
        keepLabel={copy[kind].keepLabel}
        onConfirm={confirmPendingRemoval}
        onKeep={() => setPendingRemoval(null)}
      />
    );
  }

  function renderPointsArea(block: ProjectBlockDraft, blockIndex: number) {
    const points = hotspotsForBlock(draft, block.key);
    const selected =
      points.find((point) => point.key === selectedPointKeys[block.key]) ??
      points[0] ??
      null;
    const selectedIndex = selected
      ? points.findIndex((point) => point.key === selected.key)
      : -1;
    const selectedMaterial = selected?.projectMaterialKey
      ? draft.materials.find((material) => material.key === selected.projectMaterialKey) ?? null
      : null;
    const imageId = blockImageId(draft, block);
    const image = media.find((asset) => asset.id === imageId) ?? null;
    const materialEditorOpen =
      Boolean(selected && selectedMaterial) &&
      materialEditorPointKey === selected?.key;

    return (
      <div className="mt-5 border-t border-black/10 pt-5">
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <VisualHotspotEditor
            imageUrl={image?.previewUrl || image?.sourceUrl || ""}
            imageAlt={
              image?.alt ||
              `${draft.project.title || "Project"} image ${blockIndex + 1}`
            }
            hotspots={points}
            selectedKey={selected?.key ?? null}
            disabled={isSaving || showReload}
            readOnly={!canEdit || hasPendingMedia || showReload}
            selectionDisabled={hasPendingMedia || showReload}
            onAdd={(position) => addHotspot(block, position)}
            onSelect={(key) => selectPoint(block.key, key)}
            onMove={(key, position) =>
              updateCollection("hotspots", key, position)
            }
          />
          <div className="min-w-0">
            {points.length ? (
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label={`Material points on block ${blockIndex + 1}`}
              >
                {points.map((point, index) => (
                  <button
                    key={point.key}
                    id={pointTabId(point.key)}
                    type="button"
                    role="tab"
                    aria-selected={selected?.key === point.key}
                    aria-controls={pointPanelId(block.key)}
                    tabIndex={selected?.key === point.key ? 0 : -1}
                    onClick={() => selectPoint(block.key, point.key)}
                    onKeyDown={(event) =>
                      handlePointTabKeyDown(event, block.key, points, index)
                    }
                    disabled={hasPendingMedia || showReload}
                    className={[
                      "min-h-9 rounded border px-3 text-[11px] font-bold uppercase tracking-[0.11em] transition",
                      selected?.key === point.key
                        ? "border-black bg-black text-white"
                        : "border-black/15 bg-white text-black/58 hover:border-black",
                      !point.projectMaterialKey ? "ring-1 ring-amber-400" : "",
                    ].join(" ")}
                  >
                    Point {index + 1}
                  </button>
                ))}
              </div>
            ) : null}

            {selected ? (
              <div
                id={pointPanelId(block.key)}
                role="tabpanel"
                aria-labelledby={pointTabId(selected.key)}
                className="mt-4 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-black">
                    Selected point {selectedIndex + 1}
                  </h4>
                  <div className="flex items-center gap-2">
                    <OrderControls
                      itemLabel={`point ${selectedIndex + 1}`}
                      isFirst={selectedIndex === 0}
                      isLast={selectedIndex === points.length - 1}
                      onMoveUp={() => moveItem("hotspots", selected.key, "up")}
                      onMoveDown={() =>
                        moveItem("hotspots", selected.key, "down")
                      }
                    />
                    <RemoveButton
                      label="Remove point"
                      onClick={() => removeHotspot(selected.key)}
                    />
                  </div>
                </div>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Material
                  <select
                    disabled={editorFieldsDisabled}
                    value={selected.projectMaterialKey ?? ""}
                    onChange={(event) =>
                      choosePointMaterial(selected, event.target.value)
                    }
                    className={fieldClass}
                  >
                    <option value="">Choose a material</option>
                    {draft.materials.map((material, index) => (
                      <option key={material.key} value={material.key}>
                        {materialOptionLabel(material, index)}
                      </option>
                    ))}
                    <option value={newMaterialOptionValue}>
                      ＋ Add new material…
                    </option>
                  </select>
                </label>
                <TextField
                  label="Where it is used"
                  value={selected.application}
                  onChange={(value) =>
                    updateCollection("hotspots", selected.key, {
                      application: value,
                    })
                  }
                  placeholder={
                    selectedMaterial?.application.trim() ||
                    "Seating pods and low elements"
                  }
                />
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Point note
                  <textarea
                    disabled={editorFieldsDisabled}
                    value={selected.note}
                    onChange={(event) =>
                      updateCollection("hotspots", selected.key, {
                        note: event.target.value,
                      })
                    }
                    className={textareaClass}
                  />
                </label>
                {selectedMaterial ? (
                  <div>
                    {materialEditorOpen ? (
                      <div className="border border-black/10 bg-white p-4">
                        <p className="text-xs font-semibold leading-5 text-black/52">
                          Material details apply everywhere this material is used.
                        </p>
                        <MaterialFields
                          material={selectedMaterial}
                          stones={stones}
                          stoneVariants={stoneVariants}
                          finishes={finishes}
                          finishCapabilities={finishCapabilities}
                          context={context}
                          onChange={(changes) =>
                            updateCollection("materials", selectedMaterial.key, changes)
                          }
                        />
                      </div>
                    ) : (
                      <StoneLibraryMaterialPreview
                        material={selectedMaterial}
                        context={context}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setMaterialEditorPointKey(
                          materialEditorOpen ? null : selected.key,
                        )
                      }
                      className={`${secondaryButtonClass} mt-3`}
                    >
                      {materialEditorOpen
                        ? "Close material details"
                        : "Edit material details"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="border border-dashed border-black/20 bg-white p-4 text-sm leading-6 text-black/50">
                {imageId
                  ? "Click the image to add the first point."
                  : "Choose the image first, then click it to add points."}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => requestPointsRemoval(block)}
            disabled={editorFieldsDisabled}
            className={`${secondaryButtonClass} hover:border-red-700 hover:text-red-700`}
          >
            <MapPinOff className="h-4 w-4" />
            Turn off material points
          </button>
        </div>
        {renderPendingRemoval("points", block.key)}
      </div>
    );
  }

  function renderInsertPoint(index: number, last: boolean) {
    if (insertAt === index) {
      return (
        <AddBlockPanel
          heading={last ? "Add a block at the end" : `Add a block before block ${index + 1}`}
          unavailable={hasYoutubeVideo ? { video: "This project already has its one video." } : undefined}
          onAdd={(type) => addNewBlock(type, index)}
          onClose={() => setInsertAt(null)}
        />
      );
    }
    return (
      <div className={last ? "pt-1" : "flex justify-center"}>
        <button
          type="button"
          onClick={() => setInsertAt(index)}
          disabled={editorFieldsDisabled}
          className={last ? secondaryButtonClass : "inline-flex min-h-8 items-center gap-1 rounded px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/45 transition hover:bg-black/[0.04] hover:text-black disabled:cursor-not-allowed disabled:text-black/25"}
        >
          <Plus className="h-4 w-4" />
          {last ? "Add block" : "Add block here"}
        </button>
      </div>
    );
  }

  function renderImageBlockBody(block: ProjectBlockDraft, index: number) {
    const hasPoints = block.type === "hotspot_image";
    const pointCount = hasPoints ? hotspotsForBlock(draft, block.key).length : 0;
    const imageId = blockImageId(draft, block);
    return (
      <>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <InlineMediaField
            key={`media-${block.key}`}
            label={hasPoints ? "Image with material points" : "Image"}
            value={imageId}
            assets={media}
            userId={userId}
            canCleanUpStorage={canCleanUpStorage}
            disabled={mediaFieldDisabled(`media-${block.key}`)}
            instanceKey={`media-${block.key}`}
            onPendingChange={onMediaPendingChange}
            onBusyChange={onMediaBusyChange}
            onChange={(value) => changeBlockImage(block, value)}
            onAssetCreated={onAssetCreated}
          />
          <div className="grid gap-4">
            {hasPoints ? (
              <TextField
                label="Title above the image"
                value={contentText(block, "title")}
                onChange={(value) => updateContent(block, { title: value })}
                placeholder={defaultMaterialPointImageTitle}
              />
            ) : (
              <>
                <BlockTextField
                  label="Image description"
                  value={contentText(block, "alt")}
                  maxLength={BLOCK_TEXT_LIMITS.short}
                  hint="Read aloud to visitors who cannot see the picture."
                  onChange={(value) => updateContent(block, { alt: value })}
                />
                <TextField
                  label="Small label"
                  value={contentText(block, "label")}
                  onChange={(value) => updateContent(block, { label: value })}
                  placeholder="Detail"
                />
              </>
            )}
            <TextField
              label="Caption"
              value={contentText(block, "caption")}
              onChange={(value) => updateContent(block, { caption: value })}
            />
          </div>
        </div>
        {hasPoints && pointCount > 0 && replacedImageBlockKeys.has(block.key) ? (
          <p
            className="mt-3 border border-amber-300 bg-amber-50 p-3 text-sm font-medium leading-6 text-amber-900"
            role="status"
          >
            Points keep their positions. Check they still
            sit on the right materials.
          </p>
        ) : null}
        {hasPoints ? (
          renderPointsArea(block, index)
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => enablePoints(block)}
              disabled={editorFieldsDisabled || !imageId}
              className={secondaryButtonClass}
            >
              <MapPin className="h-4 w-4" />
              Mark materials on this image
            </button>
            {!imageId ? (
              <span className="text-xs font-semibold text-black/45">
                Choose the image first.
              </span>
            ) : null}
          </div>
        )}
      </>
    );
  }

  function renderBlock(block: ProjectBlockDraft, index: number): ReactNode {
    const definition = contentBlockDefinition(block.type);
    const isImage = block.type === "image" || block.type === "hotspot_image";
    const pointCount = block.type === "hotspot_image" ? hotspotsForBlock(draft, block.key).length : 0;
    const isOpen = openBlockKeys.has(block.key);
    const summary = summarizeContentBlock(block);
    const bodyId = `${mediaBlockId(block.key)}-form`;
    return (
      <article
        key={block.key}
        id={mediaBlockId(block.key)}
        className="scroll-mt-28 border border-black/10 bg-[#f8f9f5] p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => toggleBlock(block.key)}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            className="flex min-w-0 flex-1 items-start gap-3 text-left"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-black/10 bg-white">
              <BlockTypeIcon type={block.type} className="h-4 w-4 text-black/70" />
            </span>
            <span className="min-w-0">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-black/52">
                Block {index + 1} · {definition.label}
              </h3>
              <span className="mt-1 block truncate text-sm font-semibold text-black/80">
                {summary || "Not filled in yet"}
              </span>
            </span>
            <ChevronDown className={`mt-2 h-4 w-4 shrink-0 text-black/50 transition ${isOpen ? "rotate-180" : ""}`} />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {pointCount > 0 ? (
              <span className="inline-flex min-h-6 items-center gap-1 rounded border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                <MapPin className="h-3 w-3" />
                {pointCount} material{" "}
                {pointCount === 1 ? "point" : "points"}
              </span>
            ) : null}
            <OrderControls
              itemLabel={`block ${index + 1}`}
              isFirst={index === 0}
              isLast={index === draft.blocks.length - 1}
              onMoveUp={() => moveItem("blocks", block.key, "up")}
              onMoveDown={() => moveItem("blocks", block.key, "down")}
            />
            <button
              type="button"
              onClick={() => copyBlock(block, index)}
              disabled={editorFieldsDisabled || (block.type === "video")}
              className="inline-flex h-9 items-center gap-1 rounded border border-black/15 bg-white px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black/58 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:text-black/25"
              title={block.type === "video" ? "A project has one video" : undefined}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
            <RemoveButton
              label="Remove block"
              onClick={() => requestBlockRemoval(block)}
            />
          </div>
        </div>
        {renderPendingRemoval("block", block.key)}
        <div id={bodyId} hidden={!isOpen} className="mt-4 border-t border-black/10 pt-4">
          {isImage ? (
            renderImageBlockBody(block, index)
          ) : (
            <BlockForm
              block={block}
              instanceKey={`media-${block.key}`}
              onChange={(content) => onChange(updateBlockContent(draft, block.key, content))}
            />
          )}
        </div>
      </article>
    );
  }

  return (
    <ProjectSection
      id="project-body"
      title="Body"
      summary="The page story in blocks: headings, text, numbers, steps, tables, stones, images and video, in public-page order."
      open={open}
      onToggle={onToggle}
    >
      <BlockFormContext.Provider value={formHost}>
        {draft.blocks.length ? (
          <div className="space-y-2">
            {draft.blocks.map((block, index) => (
              <div key={block.key} className="space-y-2">
                {renderInsertPoint(index, false)}
                {renderBlock(block, index)}
              </div>
            ))}
            {renderInsertPoint(draft.blocks.length, true)}
          </div>
        ) : (
          <div className="space-y-3">
            <EmptyCopy>
              Add blocks in the order they should appear on the page.
            </EmptyCopy>
            {renderInsertPoint(0, true)}
          </div>
        )}
      </BlockFormContext.Provider>
    </ProjectSection>
  );
}

function pointTabId(key: string) {
  return `project-point-tab-${safeDomKey(key)}`;
}

function pointPanelId(blockKey: string) {
  return `project-point-panel-${safeDomKey(blockKey)}`;
}
