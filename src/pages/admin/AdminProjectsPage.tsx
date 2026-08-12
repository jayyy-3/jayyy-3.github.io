import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collectProjectMediaAssetIds,
  createEmptyProjectAggregateDraft,
  mergeProjectMediaOptions,
  normalizeProjectDraftForSave,
  type ProjectAggregateDraft,
  type ProjectFinishOption,
  type ProjectLifecycleStatus,
  type ProjectMediaOption,
  type ProjectStoneOption,
  type ProjectStoneVariantOption,
  type ProjectStoneFinishCapabilityOption,
  type ProjectStoneFinishImageOption,
} from "../../features/projects/projectAggregate";
import {
  isProjectApiResponse,
  type ProjectApiResponse,
} from "../../features/projects/projectApiContract";
import { useAdminAuth } from "../../lib/adminAuthHooks";
import { supabase } from "../../lib/supabaseClient";
import AdminShell from "./AdminShell";
import ProjectEditor, {
  type ProjectEditorAction,
} from "./projects/ProjectEditor";
import RequireAdmin from "./RequireAdmin";

type ProjectListFilter = ProjectLifecycleStatus | "projects";

interface ProjectListRow {
  id: number;
  slug: string;
  title: string;
  status: ProjectLifecycleStatus;
  location: string | null;
  sort_order: number;
  updated_at: string;
}

interface ProjectListApiRow {
  id: number;
  slug: string;
  title: string;
  status: ProjectLifecycleStatus;
  location: string | null;
  sortOrder: number;
  updatedAt: string;
}

interface ProjectListApiResponse {
  projects: ProjectListApiRow[];
}

interface StoneOptionRow {
  id: number;
  stone_group_key: string;
  display_name: string;
  status: string;
}

interface FinishOptionRow {
  id: number;
  finish_key: string;
  display_name: string;
  status: string;
}

interface StoneVariantOptionRow {
  id: number;
  stone_group_id: number;
  variant_key: string;
  display_name: string | null;
  status: string;
  sort_order: number;
}

interface FinishCapabilityOptionRow {
  stone_variant_id: number;
  finish_definition_id: number;
  capability: "yes" | "no" | "tbc";
}

interface FinishImageOptionRow {
  stone_group_id: number | null;
  stone_variant_id: number | null;
  finish_definition_id: number | null;
  media_asset_id: number;
  image_role: "primary" | "secondary" | "detail" | "swatch";
  status: string;
  sort_order: number;
}

interface MediaOptionRow {
  id: number;
  bucket: string | null;
  alt: string | null;
  caption: string | null;
  object_path: string | null;
  source_url: string | null;
  source_kind: string;
  media_type: string;
  status: string;
}

const projectEndpoint = "/api/admin/projects";
const publicMediaBucket = "urblo-public-media";
const mediaOptionSelect =
  "id,bucket,alt,caption,object_path,source_url,source_kind,media_type,status";
const mediaPickerLimit = 500;
const referencedMediaBatchSize = 100;
const signedPreviewLifetimeSeconds = 60 * 60;
const signedPreviewRefreshIntervalMs = 45 * 60 * 1000;

export default function AdminProjectsPage() {
  return (
    <RequireAdmin>
      <AdminProjectsContent />
    </RequireAdmin>
  );
}

