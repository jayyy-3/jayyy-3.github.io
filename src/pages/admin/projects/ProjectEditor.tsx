import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  createProjectDraftKey,
  getProjectPublishBlockers,
  moveProjectDraftItem,
  slugify,
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

const fieldClass =
  "mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/45";
const textareaClass = `${fieldClass} min-h-28 py-3 leading-6`;
const actionButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded border px-4 text-xs font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed";
const ProjectMutationDisabledContext = createContext(false);

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
  const [openSection, setOpenSection] = useState<ProjectEditorSection | null>(
    "overview",
  );
  const [selectedMapKey, setSelectedMapKey] = useState<string | null>(
    draft.maps[0]?.key ?? null,
  );
  const [selectedHotspotKey, setSelectedHotspotKey] = useState<string | null>(
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
  const hasYoutubeVideo = draft.mediaBlocks.some(
    (block) => block.mediaRole === "youtube_video",
  );
  const selectedMap = useMemo(
    () =>
      draft.maps.find((map) => map.key === selectedMapKey) ??
      draft.maps[0] ??
      null,
    [draft.maps, selectedMapKey],
  );
  const mapHotspots = useMemo(
    () =>
      selectedMap
        ? draft.hotspots.filter(
            (hotspot) => hotspot.projectMaterialMapKey === selectedMap.key,
          )
        : [],
    [draft.hotspots, selectedMap],
  );
  const selectedHotspot =
    mapHotspots.find((hotspot) => hotspot.key === selectedHotspotKey) ??
    mapHotspots[0] ??
    null;
  const selectedMapIndex = selectedMap
    ? draft.maps.findIndex((map) => map.key === selectedMap.key)
    : -1;
  const selectedHotspotIndex = selectedHotspot
    ? mapHotspots.findIndex((hotspot) => hotspot.key === selectedHotspot.key)
    : -1;
  const selectedMapImage =
    media.find((asset) => asset.id === selectedMap?.mediaAssetId) ?? null;
  const hasPendingMedia = pendingMediaKeys.size > 0;
  const hasActiveMediaRequest = busyMediaKeys.size > 0;
  const mutationDisabled = !canEdit || isSaving || showReload;
  const editorFieldsDisabled = mutationDisabled || hasPendingMedia;

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

  useEffect(() => {
    if (!draft.maps.length) {
      setSelectedMapKey(null);
      setSelectedHotspotKey(null);
      return;
    }
    if (!draft.maps.some((map) => map.key === selectedMapKey))
      setSelectedMapKey(draft.maps[0].key);
  }, [draft.maps, selectedMapKey]);

  useEffect(() => {
    if (!mapHotspots.length) {
      setSelectedHotspotKey(null);
      return;
    }
    if (!mapHotspots.some((hotspot) => hotspot.key === selectedHotspotKey)) {
      setSelectedHotspotKey(mapHotspots[0].key);
    }
  }, [mapHotspots, selectedHotspotKey]);

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

  function handleMapTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    if (hasPendingMedia || draft.maps.length < 2) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + draft.maps.length) % draft.maps.length;
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % draft.maps.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = draft.maps.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextMap = draft.maps[nextIndex];
    setSelectedMapKey(nextMap.key);
    requestAnimationFrame(() =>
      document.getElementById(mapTabId(nextMap.key))?.focus(),
    );
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
    Collection extends
      "facts" | "materials" | "maps" | "mediaBlocks" | "hotspots",
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

  function removeCollectionRow(
    collection: "facts" | "materials" | "mediaBlocks",
    key: string,
  ) {
    if (collection === "materials") {
      onChange({
        ...draft,
        materials: draft.materials.filter((row) => row.key !== key),
        hotspots: draft.hotspots.map((hotspot) =>
          hotspot.projectMaterialKey === key
            ? { ...hotspot, projectMaterialKey: null }
            : hotspot,
        ),
      });
      return;
    }
    onChange({
      ...draft,
      [collection]: draft[collection].filter((row) => row.key !== key),
    });
  }

  function addFact() {
    setOpenSection("facts");
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
    scrollAfterRender("project-facts");
  }

  function addMaterial() {
    setOpenSection("materials");
    const key = createProjectDraftKey("material");
    const stone = stones.find((entry) => entry.status !== "archived") ?? null;
    const variants = stoneVariants.filter((variant) => variant.stoneGroupId === stone?.id && variant.status !== "archived");
    const variant = variants[0] ?? null;
    const finishId = finishCapabilities.find((capability) => capability.stoneVariantId === variant?.id && capability.capability !== "no")?.finishDefinitionId ?? null;
    onChange({
      ...draft,
      materials: [
        ...draft.materials,
        {
          key,
          id: null,
          stoneGroupId: stone?.id ?? null,
          stoneVariantId: variant?.id ?? null,
          finishDefinitionId: finishId,
          application: "",
          note: "",
          mediaAssetId: null,
          claimStatus: "approved",
          sortOrder: draft.materials.length,
        },
      ],
    });
    scrollAfterRender("project-materials");
  }

  function addMediaBlock(
    role: ProjectMediaBlockDraft["mediaRole"] = "normal_image",
  ) {
    setOpenSection("media");
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
          projectMaterialMapKey:
            role === "hotspot_image" ? (draft.maps[0]?.key ?? null) : null,
          blockTitle: "",
          youtubeUrl: "",
          label: "",
          caption: "",
          sortOrder: draft.mediaBlocks.length,
        },
      ],
    });
    scrollAfterRender("project-media");
  }

  function addMap() {
    setOpenSection("maps");
    const key = createProjectDraftKey("map");
    onChange({
      ...draft,
      maps: [
        ...draft.maps,
        {
          key,
          id: null,
          mediaAssetId: null,
          title: "",
          intro: "",
          sortOrder: draft.maps.length,
        },
      ],
    });
    setSelectedMapKey(key);
    setSelectedHotspotKey(null);
    scrollAfterRender("project-maps");
  }

  function removeMap(mapKey: string) {
    onChange({
      ...draft,
      maps: draft.maps.filter((map) => map.key !== mapKey),
      mediaBlocks: draft.mediaBlocks.filter(
        (block) => block.projectMaterialMapKey !== mapKey,
      ),
      hotspots: draft.hotspots.filter(
        (hotspot) => hotspot.projectMaterialMapKey !== mapKey,
      ),
    });
  }

  function addHotspot(position: { xPercent: number; yPercent: number }) {
    if (!selectedMap) return;
    const material = draft.materials[0] ?? null;
    const key = createProjectDraftKey("hotspot");
    const next: ProjectHotspotDraft = {
      key,
      id: null,
      projectMaterialMapKey: selectedMap.key,
      projectMaterialKey: material?.key ?? null,
      xPercent: position.xPercent,
      yPercent: position.yPercent,
      label: "",
      application: material?.application ?? "",
      note: "",
      previewMediaId: null,
      sortOrder: mapHotspots.length,
    };
    onChange({
      ...draft,
      hotspots: [...draft.hotspots, next],
    });
    setSelectedHotspotKey(key);
  }

  function removeHotspot(key: string) {
    onChange({
      ...draft,
      hotspots: draft.hotspots.filter((hotspot) => hotspot.key !== key),
    });
  }

  function jumpToBlocker(blocker: ProjectPublishBlocker) {
    setIsPreviewOpen(false);
    openAndScroll(blocker.section);
  }

  function openAndScroll(section: ProjectEditorSection) {
    setOpenSection(section);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document
          .getElementById(sectionId(section))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }),
    );
  }

  return (
    <>
      <form
        onSubmit={submitSave}
        className="pb-28"
        data-testid="project-aggregate-editor"
      >
        <ProjectMutationDisabledContext.Provider value={editorFieldsDisabled}>
          <div className="min-w-0 space-y-5">
            <ProjectSection
              id="project-overview"
              title="Hero and overview"
              summary="The opening image and story people see first."
              open={openSection === "overview"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "overview" ? null : "overview",
                )
              }
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

              <p className="text-xs font-semibold text-black/42">
                Page address: /projects/{draft.project.slug || "project-name"}
              </p>
            </ProjectSection>

            <ProjectSection
              id="project-facts"
              title="Facts"
              summary="Short, scannable facts shown near the opening story."
              action={<AddButton label="Add fact" onClick={addFact} />}
              open={openSection === "facts"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "facts" ? null : "facts",
                )
              }
            >
              {draft.facts.length ? (
                <div className="space-y-3">
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
                        placeholder="Stone"
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
                        placeholder="Bluestone"
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
                          onClick={() =>
                            removeCollectionRow("facts", fact.key)
                          }
                        />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyCopy>
                  Add a fact such as Stone, Finish, Quantity or Sector.
                </EmptyCopy>
              )}
            </ProjectSection>

            <ProjectSection
              id="project-materials"
              title="Material schedule"
              summary="Connect each stone and finish to where it appears in the project."
              action={<AddButton label="Add material" onClick={addMaterial} />}
              open={openSection === "materials"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "materials" ? null : "materials",
                )
              }
            >
              {draft.materials.length ? (
                <div className="space-y-4">
                  {draft.materials.map((material, index) => (
                    <article
                      key={material.key}
                      className="border border-black/10 bg-[#f8f9f5] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-black">
                          Material {index + 1}
                        </h3>
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
                            onClick={() =>
                              removeCollectionRow("materials", material.key)
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <OptionField
                          label="Stone"
                          value={material.stoneGroupId}
                          options={stones}
                          onChange={(value) => {
                            const variants = stoneVariants.filter((variant) => variant.stoneGroupId === value && variant.status !== "archived");
                            const variantId = variants[0]?.id ?? null;
                            const finishId = finishCapabilities.find((capability) => capability.stoneVariantId === variantId && capability.capability !== "no")?.finishDefinitionId ?? null;
                            updateCollection("materials", material.key, {
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
                            updateCollection("materials", material.key, {
                              stoneVariantId: value,
                              finishDefinitionId: finishId,
                            });
                          }}
                        />
                        <OptionField
                          label="Finish"
                          value={material.finishDefinitionId}
                          options={finishes.filter((finish) => finishCapabilities.some((capability) => capability.stoneVariantId === material.stoneVariantId && capability.finishDefinitionId === finish.id && capability.capability !== "no"))}
                          onChange={(value) =>
                            updateCollection("materials", material.key, {
                              finishDefinitionId: value,
                            })
                          }
                        />
                        <TextField
                          label="Where it is used"
                          value={material.application}
                          onChange={(value) =>
                            updateCollection("materials", material.key, {
                              application: value,
                            })
                          }
                          placeholder="Seating pods and low elements"
                        />
                      </div>
                      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                        Material note
                        <textarea
                          disabled={editorFieldsDisabled}
                          value={material.note}
                          onChange={(event) =>
                            updateCollection("materials", material.key, {
                              note: event.target.value,
                            })
                          }
                          className={textareaClass}
                        />
                      </label>
                      <StoneLibraryMaterialPreview material={material} context={context} />
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyCopy>
                  Add the stone and finish combinations used in this project.
                </EmptyCopy>
              )}
            </ProjectSection>

            <ProjectSection
              id="project-media"
              title="Project media"
              summary="Build the image and video sequence in public-page order."
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
              open={openSection === "media"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "media" ? null : "media",
                )
              }
            >
              {draft.mediaBlocks.length ? (
                <div className="space-y-4">
                  {draft.mediaBlocks.map((block, index) => (
                    <article
                      key={block.key}
                      className="border border-black/10 bg-[#f8f9f5] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-black/42">
                            Block {index + 1}
                          </p>
                          <select
                            disabled={editorFieldsDisabled}
                            value={normalizeEditorMediaRole(block.mediaRole)}
                            onChange={(event) => {
                              const mediaRole = event.target
                                .value as ProjectMediaBlockDraft["mediaRole"];
                              updateCollection("mediaBlocks", block.key, {
                                mediaRole,
                                mediaAssetId:
                                  mediaRole === "normal_image"
                                    ? block.mediaAssetId
                                    : null,
                                projectMaterialMapKey:
                                  mediaRole === "hotspot_image"
                                    ? (block.projectMaterialMapKey ??
                                      draft.maps[0]?.key ??
                                      null)
                                    : null,
                              });
                            }}
                            className={`${fieldClass} min-w-48`}
                            aria-label={`Block ${index + 1} type`}
                          >
                            <option value="normal_image">Image</option>
                            <option value="hotspot_image">
                              Interactive material image
                            </option>
                            <option
                              value="youtube_video"
                              disabled={
                                hasYoutubeVideo &&
                                block.mediaRole !== "youtube_video"
                              }
                            >
                              YouTube video
                            </option>
                          </select>
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
                            onClick={() =>
                              removeCollectionRow("mediaBlocks", block.key)
                            }
                          />
                        </div>
                      </div>

                      {block.mediaRole === "youtube_video" ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                        </div>
                      ) : block.mediaRole === "hotspot_image" ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                            Material map
                            <select
                              disabled={editorFieldsDisabled}
                              value={block.projectMaterialMapKey ?? ""}
                              onChange={(event) =>
                                updateCollection("mediaBlocks", block.key, {
                                  projectMaterialMapKey:
                                    event.target.value || null,
                                })
                              }
                              className={fieldClass}
                            >
                              <option value="">Choose a material map</option>
                              {draft.maps.map((map, mapIndex) => (
                                <option key={map.key} value={map.key}>
                                  {map.title || `Map ${mapIndex + 1}`}
                                </option>
                              ))}
                            </select>
                          </label>
                          <TextField
                            label="Block title"
                            value={block.blockTitle}
                            onChange={(value) =>
                              updateCollection("mediaBlocks", block.key, {
                                blockTitle: value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div className="mt-4">
                          <InlineMediaField
                            label="Block image"
                            value={block.mediaAssetId}
                            assets={media}
                            userId={userId}
                            canCleanUpStorage={canCleanUpStorage}
                            disabled={mediaFieldDisabled(`media-${block.key}`)}
                            instanceKey={`media-${block.key}`}
                            onPendingChange={handleMediaPendingChange}
                            onBusyChange={handleMediaBusyChange}
                            onChange={(value) =>
                              updateCollection("mediaBlocks", block.key, {
                                mediaAssetId: value,
                              })
                            }
                            onAssetCreated={onAssetCreated}
                          />
                        </div>
                      )}

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <TextField
                          label="Small label"
                          value={block.label}
                          onChange={(value) =>
                            updateCollection("mediaBlocks", block.key, {
                              label: value,
                            })
                          }
                        />
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
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyCopy>
                  Add images or video in the order they should appear.
                </EmptyCopy>
              )}
            </ProjectSection>

            <ProjectSection
              id="project-maps"
              title="Material maps and points"
              summary="Show exactly where each material appears in a project photograph."
              action={<AddButton label="Add material map" onClick={addMap} />}
              open={openSection === "maps"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "maps" ? null : "maps",
                )
              }
            >
              {draft.maps.length ? (
                <>
                  <div
                    className="flex flex-wrap gap-2"
                    role="tablist"
                    aria-label="Material maps"
                  >
                    {draft.maps.map((map, index) => (
                      <button
                        key={map.key}
                        id={mapTabId(map.key)}
                        type="button"
                        role="tab"
                        aria-selected={selectedMap?.key === map.key}
                        aria-controls={mapPanelId(map.key)}
                        tabIndex={selectedMap?.key === map.key ? 0 : -1}
                        onClick={() => setSelectedMapKey(map.key)}
                        onKeyDown={(event) =>
                          handleMapTabKeyDown(event, index)
                        }
                        disabled={
                          hasPendingMedia && selectedMap?.key !== map.key
                        }
                        className={[
                          "min-h-10 rounded border px-3 text-xs font-bold uppercase tracking-[0.11em] transition",
                          selectedMap?.key === map.key
                            ? "border-black bg-black text-white"
                            : "border-black/15 bg-white text-black/58 hover:border-black",
                        ].join(" ")}
                      >
                        {map.title || `Map ${index + 1}`}
                      </button>
                    ))}
                  </div>

                  {selectedMap ? (
                    <article
                      id={mapPanelId(selectedMap.key)}
                      role="tabpanel"
                      aria-labelledby={mapTabId(selectedMap.key)}
                      className="mt-4 border border-black/10 bg-[#f8f9f5] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-black">
                          Map details
                        </h3>
                        <div className="flex items-center gap-2">
                          <OrderControls
                            itemLabel={`map ${selectedMapIndex + 1}`}
                            isFirst={selectedMapIndex === 0}
                            isLast={selectedMapIndex === draft.maps.length - 1}
                            onMoveUp={() =>
                              moveItem("maps", selectedMap.key, "up")
                            }
                            onMoveDown={() =>
                              moveItem("maps", selectedMap.key, "down")
                            }
                          />
                          <RemoveButton
                            label="Remove map"
                            onClick={() => removeMap(selectedMap.key)}
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <TextField
                          label="Map title"
                          value={selectedMap.title}
                          onChange={(value) =>
                            updateCollection("maps", selectedMap.key, {
                              title: value,
                            })
                          }
                        />
                        <TextField
                          label="Short introduction"
                          value={selectedMap.intro}
                          onChange={(value) =>
                            updateCollection("maps", selectedMap.key, {
                              intro: value,
                            })
                          }
                        />
                      </div>
                      <div className="mt-4">
                        <InlineMediaField
                          key={`map-${selectedMap.key}`}
                          label="Map image"
                          value={selectedMap.mediaAssetId}
                          assets={media}
                          userId={userId}
                          canCleanUpStorage={canCleanUpStorage}
                          disabled={mediaFieldDisabled(
                            `map-${selectedMap.key}`,
                          )}
                          instanceKey={`map-${selectedMap.key}`}
                          onPendingChange={handleMediaPendingChange}
                          onBusyChange={handleMediaBusyChange}
                          onChange={(value) =>
                            updateCollection("maps", selectedMap.key, {
                              mediaAssetId: value,
                            })
                          }
                          onAssetCreated={onAssetCreated}
                        />
                      </div>
                      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
                        <VisualHotspotEditor
                          imageUrl={
                            selectedMapImage?.previewUrl ||
                            selectedMapImage?.sourceUrl ||
                            ""
                          }
                          imageAlt={
                            selectedMapImage?.alt ||
                            `${draft.project.title || "Project"} material map`
                          }
                          hotspots={mapHotspots}
                          selectedKey={selectedHotspot?.key ?? null}
                          disabled={isSaving || showReload}
                          readOnly={!canEdit || hasPendingMedia || showReload}
                          selectionDisabled={hasPendingMedia || showReload}
                          onAdd={addHotspot}
                          onSelect={setSelectedHotspotKey}
                          onMove={(key, position) =>
                            updateCollection("hotspots", key, position)
                          }
                        />
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold text-black">
                              Selected point
                            </h3>
                            {selectedHotspot ? (
                              <div className="flex items-center gap-2">
                                <OrderControls
                                  itemLabel={`point ${selectedHotspotIndex + 1}`}
                                  isFirst={selectedHotspotIndex === 0}
                                  isLast={
                                    selectedHotspotIndex ===
                                    mapHotspots.length - 1
                                  }
                                  onMoveUp={() =>
                                    moveItem(
                                      "hotspots",
                                      selectedHotspot.key,
                                      "up",
                                    )
                                  }
                                  onMoveDown={() =>
                                    moveItem(
                                      "hotspots",
                                      selectedHotspot.key,
                                      "down",
                                    )
                                  }
                                />
                                <RemoveButton
                                  label="Remove point"
                                  onClick={() =>
                                    removeHotspot(selectedHotspot.key)
                                  }
                                />
                              </div>
                            ) : null}
                          </div>
                          {selectedHotspot ? (
                            <div className="mt-3 space-y-4">
                              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                                Material
                                <select
                                  disabled={editorFieldsDisabled}
                                  value={
                                    selectedHotspot.projectMaterialKey ?? ""
                                  }
                                  onChange={(event) => {
                                    const materialKey =
                                      event.target.value || null;
                                    const material = draft.materials.find(
                                      (item) => item.key === materialKey,
                                    );
                                    updateCollection(
                                      "hotspots",
                                      selectedHotspot.key,
                                      {
                                        projectMaterialKey: materialKey,
                                        application:
                                          selectedHotspot.application ||
                                          material?.application ||
                                          "",
                                      },
                                    );
                                  }}
                                  className={fieldClass}
                                >
                                  <option value="">Choose a material</option>
                                  {draft.materials.map((material, index) => (
                                    <option
                                      key={material.key}
                                      value={material.key}
                                    >
                                      {material.application ||
                                        `Material ${index + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <TextField
                                label="Where it is used"
                                value={selectedHotspot.application}
                                onChange={(value) =>
                                  updateCollection(
                                    "hotspots",
                                    selectedHotspot.key,
                                    { application: value },
                                  )
                                }
                              />
                              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                                Point note
                                <textarea
                                  disabled={editorFieldsDisabled}
                                  value={selectedHotspot.note}
                                  onChange={(event) =>
                                    updateCollection(
                                      "hotspots",
                                      selectedHotspot.key,
                                      { note: event.target.value },
                                    )
                                  }
                                  className={textareaClass}
                                />
                              </label>
                              {(() => {
                                const material = draft.materials.find((entry) => entry.key === selectedHotspot.projectMaterialKey);
                                return material ? <StoneLibraryMaterialPreview material={material} context={context} /> : null;
                              })()}
                            </div>
                          ) : (
                            <p className="mt-3 border border-dashed border-black/20 bg-white p-4 text-sm leading-6 text-black/50">
                              Click the map image to add the first point.
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  ) : null}
                </>
              ) : (
                <EmptyCopy>
                  Add a material map, choose its image, then click the image to
                  place points.
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
    <section id={id} className="scroll-mt-28 border border-black/10 bg-white">
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
      className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/30"
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

function normalizeEditorMediaRole(
  role: ProjectMediaBlockDraft["mediaRole"],
): "normal_image" | "hotspot_image" | "youtube_video" {
  if (role === "hotspot_image" || role === "youtube_video") return role;
  return "normal_image";
}

function sectionId(section: ProjectEditorSection) {
  return `project-${section}`;
}

function mapTabId(key: string) {
  return `project-map-tab-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function mapPanelId(key: string) {
  return `project-map-panel-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function scrollAfterRender(id: string) {
  requestAnimationFrame(() =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
  );
}
