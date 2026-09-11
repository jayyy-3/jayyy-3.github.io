import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Eye,
  ImagePlus,
  MapPin,
  MapPinOff,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import {
  countHotspotsForMaterial,
  createProjectDraftKey,
  disableMediaBlockPoints,
  enableMediaBlockPoints,
  getProjectBlockerSections,
  getProjectPublishBlockers,
  hotspotsForBlock,
  mediaBlockImageId,
  moveProjectDraftItem,
  removeMediaBlock,
  setMediaBlockImage,
  slugify,
  defaultMaterialPointImageTitle,
  type ProjectAggregateDraft,
  type ProjectAggregateMappingContext,
  type ProjectEditorSection,
  type ProjectFinishOption,
  type ProjectHotspotDraft,
  type ProjectLifecycleStatus,
  type ProjectMaterialDraft,
  type ProjectMediaBlockDraft,
  type ProjectMediaOption,
  type ProjectMoveDirection,
  type ProjectOrderedCollection,
  type ProjectPublishBlocker,
  type ProjectStoneOption,
  type ProjectStoneVariantOption,
  type ProjectStoneFinishCapabilityOption,
  type ProjectStoneFinishImageOption,
} from "../../../features/projects/projectAggregate";
import InlineMediaField from "./InlineMediaField";
import ProjectDraftPreview from "./ProjectDraftPreview";
import VisualHotspotEditor from "./VisualHotspotEditor";

export type ProjectEditorAction = "save" | "publish" | "archive";

interface ProjectEditorProps {
  draft: ProjectAggregateDraft;
  isDirty: boolean;
  media: readonly ProjectMediaOption[];
  stones: readonly ProjectStoneOption[];
  stoneVariants: readonly ProjectStoneVariantOption[];
  finishes: readonly ProjectFinishOption[];
  finishCapabilities: readonly ProjectStoneFinishCapabilityOption[];
  finishImages: readonly ProjectStoneFinishImageOption[];
  userId: string | null;
  canEdit: boolean;
  canCleanUpStorage: boolean;
  isSaving: boolean;
  error: string | null;
  notice: string | null;
  onChange: (draft: ProjectAggregateDraft) => void;
  onAction: (action: ProjectEditorAction) => Promise<void> | void;
  onAssetCreated: (asset: ProjectMediaOption) => void;
  onMediaPendingChange?: (pending: boolean) => void;
  onMediaBusyChange?: (busy: boolean) => void;
  onDiscard: () => void;
  onReload: () => void;
  showReload: boolean;
}

type PendingRemoval =
  | { kind: "points"; key: string; count: number }
  | { kind: "block"; key: string; count: number }
  | { kind: "material"; key: string; count: number };

const newMaterialOptionValue = "__new_material__";
const fieldClass =
  "mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/45";
const textareaClass = `${fieldClass} min-h-28 py-3 leading-6`;
const actionButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded border px-4 text-xs font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed";
const secondaryButtonClass =
  "inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/30";
const ProjectMutationDisabledContext = createContext(false);

const editorSections: readonly {
  id: ProjectEditorSection;
  title: string;
}[] = [
  { id: "overview", title: "Hero and overview" },
  { id: "facts", title: "Project information" },
  { id: "media", title: "Page images and video" },
  { id: "materials", title: "Material schedule" },
];

