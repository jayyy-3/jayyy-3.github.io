import { useContext, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { MapPin, MapPinOff, Video } from "lucide-react";
import {
  createProjectDraftKey,
  defaultMaterialPointImageTitle,
  disableMediaBlockPoints,
  enableMediaBlockPoints,
  hotspotsForBlock,
  mediaBlockImageId,
  removeMediaBlock,
  setMediaBlockImage,
  type ProjectAggregateDraft,
  type ProjectAggregateMappingContext,
  type ProjectFinishOption,
  type ProjectHotspotDraft,
  type ProjectMaterialDraft,
  type ProjectMediaBlockDraft,
  type ProjectMediaOption,
  type ProjectMoveDirection,
  type ProjectOrderedCollection,
  type ProjectStoneFinishCapabilityOption,
  type ProjectStoneOption,
  type ProjectStoneVariantOption,
} from "../../../../features/projects/projectAggregate";
import InlineMediaField from "../InlineMediaField";
import VisualHotspotEditor from "../VisualHotspotEditor";
import {
  AddButton,
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

interface MediaSectionProps {
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
  onToggle: () => void;
  onChange: (draft: ProjectAggregateDraft) => void;
  onAddBlock: (role: "normal_image" | "youtube_video") => void;
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

/** Page images and video, including material points placed directly on any image. */
export default function MediaSection({
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
  onToggle,
  onChange,
  onAddBlock,
  buildMaterial,
  mediaFieldDisabled,
  onMediaPendingChange,
  onMediaBusyChange,
  onAssetCreated,
  moveItem,
  updateCollection,
}: MediaSectionProps) {
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
  const hasYoutubeVideo = draft.mediaBlocks.some(
    (block) => block.mediaRole === "youtube_video",
  );

  function requestBlockRemoval(block: ProjectMediaBlockDraft) {
    const count = hotspotsForBlock(draft, block.key).length;
    if (count === 0) {
      setPendingRemoval(null);
      onChange(removeMediaBlock(draft, block.key));
    } else {
      setPendingRemoval({ kind: "block", key: block.key, count });
    }
  }

  function requestPointsRemoval(block: ProjectMediaBlockDraft) {
    const count = hotspotsForBlock(draft, block.key).length;
    if (count === 0) {
      setPendingRemoval(null);
      onChange(disableMediaBlockPoints(draft, block.key));
    } else {
      setPendingRemoval({ kind: "points", key: block.key, count });
    }
  }

  function confirmPendingRemoval() {
    if (!pendingRemoval) return;
    const { kind, key } = pendingRemoval;
    setPendingRemoval(null);
    if (kind === "block") onChange(removeMediaBlock(draft, key));
    else onChange(disableMediaBlockPoints(draft, key));
  }

  function enablePoints(block: ProjectMediaBlockDraft) {
    setPendingRemoval(null);
    onChange(enableMediaBlockPoints(draft, block.key));
  }

  function changeBlockImage(block: ProjectMediaBlockDraft, value: number | null) {
    const hasPoints =
      block.mediaRole === "hotspot_image" &&
      hotspotsForBlock(draft, block.key).length > 0;
    onChange(setMediaBlockImage(draft, block.key, value));
    if (hasPoints && value !== mediaBlockImageId(draft, block)) {
      setReplacedImageBlockKeys((current) => new Set(current).add(block.key));
    }
  }

  function selectPoint(blockKey: string, hotspotKey: string) {
    setSelectedPointKeys((current) => ({ ...current, [blockKey]: hotspotKey }));
  }

  function addHotspot(
    block: ProjectMediaBlockDraft,
    position: { xPercent: number; yPercent: number },
  ) {
    if (block.mediaRole !== "hotspot_image" || !block.projectMaterialMapKey) return;
    const onlyMaterial = draft.materials.length === 1 ? draft.materials[0] : null;
    const key = createProjectDraftKey("hotspot");
    const next: ProjectHotspotDraft = {
      key,
      id: null,
      projectMaterialMapKey: block.projectMaterialMapKey,
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

  function renderPointsArea(block: ProjectMediaBlockDraft, blockIndex: number) {
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
    const imageId = mediaBlockImageId(draft, block);
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

  return (
    <ProjectSection
      id="project-media"
      title="Page images and video"
      summary="Images and video in public-page order. Mark materials directly on any image."
      action={
        <div className="flex flex-wrap gap-2">
          <AddButton
            label="Add image"
            onClick={() => onAddBlock("normal_image")}
            icon="image"
          />
          <AddButton
            label="Add video"
            onClick={() => onAddBlock("youtube_video")}
            disabled={hasYoutubeVideo}
          />
        </div>
      }
      open={open}
      onToggle={onToggle}
    >
      {draft.mediaBlocks.length ? (
        <div className="space-y-4">
          {draft.mediaBlocks.map((block, index) => {
            const isVideo = block.mediaRole === "youtube_video";
            const hasPoints = block.mediaRole === "hotspot_image";
            const pointCount = hasPoints
              ? hotspotsForBlock(draft, block.key).length
              : 0;
            const imageId = isVideo ? null : mediaBlockImageId(draft, block);

            return (
              <article
                key={block.key}
                id={mediaBlockId(block.key)}
                className="scroll-mt-28 border border-black/10 bg-[#f8f9f5] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-black/52">
                      Block {index + 1} · {isVideo ? "Video" : "Image"}
                    </h3>
                    {hasPoints ? (
                      <span className="inline-flex min-h-6 items-center gap-1 rounded border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                        <MapPin className="h-3 w-3" />
                        {pointCount} material{" "}
                        {pointCount === 1 ? "point" : "points"}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderControls
                      itemLabel={`media block ${index + 1}`}
                      isFirst={index === 0}
                      isLast={index === draft.mediaBlocks.length - 1}
                      onMoveUp={() =>
                        moveItem("mediaBlocks", block.key, "up")
                      }
                      onMoveDown={() =>
                        moveItem("mediaBlocks", block.key, "down")
                      }
                    />
                    <RemoveButton
                      label="Remove block"
                      onClick={() => requestBlockRemoval(block)}
                    />
                  </div>
                </div>
                {renderPendingRemoval("block", block.key)}

                {isVideo ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)] md:items-end">
                    <div
                      className="hidden aspect-square place-items-center border border-black/10 bg-white text-black/45 md:grid"
                      aria-hidden="true"
                    >
                      <Video className="h-6 w-6" />
                    </div>
                    <TextField
                      label="Video title"
                      value={block.blockTitle}
                      onChange={(value) =>
                        updateCollection("mediaBlocks", block.key, {
                          blockTitle: value,
                        })
                      }
                    />
                    <TextField
                      label="YouTube link"
                      value={block.youtubeUrl}
                      onChange={(value) =>
                        updateCollection("mediaBlocks", block.key, {
                          youtubeUrl: value,
                        })
                      }
                    />
                    <div className="md:col-span-3">
                      <TextField
                        label="Caption"
                        value={block.caption}
                        onChange={(value) =>
                          updateCollection("mediaBlocks", block.key, {
                            caption: value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
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
                            value={block.blockTitle}
                            onChange={(value) =>
                              updateCollection("mediaBlocks", block.key, {
                                blockTitle: value,
                              })
                            }
                            placeholder={defaultMaterialPointImageTitle}
                          />
                        ) : (
                          <TextField
                            label="Small label"
                            value={block.label}
                            onChange={(value) =>
                              updateCollection("mediaBlocks", block.key, {
                                label: value,
                              })
                            }
                            placeholder="Detail"
                          />
                        )}
                        <TextField
                          label="Caption"
                          value={block.caption}
                          onChange={(value) =>
                            updateCollection("mediaBlocks", block.key, {
                              caption: value,
                            })
                          }
                        />
                      </div>
                    </div>
                    {hasPoints &&
                    pointCount > 0 &&
                    replacedImageBlockKeys.has(block.key) ? (
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
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyCopy>
          Add images or video in the order they should appear.
        </EmptyCopy>
      )}
    </ProjectSection>
  );
}

function pointTabId(key: string) {
  return `project-point-tab-${safeDomKey(key)}`;
}

function pointPanelId(blockKey: string) {
  return `project-point-panel-${safeDomKey(blockKey)}`;
}
