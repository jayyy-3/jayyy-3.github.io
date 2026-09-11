import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FormEvent } from "react";
import {
  Archive,
  CheckCircle2,
  ExternalLink,
  Eye,
  Save,
} from "lucide-react";
import {
  createProjectDraftKey,
  getProjectBlockerSections,
  getProjectPublishBlockers,
  moveProjectDraftItem,
  slugify,
  type ProjectAggregateDraft,
  type ProjectAggregateMappingContext,
  type ProjectEditorSection,
  type ProjectFinishOption,
  type ProjectLifecycleStatus,
  type ProjectMaterialDraft,
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
import {
  AddButton,
  OrderControls,
  ProjectSection,
  RemoveButton,
  TextField,
} from "./sections/EditorControls";
import MaterialsSection from "./sections/MaterialsSection";
import MediaSection from "./sections/MediaSection";
import {
  ProjectMutationDisabledContext,
  fieldClass,
  mediaBlockId,
  textareaClass,
} from "./sections/editorContext";

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

const actionButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded border px-4 text-xs font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed";

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

            <MediaSection
              draft={draft}
              context={context}
              media={media}
              stones={stones}
              stoneVariants={stoneVariants}
              finishes={finishes}
              finishCapabilities={finishCapabilities}
              userId={userId}
              canEdit={canEdit}
              canCleanUpStorage={canCleanUpStorage}
              isSaving={isSaving}
              showReload={showReload}
              hasPendingMedia={hasPendingMedia}
              open={!collapsedSections.has("media")}
              onToggle={() => toggleSection("media")}
              onChange={onChange}
              onAddBlock={addMediaBlock}
              buildMaterial={buildMaterial}
              mediaFieldDisabled={mediaFieldDisabled}
              onMediaPendingChange={handleMediaPendingChange}
              onMediaBusyChange={handleMediaBusyChange}
              onAssetCreated={onAssetCreated}
              moveItem={moveItem}
              updateCollection={updateCollection}
            />

            <MaterialsSection
              draft={draft}
              context={context}
              stones={stones}
              stoneVariants={stoneVariants}
              finishes={finishes}
              finishCapabilities={finishCapabilities}
              open={!collapsedSections.has("materials")}
              onToggle={() => toggleSection("materials")}
              onChange={onChange}
              onAddMaterial={addMaterial}
              moveItem={moveItem}
              updateCollection={updateCollection}
            />
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

function scrollAfterRender(id: string) {
  requestAnimationFrame(() =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
  );
}
