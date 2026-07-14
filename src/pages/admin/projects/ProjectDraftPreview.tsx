import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import ProjectPageView from "../../../components/projects/ProjectPageView";
import type { ProjectData } from "../../../data/projectData";
import {
  draftToProjectData,
  type ProjectAggregateDraft,
  type ProjectAggregateMappingContext,
  type ProjectPublishBlocker,
} from "../../../features/projects/projectAggregate";
import ProjectService from "../../../service/ProjectService";

interface ProjectDraftPreviewProps {
  draft: ProjectAggregateDraft;
  context: ProjectAggregateMappingContext;
  blockers: readonly ProjectPublishBlocker[];
  onClose: () => void;
  onBlockerClick: (blocker: ProjectPublishBlocker) => void;
}

export default function ProjectDraftPreview({
  draft,
  context,
  blockers,
  onClose,
  onBlockerClick,
}: ProjectDraftPreviewProps) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [publishedProjects, setPublishedProjects] = useState<ProjectData[]>([]);
  onCloseRef.current = onClose;
  const deferredDraft = useDeferredValue(draft);
  const deferredContext = useDeferredValue(context);
  const previewProject = useMemo(
    () => draftToProjectData(deferredDraft, deferredContext),
    [deferredContext, deferredDraft],
  );
  const previewProjectList = useMemo(() => {
    const currentIndex = publishedProjects.findIndex(
      (project) => project.slug === previewProject.slug,
    );
    if (currentIndex === -1) return [...publishedProjects, previewProject];
    return publishedProjects.map((project, index) =>
      index === currentIndex ? previewProject : project,
    );
  }, [previewProject, publishedProjects]);

  useEffect(() => {
    let active = true;
    ProjectService.getAll()
      .then((projects) => {
        if (active) setPublishedProjects(projects);
      })
      .catch(() => {
        if (active) setPublishedProjects([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <section
      ref={dialogRef}
      className="fixed inset-0 z-[80] flex flex-col bg-[#eef0eb]"
      role="dialog"
      aria-modal="true"
      aria-label="Project page preview"
      tabIndex={-1}
      data-testid="project-draft-preview"
    >
      <header className="shrink-0 border-b border-black/10 bg-white px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/42">
              Current draft
            </p>
            <h2 className="mt-1 text-lg font-semibold text-black">
              Public page preview
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#33363f]"
          >
            <X className="h-4 w-4" />
            Close preview
          </button>
        </div>

        {blockers.length ? (
          <div
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Items to finish before publishing"
          >
            {blockers.map((blocker, index) => (
              <button
                key={blocker.id}
                type="button"
                onClick={() => onBlockerClick(blocker)}
                className="inline-flex min-h-9 items-center gap-2 rounded border border-amber-300 bg-amber-50 px-3 text-left text-xs font-semibold leading-5 text-amber-900 transition hover:border-amber-500"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {index + 1}. {blocker.message}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 inline-flex min-h-9 items-center rounded border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] px-3 text-xs font-semibold text-black">
            Ready to publish.
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <ProjectPageView
          project={previewProject}
          allProjects={previewProjectList}
          previewMode
        />
      </div>
    </section>
  );
}