function AdminProjectsContent() {
  const { profile, user } = useAdminAuth();
  const navigate = useNavigate();
  const { projectId: projectIdParam } = useParams<{ projectId?: string }>();
  const canEdit =
    profile?.role === "owner" ||
    profile?.role === "admin" ||
    profile?.role === "editor";
  const canCleanUpStorage =
    profile?.role === "owner" || profile?.role === "admin";
  const [projects, setProjects] = useState<ProjectListRow[]>([]);
  const [stones, setStones] = useState<ProjectStoneOption[]>([]);
  const [stoneVariants, setStoneVariants] = useState<ProjectStoneVariantOption[]>([]);
  const [finishes, setFinishes] = useState<ProjectFinishOption[]>([]);
  const [finishCapabilities, setFinishCapabilities] = useState<ProjectStoneFinishCapabilityOption[]>([]);
  const [finishImages, setFinishImages] = useState<ProjectStoneFinishImageOption[]>([]);
  const [media, setMedia] = useState<ProjectMediaOption[]>([]);
  const [draft, setDraft] = useState<ProjectAggregateDraft | null>(null);
  const [baseline, setBaseline] = useState<ProjectAggregateDraft | null>(null);
  const [baseRevision, setBaseRevision] = useState(0);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectListFilter>("projects");
  const [isIndexLoading, setIsIndexLoading] = useState(true);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPending, setIsMediaPending] = useState(false);
  const [isMediaBusy, setIsMediaBusy] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [editorSession, setEditorSession] = useState(0);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingNavigationLabel, setPendingNavigationLabel] = useState<
    string | null
  >(null);
  const indexReadyRef = useRef(false);
  const draftLoadGenerationRef = useRef(0);
  const mediaRef = useRef<readonly ProjectMediaOption[]>([]);
  const projectsRef = useRef<ProjectListRow[]>([]);
  const pendingNavigationActionRef = useRef<(() => void) | null>(null);
  const bypassNavigationGuardRef = useRef(false);
  const selectedProjectId = draft?.project.id ?? null;
  const isDirty = useMemo(
    () =>
      draft && baseline
        ? JSON.stringify(draft) !== JSON.stringify(baseline)
        : false,
    [baseline, draft],
  );
  const hasUnsavedWork = Boolean(isDirty || isMediaPending);
  const referencedMediaIdsKey = useMemo(
    () => (draft ? collectProjectMediaAssetIds(draft).join(",") : ""),
    [draft],
  );

  const projectCounts = useMemo(() => summarizeProjects(projects), [projects]);
  const projectIdsKey = useMemo(
    () => projects.map((project) => project.id).join(","),
    [projects],
  );
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (filter === "projects" && project.status === "archived") return false;
      if (filter !== "projects" && project.status !== filter) return false;
      if (!query) return true;
      return [project.title, project.slug, project.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [filter, projects, search]);

  const loadIndex = useCallback(async () => {
    if (!supabase) return;
    const client = supabase;
    setIsIndexLoading(true);
    setIndexError(null);

    try {
      const accessToken = await getAccessToken();
      const [projectListResponse, stonesResult, variantsResult, finishesResult, capabilitiesResult, finishImagesResult, mediaResult] =
        await Promise.all([
          fetch(projectEndpoint, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          client
            .from("stone_groups")
            .select("id,stone_group_key,display_name,status")
            .order("display_name", { ascending: true })
            .returns<StoneOptionRow[]>(),
          client
            .from("stone_variants")
            .select("id,stone_group_id,variant_key,display_name,status,sort_order")
            .order("sort_order", { ascending: true })
            .returns<StoneVariantOptionRow[]>(),
          client
            .from("finish_definitions")
            .select("id,finish_key,display_name,status")
            .order("sort_order", { ascending: true })
            .returns<FinishOptionRow[]>(),
          client
            .from("stone_finish_capabilities")
            .select("stone_variant_id,finish_definition_id,capability")
            .returns<FinishCapabilityOptionRow[]>(),
          client
            .from("stone_finish_images")
            .select("stone_group_id,stone_variant_id,finish_definition_id,media_asset_id,image_role,status,sort_order")
            .order("sort_order", { ascending: true })
            .returns<FinishImageOptionRow[]>(),
          client
            .from("media_assets")
            .select(mediaOptionSelect)
            .neq("status", "archived")
            .order("updated_at", { ascending: false })
            .limit(mediaPickerLimit)
            .returns<MediaOptionRow[]>(),
        ]);
      const projectList = await readProjectListApiResponse(projectListResponse);
      const loadError =
        stonesResult.error || variantsResult.error || finishesResult.error || capabilitiesResult.error || finishImagesResult.error || mediaResult.error;
      if (loadError) throw new Error(loadError.message);

      const finishImageMediaIds = [...new Set(
        (finishImagesResult.data ?? []).map((row) => row.media_asset_id),
      )];
      const finishImageMediaResults = await Promise.all(
        chunkValues(finishImageMediaIds, referencedMediaBatchSize).map((batch) =>
          client
            .from("media_assets")
            .select(mediaOptionSelect)
            .in("id", batch)
            .returns<MediaOptionRow[]>(),
        ),
      );
      const finishImageMediaError = finishImageMediaResults.find((result) => result.error)?.error;
      if (finishImageMediaError) throw new Error(finishImageMediaError.message);
      const mediaOptions = mergeProjectMediaOptions(
        (mediaResult.data ?? []).map(rowToMediaOption),
        finishImageMediaResults.flatMap((result) => (result.data ?? []).map(rowToMediaOption)),
      );
      const nextProjects = projectList.projects.map((project) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        status: project.status,
        location: project.location,
        sort_order: project.sortOrder,
        updated_at: project.updatedAt,
      }));
      projectsRef.current = nextProjects;
      setProjects(nextProjects);
      setStones(
        (stonesResult.data ?? []).map((row) => ({
          id: row.id,
          key: row.stone_group_key,
          label: row.display_name,
          status: row.status,
        })),
      );
      setStoneVariants(
        (variantsResult.data ?? []).map((row) => ({
          id: row.id,
          stoneGroupId: row.stone_group_id,
          key: row.variant_key,
          label: row.display_name || "Standard",
          status: row.status,
          sortOrder: row.sort_order,
        })),
      );
      setFinishes(
        (finishesResult.data ?? []).map((row) => ({
          id: row.id,
          key: row.finish_key,
          label: row.display_name,
          status: row.status,
        })),
      );
      setFinishCapabilities(
        (capabilitiesResult.data ?? []).map((row) => ({
          stoneVariantId: row.stone_variant_id,
          finishDefinitionId: row.finish_definition_id,
          capability: row.capability,
        })),
      );
      setFinishImages(
        (finishImagesResult.data ?? []).map((row) => ({
          stoneGroupId: row.stone_group_id,
          stoneVariantId: row.stone_variant_id,
          finishDefinitionId: row.finish_definition_id,
          mediaAssetId: row.media_asset_id,
          imageRole: row.image_role,
          status: row.status,
          sortOrder: row.sort_order,
        })),
      );
      setMedia(mediaOptions);
      setIsIndexLoading(false);
      indexReadyRef.current = true;

      void resolveMediaPreviews(mediaOptions).then((resolved) => {
        setMedia((current) => mergeMediaPreviews(current, resolved));
      });
    } catch (error) {
      console.error("Projects index load failed.", error);
      setIndexError(
        "Projects could not be loaded. Refresh the page and try again.",
      );
      setIsIndexLoading(false);
    }
  }, []);

  const refreshMediaOptions = useCallback(
    async (referencedDraft: ProjectAggregateDraft) => {
      if (!supabase) return;
      const [result, referencedOptions] = await Promise.all([
        supabase
          .from("media_assets")
          .select(mediaOptionSelect)
          .neq("status", "archived")
          .order("updated_at", { ascending: false })
          .limit(mediaPickerLimit)
          .returns<MediaOptionRow[]>(),
        fetchReferencedMediaOptions(referencedDraft),
      ]);
      if (result.error) throw new Error(result.error.message);
      const resolved = await resolveMediaPreviews(
        mergeProjectMediaOptions(
          (result.data ?? []).map(rowToMediaOption),
          referencedOptions,
        ),
      );
      setMedia([...resolved]);
    },
    [],
  );

  useEffect(() => {
    void loadIndex();
  }, [loadIndex, user?.id]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  const refreshReferencedPrivatePreviews = useCallback(
    async (mediaIds: readonly number[]) => {
      const referencedIds = new Set(mediaIds);
      const privateAssets = mediaRef.current.filter(
        (asset) =>
          referencedIds.has(asset.id) &&
          asset.sourceKind === "storage" &&
          Boolean(asset.bucket) &&
          asset.bucket !== publicMediaBucket &&
          Boolean(asset.objectPath),
      );
      if (!privateAssets.length) return;
      const resolved = await resolveMediaPreviews(privateAssets);
      setMedia((current) => mergeMediaPreviews(current, resolved));
    },
    [],
  );

  useEffect(() => {
    if (!referencedMediaIdsKey) return;
    const referencedIds = referencedMediaIdsKey
      .split(",")
      .map(Number)
      .filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0);
    const intervalId = window.setInterval(() => {
      void refreshReferencedPrivatePreviews(referencedIds).catch((error) => {
        console.error("Project image preview refresh failed.", error);
      });
    }, signedPreviewRefreshIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [referencedMediaIdsKey, refreshReferencedPrivatePreviews]);

  const discardCurrentWork = useCallback(() => {
    pendingNavigationActionRef.current = null;
    setPendingNavigationLabel(null);
    if (baseline) setDraft(structuredClone(baseline));
    setIsMediaPending(false);
    setHasConflict(false);
    setEditorError(null);
    setNotice("Unsaved changes were discarded.");
    setEditorSession((current) => current + 1);
  }, [baseline]);

  const queueDiscardNavigation = useCallback(
    (label: string, action: () => void) => {
      pendingNavigationActionRef.current = action;
      setPendingNavigationLabel(label);
      setNotice(
        "Choose whether to keep editing or discard this draft and continue.",
      );
    },
    [],
  );

  const cancelDiscardNavigation = useCallback(() => {
    pendingNavigationActionRef.current = null;
    setPendingNavigationLabel(null);
    setNotice("Your unsaved project is still open.");
  }, []);

  const discardAndContinue = useCallback(() => {
    if (isSaving || isMediaBusy) return;
    const action = pendingNavigationActionRef.current;
    pendingNavigationActionRef.current = null;
    setPendingNavigationLabel(null);
    discardCurrentWork();
    queueMicrotask(() => action?.());
  }, [discardCurrentWork, isMediaBusy, isSaving]);

  useEffect(() => {
    if (!hasUnsavedWork && !isSaving) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedWork && !isSaving) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const handleDocumentClick = (event: MouseEvent) => {
      if (bypassNavigationGuardRef.current) return;
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]") ?? null;
      const button = target?.closest<HTMLButtonElement>("button") ?? null;
      const isSignOut =
        button?.textContent?.trim().toLowerCase() === "sign out";
      if (!anchor && !isSignOut) return;
      if (
        anchor &&
        (anchor.target === "_blank" || anchor.hasAttribute("download"))
      )
        return;

      if (anchor) {
        const destination = new URL(anchor.href, window.location.href);
        if (
          destination.origin !== window.location.origin ||
          destination.href === window.location.href
        )
          return;
      }

      if (isSaving || isMediaBusy) {
        event.preventDefault();
        event.stopPropagation();
        setNotice(
          "Wait for the current image or save action to finish before leaving Projects.",
        );
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (anchor) {
        const destination = new URL(anchor.href, window.location.href);
        queueDiscardNavigation(
          `Leave Projects for ${anchor.textContent?.trim() || destination.pathname}`,
          () => {
            navigate(
              `${destination.pathname}${destination.search}${destination.hash}`,
            );
          },
        );
        return;
      }
      queueDiscardNavigation("Sign out", () => {
        bypassNavigationGuardRef.current = true;
        button?.click();
        queueMicrotask(() => {
          bypassNavigationGuardRef.current = false;
        });
      });
    };
    const handlePopState = () => {
      if (!hasUnsavedWork && !isSaving) return;
      const protectedPath = draft?.project.id
        ? `/admin/projects/${draft.project.id}`
        : "/admin/projects/new";
      const attemptedPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      setNotice(
        isSaving || isMediaBusy
          ? "Wait for the current image or save action to finish before leaving Projects."
          : "Choose whether to keep editing or discard this draft and go back.",
      );
      queueMicrotask(() => navigate(protectedPath, { replace: true }));
      if (!isSaving && !isMediaBusy) {
        queueDiscardNavigation("Go back", () => navigate(attemptedPath));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [
    draft?.project.id,
    hasUnsavedWork,
    isMediaBusy,
    isSaving,
    navigate,
    queueDiscardNavigation,
  ]);

  useEffect(() => {
    if (!indexReadyRef.current || isIndexLoading) return;

    if (projectIdParam === "new") {
      draftLoadGenerationRef.current += 1;
      const emptyDraft = createEmptyProjectAggregateDraft();
      setDraft(emptyDraft);
      setBaseline(createEmptyProjectAggregateDraft());
      setBaseRevision(0);
      setBaseUpdatedAt(null);
      setIsMediaPending(false);
      setHasConflict(false);
      setEditorSession((current) => current + 1);
      setEditorError(null);
      setNotice("New project started. Add the page content, then save once.");
      return;
    }

    const requestedId = parseProjectId(projectIdParam);
    const indexedProjects = projectsRef.current;
    const requestedProject = requestedId
      ? (indexedProjects.find((project) => project.id === requestedId) ?? null)
      : null;
    const nextProject = requestedProject ?? indexedProjects[0] ?? null;

    if (!nextProject) {
      navigate("/admin/projects/new", { replace: true });
      return;
    }

    if (requestedId !== nextProject.id || projectIdParam === undefined) {
      navigate(`/admin/projects/${nextProject.id}`, { replace: true });
      return;
    }

    void loadProjectDraft(nextProject.id);
  }, [isIndexLoading, navigate, projectIdParam, projectIdsKey]);

  async function loadProjectDraft(projectId: number) {
    if (!supabase) return;
    const generation = ++draftLoadGenerationRef.current;
    setIsDraftLoading(true);
    setIsMediaPending(false);
    setHasConflict(false);
    setEditorError(null);
    setNotice(null);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `${projectEndpoint}?projectId=${projectId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const payload = await readProjectApiResponse(response);
      if (generation !== draftLoadGenerationRef.current) return;

      const nextDraft = withResponseStatus(
        payload.draft,
        payload.status,
        payload.projectId,
      );
      const referencedOptions = await fetchReferencedMediaOptions(nextDraft);
      const resolvedReferencedOptions = await resolveMediaPreviews(
        referencedOptions,
      );
      if (generation !== draftLoadGenerationRef.current) return;
      setMedia((current) =>
        mergeProjectMediaOptions(current, resolvedReferencedOptions),
      );
      setDraft(nextDraft);
      setBaseline(nextDraft);
      setBaseRevision(payload.revision);
      setBaseUpdatedAt(payload.baseUpdatedAt);
      setEditorSession((current) => current + 1);
      setNotice(payload.message || null);
    } catch (error) {
      if (generation !== draftLoadGenerationRef.current) return;
      setEditorError(
        toPlainError(error, "This project could not be loaded. Try again."),
      );
      setDraft(null);
      setBaseline(null);
      setBaseRevision(0);
      setBaseUpdatedAt(null);
    } finally {
      if (generation === draftLoadGenerationRef.current)
        setIsDraftLoading(false);
    }
  }

  async function handleAction(action: ProjectEditorAction) {
    if (
      !supabase ||
      !canEdit ||
      !draft ||
      isSaving ||
      isMediaPending ||
      hasConflict
    )
      return;
    setIsSaving(true);
    setEditorError(null);
    setNotice(null);

    try {
      const accessToken = await getAccessToken();
      const requestDraft = normalizeProjectDraftForSave(draft);
      const response = await fetch(projectEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          projectId: draft.project.id,
          baseRevision,
          baseUpdatedAt,
          draft: requestDraft,
        }),
      });
      const payload = await readProjectApiResponse(response, {
        requireMessage: true,
      });
      const nextDraft = withResponseStatus(
        payload.draft,
        payload.status,
        payload.projectId,
      );
      setDraft(nextDraft);
      setBaseline(nextDraft);
      setBaseRevision(payload.revision);
      setBaseUpdatedAt(payload.baseUpdatedAt);
      setHasConflict(false);
      let mediaRefreshWarning = "";
      if (action === "publish") {
        try {
          await refreshMediaOptions(nextDraft);
        } catch (refreshError) {
          console.error(
            "Published project media refresh failed.",
            refreshError,
          );
          mediaRefreshWarning =
            " Reload this project before checking the newly published images.";
        }
      }
      const responseMessage = [
        payload.message || actionMessage(action),
        ...(payload.warnings ?? []),
      ]
        .filter(Boolean)
        .join(" ");
      setNotice(`${responseMessage}${mediaRefreshWarning}`);
      setProjects((current) => {
        const nextProjects = upsertProjectListRow(current, nextDraft);
        projectsRef.current = nextProjects;
        return nextProjects;
      });

      if (projectIdParam !== String(payload.projectId)) {
        navigate(`/admin/projects/${payload.projectId}`, { replace: true });
      }
    } catch (error) {
      if (
        error instanceof ProjectApiError &&
        error.code === "revision_conflict"
      )
        setHasConflict(true);
      setEditorError(
        toPlainError(
          error,
          "The project could not be saved. Your draft is still open; try again.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function selectProject(project: ProjectListRow) {
    if (project.id === selectedProjectId) return;
    if (isSaving || isMediaBusy) {
      setNotice(
        "Wait for the current image or save action to finish before switching projects.",
      );
      return;
    }
    if (hasUnsavedWork) {
      queueDiscardNavigation(`Open “${project.title}”`, () =>
        navigate(`/admin/projects/${project.id}`),
      );
      return;
    }
    navigate(`/admin/projects/${project.id}`);
  }

  function startNewProject() {
    if (!canEdit || isSaving || isMediaBusy) return;
    if (hasUnsavedWork) {
      queueDiscardNavigation("Start a new project", () =>
        navigate("/admin/projects/new"),
      );
      return;
    }
    navigate("/admin/projects/new");
  }

  function handleAssetCreated(asset: ProjectMediaOption) {
    setMedia((current) => [
      asset,
      ...current.filter((item) => item.id !== asset.id),
    ]);
  }

  function reloadLatestProject() {
    if (isSaving || isMediaBusy) return;
    if (hasUnsavedWork) {
      queueDiscardNavigation(
        "Reload the latest saved project",
        reloadLatestProjectNow,
      );
      return;
    }
    reloadLatestProjectNow();
  }

  function reloadLatestProjectNow() {
    if (draft?.project.id) {
      void loadProjectDraft(draft.project.id);
      return;
    }
    const emptyDraft = createEmptyProjectAggregateDraft();
    setDraft(emptyDraft);
    setBaseline(createEmptyProjectAggregateDraft());
    setBaseRevision(0);
    setBaseUpdatedAt(null);
    setIsMediaPending(false);
    setHasConflict(false);
    setEditorError(null);
    setNotice("New project reset.");
    setEditorSession((current) => current + 1);
  }

  return (
    <AdminShell
      title="Projects"
      eyebrow="Website pages"
      actions={
        <button
          type="button"
          onClick={startNewProject}
          disabled={!canEdit || isSaving || isMediaBusy}
          className="inline-flex min-h-10 items-center gap-2 rounded bg-[var(--urblo-lime)] px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/35"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      }
    >
      {pendingNavigationLabel ? (
        <div
          className="mb-5 flex flex-col gap-3 border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
          data-testid="project-discard-navigation-banner"
        >
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Unsaved project changes
            </p>
            <p className="mt-1 text-sm text-amber-900">
              {pendingNavigationLabel}?
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cancelDiscardNavigation}
              className="min-h-10 rounded border border-amber-400 bg-white px-4 text-xs font-bold uppercase tracking-[0.11em] text-amber-950"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={discardAndContinue}
              disabled={isSaving || isMediaBusy}
              className="min-h-10 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.11em] text-white disabled:bg-black/25"
            >
              Discard and continue
            </button>
          </div>
        </div>
      ) : null}
      <div className="grid gap-5 min-[1080px]:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="self-start border border-black/10 bg-white min-[1080px]:sticky min-[1080px]:top-5 min-[1080px]:flex min-[1080px]:max-h-[calc(100vh-2.5rem)] min-[1080px]:flex-col">
          <div className="border-b border-black/10 p-4">
            <label className="relative block">
              <span className="sr-only">Search projects</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/38" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects"
                className="min-h-11 w-full rounded border border-black/15 bg-white pl-10 pr-3 text-sm font-medium outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <FilterButton
                active={filter === "projects"}
                label={`Projects ${projectCounts.active}`}
                onClick={() => setFilter("projects")}
                wide
              />
              <FilterButton
                active={filter === "draft"}
                label={`Drafts ${projectCounts.draft}`}
                onClick={() => setFilter("draft")}
              />
              <FilterButton
                active={filter === "published"}
                label={`Live ${projectCounts.published}`}
                onClick={() => setFilter("published")}
              />
              {projectCounts.archived > 0 ? (
                <FilterButton
                  active={filter === "archived"}
                  label={`Archive ${projectCounts.archived}`}
                  onClick={() => setFilter("archived")}
                  quiet
                  wide
                />
              ) : null}
            </div>
          </div>

          <div
            className="max-h-[65vh] overflow-y-auto p-2 min-[1080px]:min-h-0 min-[1080px]:max-h-none min-[1080px]:flex-1"
            aria-label="Project list"
          >
            {isIndexLoading ? <ListState>Loading projects…</ListState> : null}
            {!isIndexLoading && indexError ? (
              <ListState>{indexError}</ListState>
            ) : null}
            {!isIndexLoading &&
              !indexError &&
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => selectProject(project)}
                  aria-pressed={selectedProjectId === project.id}
                  className={[
                    "mb-1 w-full border p-3 text-left transition last:mb-0",
                    selectedProjectId === project.id
                      ? "border-black bg-black text-white"
                      : "border-transparent bg-white text-black hover:border-black/15 hover:bg-black/[0.035]",
                  ].join(" ")}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {project.title}
                      </span>
                      <span
                        className={`mt-1 block truncate text-xs ${selectedProjectId === project.id ? "text-white/56" : "text-black/45"}`}
                      >
                        {project.location || "Location not added"}
                      </span>
                    </span>
                    <ProjectListStatus status={project.status} />
                  </span>
                </button>
              ))}
            {!isIndexLoading && !indexError && !filteredProjects.length ? (
              <ListState>No projects match this view.</ListState>
            ) : null}
          </div>
        </aside>

        <section className="min-w-0">
          {isDraftLoading ? (
            <EditorState
              title="Loading project"
              detail="Bringing the whole page draft into one editor."
            />
          ) : draft && baseline ? (
            <ProjectEditor
              key={`${draft.project.id ?? "new"}-${editorSession}`}
              draft={draft}
              isDirty={isDirty}
              media={media}
              stones={stones}
              stoneVariants={stoneVariants}
              finishes={finishes}
              finishCapabilities={finishCapabilities}
              finishImages={finishImages}
              userId={user?.id ?? null}
              canEdit={Boolean(canEdit)}
              canCleanUpStorage={canCleanUpStorage}
              isSaving={isSaving}
              error={editorError}
              notice={notice}
              onChange={(nextDraft) => {
                setDraft(nextDraft);
                setEditorError(null);
                setNotice(null);
              }}
              onAction={handleAction}
              onAssetCreated={handleAssetCreated}
              onMediaPendingChange={setIsMediaPending}
              onMediaBusyChange={setIsMediaBusy}
              onDiscard={discardCurrentWork}
              onReload={reloadLatestProject}
              showReload={hasConflict}
            />
          ) : (
            <EditorState
              title={editorError ? "Project unavailable" : "Choose a project"}
              detail={
                editorError ||
                "Select a project from the list or start a new one."
              }
              onRetry={
                editorError && parseProjectId(projectIdParam)
                  ? () =>
                      void loadProjectDraft(
                        parseProjectId(projectIdParam) as number,
                      )
                  : undefined
              }
            />
          )}
        </section>
      </div>
    </AdminShell>
  );
}

async function getAccessToken() {
  if (!supabase)
    throw new Error("Your admin session is not available. Sign in again.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token)
    throw new Error("Your session has expired. Sign in again.");
  return data.session.access_token;
}

class ProjectApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ProjectApiError";
    this.status = status;
    this.code = code;
  }
}

async function readProjectApiResponse(
  response: Response,
  options: { requireMessage?: boolean } = {},
): Promise<ProjectApiResponse> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    if (!response.ok)
      throw new Error(
        "The project service returned an unreadable response. Try again.",
      );
  }

  if (!response.ok) {
    const message =
      objectString(payload, "message") || objectString(payload, "error");
    const code = objectString(payload, "error") || "project_request_failed";
    if (response.status === 409) {
      throw new ProjectApiError(
        response.status,
        code,
        message ||
          "This project changed in another session. Reload it before saving again.",
      );
    }
    throw new ProjectApiError(
      response.status,
      code,
      message ||
        "The project service could not complete this action. Try again.",
    );
  }

  if (!isProjectApiResponse(payload, options)) {
    throw new Error(
      "The project service returned an incomplete response. Reload before continuing.",
    );
  }
  return payload;
}

async function readProjectListApiResponse(
  response: Response,
): Promise<ProjectListApiResponse> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error(
      "The project list returned an unreadable response. Try again.",
    );
  }

  if (!response.ok) {
    const message =
      objectString(payload, "message") || objectString(payload, "error");
    throw new Error(message || "Projects could not be loaded. Try again.");
  }
  if (!isProjectListApiResponse(payload)) {
    throw new Error(
      "The project list returned an incomplete response. Try again.",
    );
  }
  return payload;
}

function isProjectListApiResponse(
  value: unknown,
): value is ProjectListApiResponse {
  if (!value || typeof value !== "object") return false;
  const projects = (value as Partial<ProjectListApiResponse>).projects;
  return (
    Array.isArray(projects) &&
    projects.every(
      (project) =>
        Number.isInteger(project.id) &&
        typeof project.slug === "string" &&
        typeof project.title === "string" &&
        (project.status === "draft" ||
          project.status === "published" ||
          project.status === "archived") &&
        (typeof project.location === "string" || project.location === null) &&
        typeof project.sortOrder === "number" &&
        typeof project.updatedAt === "string",
    )
  );
}

function withResponseStatus(
  draft: ProjectAggregateDraft,
  status: ProjectLifecycleStatus,
  projectId: number,
): ProjectAggregateDraft {
  return { ...draft, project: { ...draft.project, id: projectId, status } };
}

function objectString(value: unknown, key: string) {
  if (!value || typeof value !== "object") return "";
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" ? candidate : "";
}

function toPlainError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function parseProjectId(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function rowToMediaOption(row: MediaOptionRow): ProjectMediaOption {
  return {
    id: row.id,
    bucket: row.bucket,
    alt: row.alt,
    caption: row.caption,
    objectPath: row.object_path,
    sourceUrl: row.source_url,
    sourceKind: row.source_kind,
    mediaType: row.media_type,
    status: row.status,
    previewUrl: row.source_kind === "storage" ? null : row.source_url,
  };
}

async function fetchReferencedMediaOptions(
  draft: ProjectAggregateDraft,
): Promise<ProjectMediaOption[]> {
  if (!supabase) return [];
  const client = supabase;
  const mediaIds = collectProjectMediaAssetIds(draft);
  if (!mediaIds.length) return [];
  const batches = chunkValues(mediaIds, referencedMediaBatchSize);
  const results = await Promise.all(
    batches.map((batch) =>
      client
        .from("media_assets")
        .select(mediaOptionSelect)
        .in("id", batch)
        .returns<MediaOptionRow[]>(),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
  return results.flatMap((result) =>
    (result.data ?? []).map(rowToMediaOption),
  );
}

function chunkValues<T>(values: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

async function resolveMediaPreviews(assets: readonly ProjectMediaOption[]) {
  if (!supabase) return assets;
  const client = supabase;
  const resolved = assets.map((asset) => ({ ...asset }));
  const privateByBucket = new Map<string, ProjectMediaOption[]>();

  for (const asset of resolved) {
    if (asset.sourceKind !== "storage" || !asset.bucket || !asset.objectPath) {
      asset.previewUrl = asset.sourceUrl;
      continue;
    }
    if (asset.bucket === publicMediaBucket) {
      asset.previewUrl = client.storage
        .from(asset.bucket)
        .getPublicUrl(asset.objectPath).data.publicUrl;
      continue;
    }
    privateByBucket.set(asset.bucket, [
      ...(privateByBucket.get(asset.bucket) ?? []),
      asset,
    ]);
  }

  await Promise.all(
    [...privateByBucket.entries()].map(async ([bucket, bucketAssets]) => {
      const paths = bucketAssets.flatMap((asset) =>
        asset.objectPath ? [asset.objectPath] : [],
      );
      if (!paths.length) return;
      const signed = await client.storage
        .from(bucket)
        .createSignedUrls(paths, signedPreviewLifetimeSeconds);
      if (signed.error || !signed.data) return;
      const urlByPath = new Map(
        signed.data.map((item) => [item.path, item.signedUrl]),
      );
      bucketAssets.forEach((asset) => {
        if (asset.objectPath)
          asset.previewUrl = urlByPath.get(asset.objectPath) ?? null;
      });
    }),
  );

  return resolved;
}

function mergeMediaPreviews(
  current: readonly ProjectMediaOption[],
  resolved: readonly ProjectMediaOption[],
) {
  const resolvedById = new Map(resolved.map((asset) => [asset.id, asset]));
  return current.map((asset) => {
    const next = resolvedById.get(asset.id);
    if (
      !next ||
      next.sourceKind !== asset.sourceKind ||
      next.bucket !== asset.bucket ||
      next.objectPath !== asset.objectPath
    ) {
      return asset;
    }
    return {
      ...asset,
      previewUrl: next.previewUrl ?? asset.previewUrl,
    };
  });
}

function upsertProjectListRow(
  rows: readonly ProjectListRow[],
  draft: ProjectAggregateDraft,
) {
  if (!draft.project.id) return [...rows];
  const next: ProjectListRow = {
    id: draft.project.id,
    slug: draft.project.slug,
    title: draft.project.title || "Untitled project",
    status: draft.project.status,
    location: draft.project.location || null,
    sort_order: draft.project.sortOrder,
    updated_at: new Date().toISOString(),
  };
  return [...rows.filter((row) => row.id !== next.id), next].sort(
    (left, right) =>
      left.sort_order - right.sort_order ||
      left.title.localeCompare(right.title),
  );
}

function summarizeProjects(projects: readonly ProjectListRow[]) {
  return projects.reduce(
    (counts, project) => ({
      active: counts.active + (project.status === "archived" ? 0 : 1),
      draft: counts.draft + (project.status === "draft" ? 1 : 0),
      published: counts.published + (project.status === "published" ? 1 : 0),
      archived: counts.archived + (project.status === "archived" ? 1 : 0),
    }),
    { active: 0, draft: 0, published: 0, archived: 0 },
  );
}

function actionMessage(action: ProjectEditorAction) {
  if (action === "publish") return "Project is live.";
  if (action === "archive") return "Project is hidden.";
  return "Project draft saved.";
}

function FilterButton({
  active,
  label,
  onClick,
  quiet = false,
  wide = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  quiet?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "min-h-9 rounded border px-2 text-[11px] font-bold uppercase tracking-[0.1em] transition",
        wide ? "col-span-2" : "",
        active
          ? "border-black bg-black text-white"
          : quiet
            ? "border-transparent bg-black/[0.035] text-black/45 hover:border-black/20 hover:text-black"
            : "border-black/12 bg-white text-black/52 hover:border-black",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ProjectListStatus({ status }: { status: ProjectLifecycleStatus }) {
  const labels: Record<ProjectLifecycleStatus, string> = {
    draft: "Draft",
    published: "Live",
    archived: "Archived",
  };
  return (
    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] opacity-65">
      {labels[status]}
    </span>
  );
}

function ListState({ children }: { children: string }) {
  return (
    <p className="p-6 text-center text-sm font-semibold leading-6 text-black/48">
      {children}
    </p>
  );
}

function EditorState({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail: string;
  onRetry?: () => void;
}) {
  return (
    <div className="grid min-h-[420px] place-items-center border border-black/10 bg-white p-8 text-center">
      <div>
        <FileText className="mx-auto h-7 w-7 text-black/30" />
        <h2 className="mt-4 text-2xl font-light text-black">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
          {detail}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 min-h-10 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.12em] text-white"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