export default function ProjectEditor({
  draft,
  isDirty,
  media,
  stones,
  stoneVariants,
  finishes,
  finishCapabilities,
  finishImages,
  userId,
  canEdit,
  canCleanUpStorage,
  isSaving,
  error,
  notice,
  onChange,
  onAction,
  onAssetCreated,
  onMediaPendingChange,
  onMediaBusyChange,
  onDiscard,
  onReload,
  showReload,
}: ProjectEditorProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Set<ProjectEditorSection>
  >(() => new Set());
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
  const [pendingMediaKeys, setPendingMediaKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [busyMediaKeys, setBusyMediaKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const context = useMemo<ProjectAggregateMappingContext>(
    () => ({ media, stones, stoneVariants, finishes, finishCapabilities, finishImages }),
    [finishCapabilities, finishImages, finishes, media, stoneVariants, stones],
  );
  const blockers = useMemo(
    () => getProjectPublishBlockers(draft, context),
    [context, draft],
  );
  const blockerSections = useMemo(
    () => getProjectBlockerSections(draft, context),
    [context, draft],
  );
  const hasYoutubeVideo = draft.mediaBlocks.some(
    (block) => block.mediaRole === "youtube_video",
  );
  const hasPendingMedia = pendingMediaKeys.size > 0;
  const hasActiveMediaRequest = busyMediaKeys.size > 0;
  const mutationDisabled = !canEdit || isSaving || showReload;
  const editorFieldsDisabled = mutationDisabled || hasPendingMedia;
  const sectionCounts: Record<ProjectEditorSection, number | null> = {
    overview: null,
    facts: draft.facts.length,
    media: draft.mediaBlocks.length,
    materials: draft.materials.length,
  };

  const handleMediaPendingChange = useCallback(
    (instanceKey: string, pending: boolean) => {
      setPendingMediaKeys((current) => {
        const hasKey = current.has(instanceKey);
        if (hasKey === pending) return current;
        const next = new Set(current);
        if (pending) next.add(instanceKey);
        else next.delete(instanceKey);
        return next;
      });
    },
    [],
  );

  const handleMediaBusyChange = useCallback(
    (instanceKey: string, busy: boolean) => {
      setBusyMediaKeys((current) => {
        const hasKey = current.has(instanceKey);
        if (hasKey === busy) return current;
        const next = new Set(current);
        if (busy) next.add(instanceKey);
        else next.delete(instanceKey);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    onMediaPendingChange?.(hasPendingMedia);
    return () => onMediaPendingChange?.(false);
  }, [hasPendingMedia, onMediaPendingChange]);

  useEffect(() => {
    onMediaBusyChange?.(hasActiveMediaRequest);
    return () => onMediaBusyChange?.(false);
  }, [hasActiveMediaRequest, onMediaBusyChange]);

  function mediaFieldDisabled(instanceKey: string) {
    return (
      mutationDisabled ||
      (hasPendingMedia && !pendingMediaKeys.has(instanceKey))
    );
  }

  function submitSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canEdit && isDirty && !isSaving && !hasPendingMedia && !showReload)
      void onAction("save");
  }

  function moveItem(
    collection: ProjectOrderedCollection,
    key: string,
    direction: ProjectMoveDirection,
  ) {
    onChange(moveProjectDraftItem(draft, collection, key, direction));
  }

  function toggleSection(section: ProjectEditorSection) {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  function expandSection(section: ProjectEditorSection) {
    setCollapsedSections((current) => {
      if (!current.has(section)) return current;
      const next = new Set(current);
      next.delete(section);
      return next;
    });
  }

  function updateProject<Key extends keyof ProjectAggregateDraft["project"]>(
    key: Key,
    value: ProjectAggregateDraft["project"][Key],
  ) {
    const project = {
      ...draft.project,
      [key]: value,
    };
    if (key === "title" && draft.project.id === null) {
      const oldAutoSlug = slugify(draft.project.title);
      if (!draft.project.slug || draft.project.slug === oldAutoSlug)
        project.slug = slugify(String(value));
    }
    onChange({ ...draft, project });
  }

  function updateCollection<
    Collection extends "facts" | "materials" | "mediaBlocks" | "hotspots",
  >(
    collection: Collection,
    key: string,
    changes: Partial<ProjectAggregateDraft[Collection][number]>,
  ) {
    onChange({
      ...draft,
      [collection]: draft[collection].map((row) =>
        row.key === key
          ? {
              ...row,
              ...changes,
            }
          : row,
      ),
    });
  }

  function removeFact(key: string) {
    onChange({ ...draft, facts: draft.facts.filter((row) => row.key !== key) });
  }

  function removeMaterialNow(key: string) {
    setPendingRemoval(null);
    onChange({
      ...draft,
      materials: draft.materials.filter((row) => row.key !== key),
      hotspots: draft.hotspots.map((hotspot) =>
        hotspot.projectMaterialKey === key
          ? { ...hotspot, projectMaterialKey: null }
          : hotspot,
      ),
    });
  }

  function requestMaterialRemoval(key: string) {
    const count = countHotspotsForMaterial(draft, key);
    if (count === 0) removeMaterialNow(key);
    else setPendingRemoval({ kind: "material", key, count });
  }

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
    if (kind === "material") removeMaterialNow(key);
    else if (kind === "block") onChange(removeMediaBlock(draft, key));
    else onChange(disableMediaBlockPoints(draft, key));
  }

  function addFact() {
    expandSection("facts");
    const key = createProjectDraftKey("fact");
    onChange({
      ...draft,
      facts: [
        ...draft.facts,
        {
          key,
          id: null,
          factLabel: "",
          factValue: "",
          factValueJson: null,
          claimStatus: "approved",
          sortOrder: draft.facts.length,
        },
      ],
    });
    scrollAfterRender("project-additional-facts");
  }

  function buildMaterial(): ProjectMaterialDraft {
    const stone = stones.find((entry) => entry.status !== "archived") ?? null;
    const variants = stoneVariants.filter((variant) => variant.stoneGroupId === stone?.id && variant.status !== "archived");
    const variant = variants[0] ?? null;
    const finishId = finishCapabilities.find((capability) => capability.stoneVariantId === variant?.id && capability.capability !== "no")?.finishDefinitionId ?? null;
    return {
      key: createProjectDraftKey("material"),
      id: null,
      stoneGroupId: stone?.id ?? null,
      stoneVariantId: variant?.id ?? null,
      finishDefinitionId: finishId,
      application: "",
      note: "",
      mediaAssetId: null,
      claimStatus: "approved",
      sortOrder: draft.materials.length,
    };
  }

  function addMaterial() {
    expandSection("materials");
    onChange({ ...draft, materials: [...draft.materials, buildMaterial()] });
    scrollAfterRender("project-materials");
  }

  function addMediaBlock(role: "normal_image" | "youtube_video") {
    expandSection("media");
    const key = createProjectDraftKey("media");
    onChange({
      ...draft,
      mediaBlocks: [
        ...draft.mediaBlocks,
        {
          key,
          id: null,
          mediaRole: role,
          mediaAssetId: null,
          projectMaterialMapKey: null,
          blockTitle: "",
          youtubeUrl: "",
          label: "",
          caption: "",
          sortOrder: draft.mediaBlocks.length,
        },
      ],
    });
    scrollAfterRender(mediaBlockId(key));
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

  function jumpToBlocker(blocker: ProjectPublishBlocker) {
    setIsPreviewOpen(false);
    openAndScroll(blocker.section);
  }

  function openAndScroll(section: ProjectEditorSection) {
    expandSection(section);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document
          .getElementById(sectionId(section))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }),
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

  function renderMaterialFields(material: ProjectMaterialDraft) {
    return (
      <MaterialFields
        material={material}
        stones={stones}
        stoneVariants={stoneVariants}
        finishes={finishes}
        finishCapabilities={finishCapabilities}
        context={context}
        onChange={(changes) =>
          updateCollection("materials", material.key, changes)
        }
      />
    );
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
      material: {
        message: `${count} ${count === 1 ? "point" : "points"} will lose their material. You can reconnect them on the image.`,
        confirmLabel: "Remove material",
        keepLabel: "Keep material",
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
                        {renderMaterialFields(selectedMaterial)}
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
    <>
      <form
        onSubmit={submitSave}
        className="pb-28"
        data-testid="project-aggregate-editor"
      >
        <nav
          aria-label="Project editor sections"
          className="sticky top-3 z-30 mb-5 flex max-w-full gap-1 overflow-x-auto border border-black/10 bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur"
          data-testid="project-section-rail"
        >
          {editorSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => openAndScroll(section.id)}
              className="inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black/62 transition hover:bg-black/[0.05] hover:text-black"
            >
              {section.title}
              {sectionCounts[section.id] !== null ? (
                <span className="tabular-nums text-black/38">
                  {sectionCounts[section.id]}
                </span>
              ) : null}
              {blockerSections.has(section.id) ? (
                <>
                  <span
                    className="h-2 w-2 rounded-full bg-amber-500"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Needs attention before publishing</span>
                </>
              ) : null}
            </button>
          ))}
        </nav>

        <ProjectMutationDisabledContext.Provider value={editorFieldsDisabled}>
          <div className="min-w-0 space-y-5">
            <ProjectSection
              id="project-overview"
              title="Hero and overview"
              summary="The opening image and story people see first."
              open={!collapsedSections.has("overview")}
              onToggle={() => toggleSection("overview")}
            >
              <div className="grid gap-4 xl:grid-cols-2">
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Project title
                  <input
                    disabled={editorFieldsDisabled}
                    value={draft.project.title}
                    onChange={(event) =>
                      updateProject("title", event.target.value)
                    }
                    className={fieldClass}
                    autoComplete="off"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Location
                  <input
                    disabled={editorFieldsDisabled}
                    value={draft.project.location}
                    onChange={(event) =>
                      updateProject("location", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Melbourne VIC"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Project date
                  <input
                    disabled={editorFieldsDisabled}
                    value={draft.project.projectDateLabel}
                    onChange={(event) =>
                      updateProject("projectDateLabel", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="May 2026"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Completion date
                  <input
                    disabled={editorFieldsDisabled}
                    type="date"
                    value={draft.project.completedOn}
                    onChange={(event) =>
                      updateProject("completedOn", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Opening line
                  <textarea
                    disabled={editorFieldsDisabled}
                    value={draft.project.lead}
                    onChange={(event) =>
                      updateProject("lead", event.target.value)
                    }
                    className={textareaClass}
                    placeholder="A concise statement of the project and material outcome."
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Project story
                  <textarea
                    disabled={editorFieldsDisabled}
                    value={draft.project.summary}
                    onChange={(event) =>
                      updateProject("summary", event.target.value)
                    }
                    className={textareaClass}
                    placeholder="What was delivered, why it mattered and what the built result proves."
                  />
                </label>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <InlineMediaField
                  label="Main project image"
                  description="Shown at the top of the project page."
                  value={draft.project.heroMediaId}
                  assets={media}
                  userId={userId}
                  canCleanUpStorage={canCleanUpStorage}
                  disabled={mediaFieldDisabled("project-hero")}
                  instanceKey="project-hero"
                  onPendingChange={handleMediaPendingChange}
                  onBusyChange={handleMediaBusyChange}
                  onChange={(value) => updateProject("heroMediaId", value)}
                  onAssetCreated={onAssetCreated}
                />
                <InlineMediaField
                  label="Project listing image"
                  description="Shown when this project appears in a list."
                  value={draft.project.coverMediaId}
                  assets={media}
                  userId={userId}
                  canCleanUpStorage={canCleanUpStorage}
                  disabled={mediaFieldDisabled("project-cover")}
                  instanceKey="project-cover"
                  onPendingChange={handleMediaPendingChange}
                  onBusyChange={handleMediaBusyChange}
                  onChange={(value) => updateProject("coverMediaId", value)}
                  onAssetCreated={onAssetCreated}
                />
              </div>

              <p className="text-xs font-semibold text-black/42">
                Page address: /projects/{draft.project.slug || "project-name"}
              </p>
            </ProjectSection>

            <ProjectSection
              id="project-facts"
              title="Project information"
              summary="Team, delivery and other facts shown together on the public page."
              open={!collapsedSections.has("facts")}
              onToggle={() => toggleSection("facts")}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <TextField
                  label="Client"
                  value={draft.project.client}
                  onChange={(value) => updateProject("client", value)}
                />
                <TextField
                  label="Landscape architect"
                  value={draft.project.landscapeArchitect}
                  onChange={(value) =>
                    updateProject("landscapeArchitect", value)
                  }
                />
                <TextField
                  label="Contractor"
                  value={draft.project.contractor}
                  onChange={(value) => updateProject("contractor", value)}
                />
                <TextField
                  label="Address"
                  value={draft.project.address}
                  onChange={(value) => updateProject("address", value)}
                />
                <TextField
                  label="Quantity"
                  value={draft.project.quantityLabel}
                  onChange={(value) => updateProject("quantityLabel", value)}
                />
                <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                  Carbon offset
                  <select
                    disabled={editorFieldsDisabled}
                    value={draft.project.carbonStatus}
                    onChange={(event) =>
                      updateProject(
                        "carbonStatus",
                        event.target
                          .value as ProjectAggregateDraft["project"]["carbonStatus"],
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="">Not stated</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="not_available">Not available</option>
                    <option value="tbc">To be confirmed</option>
                  </select>
                </label>
              </div>
              {draft.project.carbonStatus ? (
                <TextField
                  label="Carbon note"
                  value={draft.project.carbonNote}
                  onChange={(value) => updateProject("carbonNote", value)}
                />
              ) : null}

              <div
                id="project-additional-facts"
                className="scroll-mt-28 border-t border-black/10 pt-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-black">
                      Additional facts
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-black/54">
                      Anything else worth stating, such as Sector or Area.
                    </p>
                  </div>
                  <AddButton label="Add fact" onClick={addFact} />
                </div>
                {draft.facts.length ? (
                  <div className="mt-4 space-y-3">
                    {draft.facts.map((fact, index) => (
                      <article
                        key={fact.key}
                        className="grid gap-3 border border-black/10 bg-[#f8f9f5] p-4 min-[1200px]:grid-cols-[minmax(180px,0.7fr)_minmax(260px,1.3fr)_auto] min-[1200px]:items-start"
                      >
                        <TextField
                          label={`Fact ${index + 1}`}
                          value={fact.factLabel}
                          onChange={(value) =>
                            updateCollection("facts", fact.key, {
                              factLabel: value,
                            })
                          }
                          placeholder="Sector"
                        />
                        <FactValueField
                          label="Value"
                          value={factValueForEditor(
                            fact.factValueJson,
                            fact.factValue,
                          )}
                          multiline={Array.isArray(fact.factValueJson)}
                          onChange={(value) =>
                            updateCollection(
                              "facts",
                              fact.key,
                              Array.isArray(fact.factValueJson) ||
                                value.includes("\n")
                                ? {
                                    factValue: "",
                                    factValueJson: value
                                      .split("\n")
                                      .map((item) => item.trim())
                                      .filter(Boolean),
                                  }
                                : { factValue: value, factValueJson: null },
                            )
                          }
                          placeholder="Civic landscape"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <OrderControls
                            itemLabel={`fact ${index + 1}`}
                            isFirst={index === 0}
                            isLast={index === draft.facts.length - 1}
                            onMoveUp={() => moveItem("facts", fact.key, "up")}
                            onMoveDown={() =>
                              moveItem("facts", fact.key, "down")
                            }
                          />
                          <RemoveButton
                            label="Remove fact"
                            onClick={() => removeFact(fact.key)}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-semibold leading-6 text-black/45">
                    No additional facts yet.
                  </p>
                )}
              </div>
            </ProjectSection>

            <ProjectSection
              id="project-media"
              title="Page images and video"
              summary="Images and video in public-page order. Mark materials directly on any image."
              action={
                <div className="flex flex-wrap gap-2">
                  <AddButton
                    label="Add image"
                    onClick={() => addMediaBlock("normal_image")}
                    icon="image"
                  />
                  <AddButton
                    label="Add video"
                    onClick={() => addMediaBlock("youtube_video")}
                    disabled={hasYoutubeVideo}
                  />
                </div>
              }
              open={!collapsedSections.has("media")}
              onToggle={() => toggleSection("media")}
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
                                onPendingChange={handleMediaPendingChange}
                                onBusyChange={handleMediaBusyChange}
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

            <ProjectSection
              id="project-materials"
              title="Material schedule"
              summary="Every stone and finish used in the project, and where it appears."
              action={<AddButton label="Add material" onClick={addMaterial} />}
              open={!collapsedSections.has("materials")}
              onToggle={() => toggleSection("materials")}
            >
              {draft.materials.length ? (
                <div className="space-y-4">
                  {draft.materials.map((material, index) => {
                    const pointCount = countHotspotsForMaterial(draft, material.key);
                    return (
                      <article
                        key={material.key}
                        className="border border-black/10 bg-[#f8f9f5] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-black">
                              Material {index + 1}
                            </h3>
                            <span
                              className={[
                                "inline-flex min-h-6 items-center rounded border px-2 text-[10px] font-bold uppercase tracking-[0.12em]",
                                pointCount
                                  ? "border-black/15 bg-white text-black/62"
                                  : "border-dashed border-black/20 bg-transparent text-black/45",
                              ].join(" ")}
                            >
                              {pointCount
                                ? `Used at ${pointCount} ${pointCount === 1 ? "point" : "points"}`
                                : "Not placed on any image yet"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <OrderControls
                              itemLabel={`material ${index + 1}`}
                              isFirst={index === 0}
                              isLast={index === draft.materials.length - 1}
                              onMoveUp={() =>
                                moveItem("materials", material.key, "up")
                              }
                              onMoveDown={() =>
                                moveItem("materials", material.key, "down")
                              }
                            />
                            <RemoveButton
                              label="Remove material"
                              onClick={() => requestMaterialRemoval(material.key)}
                            />
                          </div>
                        </div>
                        {renderPendingRemoval("material", material.key)}
                        {renderMaterialFields(material)}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyCopy>
                  Add the stone and finish combinations used in this project,
                  or add them while marking an image.
                </EmptyCopy>
              )}
            </ProjectSection>
          </div>
        </ProjectMutationDisabledContext.Provider>

        <div
          className="sticky bottom-3 z-40 mt-6 border border-black/15 bg-white/95 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur md:p-4"
          data-testid="project-sticky-action-bar"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <LifecycleLabel status={draft.project.status} />
                <p className="text-sm font-semibold text-black/58">
                  {isSaving
                    ? "Working…"
                    : hasPendingMedia
                      ? "Finish or cancel the image change"
                      : isDirty
                        ? "Unsaved changes"
                        : "All changes saved"}
                </p>
              </div>
              {blockers.length ? (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {blockers.map((blocker) => (
                    <button
                      key={blocker.id}
                      type="button"
                      onClick={() => openAndScroll(blocker.section)}
                      className="text-left text-xs font-semibold leading-5 text-amber-800 underline decoration-amber-300 underline-offset-2"
                    >
                      {blocker.message}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isDirty || hasPendingMedia) && !isSaving && !showReload ? (
                <button
                  type="button"
                  onClick={onDiscard}
                  disabled={hasActiveMediaRequest}
                  className={`${actionButtonClass} border-black/15 bg-white text-black hover:border-red-700 hover:text-red-700`}
                >
                  {hasActiveMediaRequest
                    ? "Finishing image…"
                    : "Discard changes"}
                </button>
              ) : null}
              {showReload && !isSaving ? (
                <button
                  type="button"
                  onClick={onReload}
                  className={`${actionButtonClass} border-amber-400 bg-amber-50 text-amber-950 hover:border-amber-700`}
                >
                  Reload latest
                </button>
              ) : null}
              <button
                type="submit"
                disabled={mutationDisabled || hasPendingMedia || !isDirty}
                className={`${actionButtonClass} border-black/15 bg-white text-black hover:border-black`}
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                disabled={
                  mutationDisabled ||
                  hasPendingMedia ||
                  blockers.length > 0 ||
                  (!isDirty && draft.project.status === "published")
                }
                onClick={() => void onAction("publish")}
                title={
                  blockers.length
                    ? blockers[0].message
                    : !isDirty && draft.project.status === "published"
                      ? "This project is already live"
                      : "Make this project live"
                }
                className={`${actionButtonClass} border-[var(--urblo-lime)] bg-[var(--urblo-lime)] text-black hover:border-black hover:bg-black hover:text-white disabled:border-black/10 disabled:bg-black/10 disabled:text-black/35`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Publish
              </button>
              <button
                type="button"
                disabled={
                  mutationDisabled ||
                  hasPendingMedia ||
                  draft.project.id === null ||
                  draft.project.status === "archived"
                }
                onClick={() => void onAction("archive")}
                className={`${actionButtonClass} border-black bg-black text-white hover:bg-[#33363f] disabled:border-black/10 disabled:bg-black/15`}
              >
                <Archive className="h-4 w-4" />
                Hide
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className={`${actionButtonClass} border-black/15 bg-white text-black hover:border-black`}
              >
                <Eye className="h-4 w-4" />
                Open preview
              </button>
              {draft.project.status === "published" && draft.project.slug ? (
                <a
                  href={`/projects/${draft.project.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${actionButtonClass} border-black/15 bg-white text-black hover:border-black`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open live page
                </a>
              ) : null}
            </div>
          </div>
          <div className="mt-2 min-h-5" aria-live="polite" aria-atomic="true">
            {error ? (
              <p className="text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {!error && notice ? (
              <p className="text-sm font-semibold text-black/58">{notice}</p>
            ) : null}
          </div>
        </div>
      </form>

      {!canEdit ? (
        <p className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg">
          You have view-only access.
        </p>
      ) : null}

      {isPreviewOpen ? (
        <ProjectDraftPreview
          draft={draft}
          context={context}
          blockers={blockers}
          onClose={() => setIsPreviewOpen(false)}
          onBlockerClick={jumpToBlocker}
        />
      ) : null}
    </>
  );
}

function ProjectSection({
  id,
  title,
  summary,
  action,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  action?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border border-black/10 bg-white">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-5">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-black/54">{summary}</p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:shrink-0 sm:justify-end">
          {action}
          <button
            type="button"
            onClick={onToggle}
            className="grid h-10 w-10 place-items-center rounded border border-black/15 bg-white text-black transition hover:border-black"
            aria-expanded={open}
            aria-controls={`${id}-content`}
            aria-label={`${open ? "Collapse" : "Open"} ${title}`}
          >
            <ChevronDown
              className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
      <div
        id={`${id}-content`}
        hidden={!open}
        className="space-y-5 border-t border-black/10 px-4 py-4 sm:px-5 sm:py-5"
      >
        {children}
      </div>
    </section>
  );
}

function MaterialFields({
  material,
  stones,
  stoneVariants,
  finishes,
  finishCapabilities,
  context,
  onChange,
}: {
  material: ProjectMaterialDraft;
  stones: readonly ProjectStoneOption[];
  stoneVariants: readonly ProjectStoneVariantOption[];
  finishes: readonly ProjectFinishOption[];
  finishCapabilities: readonly ProjectStoneFinishCapabilityOption[];
  context: ProjectAggregateMappingContext;
  onChange: (changes: Partial<ProjectMaterialDraft>) => void;
}) {
  const disabled = useContext(ProjectMutationDisabledContext);
  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OptionField
          label="Stone"
          value={material.stoneGroupId}
          options={stones}
          onChange={(value) => {
            const variants = stoneVariants.filter((variant) => variant.stoneGroupId === value && variant.status !== "archived");
            const variantId = variants[0]?.id ?? null;
            const finishId = finishCapabilities.find((capability) => capability.stoneVariantId === variantId && capability.capability !== "no")?.finishDefinitionId ?? null;
            onChange({
              stoneGroupId: value,
              stoneVariantId: variantId,
              finishDefinitionId: finishId,
            });
          }}
        />
        <OptionField
          label="Variant"
          value={material.stoneVariantId}
          options={stoneVariants.filter((variant) => variant.stoneGroupId === material.stoneGroupId)}
          onChange={(value) => {
            const finishId = finishCapabilities.find((capability) => capability.stoneVariantId === value && capability.capability !== "no")?.finishDefinitionId ?? null;
            onChange({
              stoneVariantId: value,
              finishDefinitionId: finishId,
            });
          }}
        />
        <OptionField
          label="Finish"
          value={material.finishDefinitionId}
          options={finishes.filter((finish) => finishCapabilities.some((capability) => capability.stoneVariantId === material.stoneVariantId && capability.finishDefinitionId === finish.id && capability.capability !== "no"))}
          onChange={(value) => onChange({ finishDefinitionId: value })}
        />
        <TextField
          label="Where it is used"
          value={material.application}
          onChange={(value) => onChange({ application: value })}
          placeholder="Seating pods and low elements"
        />
      </div>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
        Material note
        <textarea
          disabled={disabled}
          value={material.note}
          onChange={(event) => onChange({ note: event.target.value })}
          className={textareaClass}
        />
      </label>
      <StoneLibraryMaterialPreview material={material} context={context} />
    </>
  );
}

function InlineConfirm({
  message,
  confirmLabel,
  keepLabel,
  onConfirm,
  onKeep,
}: {
  message: string;
  confirmLabel: string;
  keepLabel: string;
  onConfirm: () => void;
  onKeep: () => void;
}) {
  const disabled = useContext(ProjectMutationDisabledContext);
  const keepRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    keepRef.current?.focus();
  }, []);

  return (
    <div
      className="mt-4 flex flex-col gap-3 border border-red-200 bg-red-50 p-3 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <p className="text-sm font-semibold leading-6 text-red-900">{message}</p>
      <div className="flex flex-wrap gap-2">
        <button
          ref={keepRef}
          type="button"
          onClick={onKeep}
          className="inline-flex min-h-9 items-center rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black"
        >
          {keepLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className="inline-flex min-h-9 items-center gap-2 rounded border border-red-700 bg-red-700 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const disabled = useContext(ProjectMutationDisabledContext);
  return (
    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
      {label}
      <input
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </label>
  );
}

function FactValueField({
  label,
  value,
  multiline,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  multiline: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const disabled = useContext(ProjectMutationDisabledContext);
  return (
    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
      {label}
      {multiline ? (
        <textarea
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${textareaClass} min-h-24`}
        />
      ) : (
        <input
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
      {multiline ? (
        <span className="mt-2 block text-xs font-semibold normal-case tracking-normal text-black/42">
          One item per line.
        </span>
      ) : null}
    </label>
  );
}

function OptionField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number | null;
  options: readonly (ProjectStoneOption | ProjectStoneVariantOption | ProjectFinishOption)[];
  onChange: (value: number | null) => void;
}) {
  const disabled = useContext(ProjectMutationDisabledContext);
  const visibleOptions = options.filter(
    (option) => option.status !== "archived" || option.id === value,
  );
  return (
    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
      {label}
      <select
        disabled={disabled}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
        className={fieldClass}
      >
        <option value="">Choose {label.toLowerCase()}</option>
        {value !== null && !visibleOptions.some((option) => option.id === value) && <option value={value}>Saved {label.toLowerCase()} (not currently published)</option>}
        {visibleOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
            {option.status === "published" ? " (Live)" : option.status === "draft" ? " (Draft)" : " (not available for publishing)"}
          </option>
        ))}
      </select>
    </label>
  );
}

function StoneLibraryMaterialPreview({
  material,
  context,
}: {
  material: ProjectMaterialDraft;
  context: ProjectAggregateMappingContext;
}) {
  const stone = context.stones.find((entry) => entry.id === material.stoneGroupId);
  const variant = context.stoneVariants.find((entry) => entry.id === material.stoneVariantId);
  const finish = context.finishes.find((entry) => entry.id === material.finishDefinitionId);
  const image = context.finishImages
    .filter((entry) => entry.status !== "archived")
    .filter((entry) => entry.stoneGroupId === stone?.id)
    .filter((entry) => entry.stoneVariantId === variant?.id || entry.stoneVariantId === null)
    .filter((entry) => entry.finishDefinitionId === finish?.id || entry.finishDefinitionId === null)
    .sort((left, right) => {
      const leftExact = Number(left.stoneVariantId === variant?.id) + Number(left.finishDefinitionId === finish?.id);
      const rightExact = Number(right.stoneVariantId === variant?.id) + Number(right.finishDefinitionId === finish?.id);
      if (leftExact !== rightExact) return rightExact - leftExact;
      if (left.imageRole !== right.imageRole) return left.imageRole === "primary" ? -1 : 1;
      return left.sortOrder - right.sortOrder;
    })[0];
  const mediaAsset = context.media.find((asset) => asset.id === image?.mediaAssetId);
  const imageUrl = mediaAsset?.previewUrl || mediaAsset?.sourceUrl || "";

  if (!stone || !variant || !finish) {
    return (
      <p className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm font-medium leading-6 text-amber-900">
        Choose the Stone Library stone, variant and finish for this material.
      </p>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-[88px_minmax(0,1fr)] gap-4 border border-black/10 bg-white p-3" data-testid="stone-library-material-preview">
      <div className="overflow-hidden bg-black/[0.05]">
        {imageUrl ? <img src={imageUrl} alt={mediaAsset?.alt || `${stone.label} ${finish.label}`} className="aspect-square w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 self-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/42">From Stone Library</p>
        <p className="mt-1 text-base font-semibold text-black">{stone.label}</p>
        <p className="mt-1 text-sm text-black/58">{variant.label} · {finish.label}</p>
        <p className="mt-1 text-xs font-semibold text-black/45">
          Stone {stone.status === "published" ? "Live" : "Draft"} · Variant {variant.status === "published" ? "Live" : "Draft"} · Finish {finish.status === "published" ? "Live" : "Draft"}
        </p>
        {!imageUrl ? <p className="mt-2 text-xs font-semibold text-amber-800">This finish has no usable Stone Library image yet.</p> : null}
      </div>
    </div>
  );
}

function factValueForEditor(structuredValue: unknown, fallbackValue: string) {
  if (typeof structuredValue === "string") return structuredValue;
  if (
    Array.isArray(structuredValue) &&
    structuredValue.every((item) => typeof item === "string")
  ) {
    return structuredValue.join("\n");
  }
  return fallbackValue;
}

function AddButton({
  label,
  onClick,
  icon = "plus",
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  icon?: "plus" | "image";
  disabled?: boolean;
}) {
  const mutationDisabled = useContext(ProjectMutationDisabledContext);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || mutationDisabled}
      className={secondaryButtonClass}
    >
      {icon === "image" ? (
        <ImagePlus className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}

function OrderControls({
  itemLabel,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  itemLabel: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const disabled = useContext(ProjectMutationDisabledContext);
  return (
    <div
      className="inline-flex overflow-hidden rounded border border-black/15 bg-white"
      role="group"
      aria-label={`Reorder ${itemLabel}`}
    >
      <button
        type="button"
        onClick={onMoveUp}
        disabled={disabled || isFirst}
        className="grid h-9 w-9 place-items-center border-r border-black/10 text-black/58 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/20"
        aria-label={`Move ${itemLabel} up`}
        title={`Move ${itemLabel} up`}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disabled || isLast}
        className="grid h-9 w-9 place-items-center text-black/58 transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/20"
        aria-label={`Move ${itemLabel} down`}
        title={`Move ${itemLabel} down`}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const disabled = useContext(ProjectMutationDisabledContext);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-black/15 bg-white text-black/52 transition hover:border-red-700 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-black/25"
      aria-label={label}
      title={label}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function EmptyCopy({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-28 place-items-center border border-dashed border-black/20 bg-[#f8f9f5] p-6 text-center text-sm font-semibold leading-6 text-black/48">
      {children}
    </div>
  );
}

function LifecycleLabel({ status }: { status: ProjectLifecycleStatus }) {
  const meta: Record<
    ProjectLifecycleStatus,
    { label: string; className: string }
  > = {
    draft: {
      label: "Saved — not live",
      className: "border-black/15 bg-white text-black/62",
    },
    published: {
      label: "Live",
      className:
        "border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.14)] text-black",
    },
    archived: {
      label: "Hidden",
      className: "border-black bg-black text-white",
    },
  };
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em] ${meta[status].className}`}
    >
      {meta[status].label}
    </span>
  );
}

function sectionId(section: ProjectEditorSection) {
  return `project-${section}`;
}

function safeDomKey(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function mediaBlockId(key: string) {
  return `project-media-block-${safeDomKey(key)}`;
}

function pointTabId(key: string) {
  return `project-point-tab-${safeDomKey(key)}`;
}

function pointPanelId(blockKey: string) {
  return `project-point-panel-${safeDomKey(blockKey)}`;
}

function scrollAfterRender(id: string) {
  requestAnimationFrame(() =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
  );
}
