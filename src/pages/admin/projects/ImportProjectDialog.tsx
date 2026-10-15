import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { FileUp, X } from "lucide-react";
import StoneDialog from "../../../features/stone-library/StoneDialog";
import BlockTypeIcon from "../../../components/admin/blocks/BlockTypeIcon";
import {
  contentBlockDefinition,
  summarizeContentBlock,
} from "../../../features/blocks/schema";
import {
  catalogueResolvers,
  packageImageFiles,
  packageToDraft,
  parseProjectPackageText,
  resolveImportSlug,
  type PackageCatalogue,
  type PackageIssue,
  type ParsedProjectPackage,
} from "../../../features/blocks/importPackage";
import { readPackageZip } from "../../../features/blocks/importZip";
import type {
  ProjectAggregateDraft,
  ProjectMediaOption,
} from "../../../features/projects/projectAggregate";
import { recordAdminAuditEvent } from "../../../lib/adminAudit";
import { supabase } from "../../../lib/supabaseClient";
import { AdminFeedback } from "../AdminFeedback";
import { useAdminFeedback } from "../useAdminFeedback";
import { preparePickerUpload } from "../media/mediaPickerFiles";
import { uploadPickerFile } from "../media/uploadPickerFile";

// Import a project package from Claude Design (docs/content-import/README.md). Three steps, one
// at a time: Choose file → Review → Importing. Everything happens in this browser: images go
// through the same private upload as the media picker, the project is saved once as a Draft
// through the normal Projects Save, and nothing is published.

const packageFormatHref =
  "https://github.com/jayyy-3/jayyy-3.github.io/blob/main/docs/content-import/README.md";

type Step = "choose" | "review" | "importing";

interface ReviewState {
  sourceName: string;
  parsed: ParsedProjectPackage | null;
  errors: PackageIssue[];
  warnings: PackageIssue[];
  /** Images inside the zip; empty for a JSON file or pasted text. */
  files: Map<string, Blob>;
}

export interface ImportedProject {
  projectId: number;
  draft: ProjectAggregateDraft;
  assets: ProjectMediaOption[];
  notice: string;
}

interface ImportProjectDialogProps {
  userId: string;
  canCleanUpStorage: boolean;
  catalogue: PackageCatalogue;
  existingSlugs: readonly string[];
  /** Saves a new Draft through the Projects Save action; throws a plain-English Error. */
  saveDraft: (draft: ProjectAggregateDraft) => Promise<{ projectId: number; draft: ProjectAggregateDraft }>;
  onImported: (result: ImportedProject) => void;
  onClose: () => void;
}

interface FailedImage {
  file: string;
  message: string;
  resolve: (choice: "retry" | "skip") => void;
}

const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/20";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35";

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

export default function ImportProjectDialog({
  userId,
  canCleanUpStorage,
  catalogue,
  existingSlugs,
  saveDraft,
  onImported,
  onClose,
}: ImportProjectDialogProps) {
  const [step, setStep] = useState<Step>("choose");
  const [review, setReview] = useState<ReviewState | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pasted, setPasted] = useState("");
  const [progress, setProgress] = useState("");
  const [failedImage, setFailedImage] = useState<FailedImage | null>(null);
  const [canRetrySave, setCanRetrySave] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadedRef = useRef(new Map<string, ProjectMediaOption>());
  const skippedRef = useRef(new Set<string>());
  const { feedback, setError, reportError, clearFeedback } = useAdminFeedback("import");
  const resolvers = useMemo(() => catalogueResolvers(catalogue), [catalogue]);
  const isImporting = step === "importing" && !canRetrySave && !failedImage;

  useEffect(() => {
    if (step !== "importing") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [step]);

  async function readFile(file: File) {
    clearFeedback();
    const name = file.name.toLowerCase();
    const isZip = name.endsWith(".zip") || /zip/.test(file.type);
    const isJson = name.endsWith(".json") || file.type === "application/json";
    if (!isZip && !isJson) {
      setError("Choose the .zip or .json file exported from Claude Design.");
      return;
    }
    setIsReading(true);
    try {
      if (isZip) {
        const { archive, errors } = await readPackageZip(file);
        if (!archive) {
          showReview({ sourceName: file.name, parsed: null, errors, warnings: [], files: new Map() });
          return;
        }
        const result = parseProjectPackageText(archive.projectJson);
        showReview({ sourceName: file.name, ...result, parsed: result.package, files: archive.files });
        return;
      }
      const result = parseProjectPackageText(await file.text());
      showReview({ sourceName: file.name, ...result, parsed: result.package, files: new Map() });
    } catch (error) {
      reportError(error, { entity: "package", action: "load" });
    } finally {
      setIsReading(false);
    }
  }

  function readPasted() {
    clearFeedback();
    if (!pasted.trim()) {
      setError("Paste the package text first.");
      return;
    }
    const result = parseProjectPackageText(pasted);
    showReview({ sourceName: "Pasted text", ...result, parsed: result.package, files: new Map() });
  }

  function showReview(next: ReviewState) {
    setReview(next);
    setStep("review");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void readFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && !isReading) void readFile(file);
  }

  const summary = useMemo(() => {
    if (!review?.parsed) return null;
    const parsed = review.parsed;
    const slug = resolveImportSlug(parsed, existingSlugs);
    const imageFiles = packageImageFiles(parsed);
    const found = imageFiles.filter((image) => review.files.has(image.file));
    const missingFiles = imageFiles.filter((image) => !review.files.has(image.file));
    const withoutFile = parsed.images.filter((use) => !use.file);
    const preview = packageToDraft(parsed, {
      ...resolvers,
      mediaIdForFile: () => null,
      existingSlugs,
    });
    const unresolved = preview.unresolvedStones;
    const unresolvedPaths = new Set(unresolved.map((use) => use.path));
    const resolved = parsed.stones
      .filter((use) => !unresolvedPaths.has(use.path))
      .map((use) => (use.finish ? `${resolvers.stoneLabel(use.stone)} (${resolvers.finishLabel(use.finish).toLowerCase()})` : resolvers.stoneLabel(use.stone)));
    const unusedFiles = [...review.files.keys()].filter((file) => !imageFiles.some((image) => image.file === file));
    const extraWarnings: PackageIssue[] = [
      ...(review.files.size > 0
        ? missingFiles.map((image) => ({
            path: image.file,
            message: "This image is not in the zip. Add it in the editor after importing.",
          }))
        : missingFiles.length
          ? [{ path: "images", message: `No images came with this file. Add ${plural(missingFiles.length, "image")} in the editor after importing.` }]
          : []),
      ...unusedFiles.map((file) => ({ path: file, message: "This image is not used by any block, so it will not be imported." })),
      ...unresolved.map((use) => ({
        path: use.path,
        message:
          use.reason === "stone"
            ? `"${use.stone}" is not a Live stone in the Stone Library. Choose the stone in the editor.`
            : `"${use.finish}" is not a known finish. Choose the finish in the editor.`,
      })),
    ];
    return {
      slug,
      blocks: preview.draft.blocks,
      found,
      laterCount: missingFiles.length + withoutFile.length,
      resolved: [...new Set(resolved)],
      unresolved: [...new Set(unresolved.map((use) => (use.finish ? `${use.stone} (${use.finish})` : use.stone)))],
      warnings: [...review.warnings, ...extraWarnings],
    };
  }, [existingSlugs, resolvers, review]);

  const waitForChoice = useCallback(
    (file: string, message: string) =>
      new Promise<"retry" | "skip">((resolve) => setFailedImage({ file, message, resolve })),
    [],
  );

  async function uploadOne(file: string, alt: string, blob: Blob): Promise<ProjectMediaOption | null> {
    if (!supabase) throw new Error("Your admin session is not available. Sign in again.");
    const name = file.split("/").pop() ?? file;
    for (;;) {
      let message: string;
      try {
        const prepared = await preparePickerUpload(new File([blob], name, { type: blob.type }), "original");
        const result = await uploadPickerFile({
          client: supabase,
          userId,
          prepared,
          alt,
          objectPathPrefix: "project-import",
          auditSource: "project_import",
          canCleanUpStorage,
        });
        if (result.ok) return result.asset;
        message = result.error;
      } catch (error) {
        message = error instanceof Error && error.message ? error.message : "The image could not be uploaded. Check your connection and try again.";
      }
      const choice = await waitForChoice(file, message);
      setFailedImage(null);
      if (choice === "skip") return null;
    }
  }

  async function runImport() {
    if (!review?.parsed || !summary || !supabase) return;
    const parsed = review.parsed;
    setStep("importing");
    setCanRetrySave(false);
    clearFeedback();
    const toUpload = summary.found.filter((image) => !uploadedRef.current.has(image.file) && !skippedRef.current.has(image.file));
    const total = summary.found.length;
    for (const image of toUpload) {
      const index = summary.found.indexOf(image) + 1;
      setProgress(`Uploading ${index} of ${plural(total, "image")}`);
      const asset = await uploadOne(image.file, image.alt, review.files.get(image.file) as Blob);
      if (asset) uploadedRef.current.set(image.file, asset);
      else skippedRef.current.add(image.file);
    }
    await saveImportedDraft(parsed);
  }

  async function saveImportedDraft(parsed: ParsedProjectPackage) {
    if (!supabase) return;
    setCanRetrySave(false);
    clearFeedback();
    setProgress("Saving draft");
    const result = packageToDraft(parsed, {
      ...resolvers,
      mediaIdForFile: (file) => uploadedRef.current.get(file)?.id ?? null,
      existingSlugs,
    });
    let saved: { projectId: number; draft: ProjectAggregateDraft };
    try {
      saved = await saveDraft(result.draft);
    } catch (error) {
      setCanRetrySave(true);
      const plain = error instanceof Error && "status" in error && error.message ? error.message : undefined;
      reportError(error, {
        entity: "project",
        message: plain ? `${plain} The images are uploaded; press Try again to save the draft.` : undefined,
        retry: () => void saveImportedDraft(parsed),
      });
      return;
    }

    const imagesUploaded = uploadedRef.current.size;
    const imagesPending = new Set(result.pendingImages.map((use) => use.file ?? use.path)).size;
    let auditNote = "";
    try {
      const auditError = await recordAdminAuditEvent(supabase, {
        actorUserId: userId,
        action: "project.import",
        entityType: "projects",
        entityId: saved.projectId,
        metadata: {
          projectId: saved.projectId,
          blocks: result.draft.blocks.length,
          imagesUploaded,
          imagesPending,
          stonesUnresolved: result.unresolvedStones.length,
        },
      });
      if (auditError) {
        console.error("Project import audit failed.", auditError);
        auditNote = " Change history could not be updated; ask a Website owner or CMS manager to note this import.";
      }
    } catch (auditError) {
      console.error("Project import audit failed.", auditError);
      auditNote = " Change history could not be updated; ask a Website owner or CMS manager to note this import.";
    }

    const toChoose = [...new Set(result.unresolvedStones.map((use) => use.stone))];
    const notice = [
      "Imported as a draft. Review each block, add any missing images, then Publish.",
      imagesPending ? `${plural(imagesPending, "image")} to add.` : "",
      toChoose.length ? `Stones to choose: ${toChoose.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ") + auditNote;
    onImported({
      projectId: saved.projectId,
      draft: saved.draft,
      assets: [...uploadedRef.current.values()],
      notice,
    });
  }

  const title =
    step === "choose" ? "Import a project package" : step === "review" ? "Check the package" : "Importing";

  return (
    <StoneDialog
      label="Import a project package"
      onClose={onClose}
      locked={step === "importing"}
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center sm:p-6"
    >
      <section
        className="relative w-full max-w-2xl border border-black/10 bg-white p-5 text-black sm:p-7"
        data-testid="project-import-dialog"
        data-step={step}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
              Step {step === "choose" ? 1 : step === "review" ? 2 : 3} of 3
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
          </div>
          {step !== "importing" ? (
            <button type="button" onClick={onClose} aria-label="Close" className="rounded p-2 text-black/55 transition hover:bg-black/5 hover:text-black">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <AdminFeedback feedback={feedback} scope="import" onDismiss={clearFeedback} className="mt-4" />

        {step === "choose" ? (
          <div className="mt-4" data-testid="project-import-choose">
            <p className="text-sm leading-6 text-black/70">
              Export a project package from Claude Design, or paste the package text.{" "}
              <a href={packageFormatHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-black underline underline-offset-4">
                Package format
              </a>
            </p>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                if (!isReading) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`mt-4 grid place-items-center gap-3 border border-dashed p-8 text-center ${isDragging ? "border-black bg-black/[0.04]" : "border-black/25"}`}
            >
              <FileUp className="h-6 w-6 text-black/55" aria-hidden="true" />
              <p className="text-sm text-black/70">Drop the .zip or .json file here, or</p>
              <button type="button" className={primaryButton} disabled={isReading} onClick={() => fileInputRef.current?.click()}>
                {isReading ? "Reading the package…" : "Choose file"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.json,application/zip,application/json"
                className="sr-only"
                onChange={handleFileChange}
                data-testid="project-import-file"
                aria-label="Choose the project package"
              />
              <p className="text-xs text-black/50">A .zip holds the text and its images; a .json file has the text only and you add images afterwards.</p>
            </div>
            <details className="mt-4 border border-black/10 p-4">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em]">Paste the package text instead</summary>
              <label className="mt-3 block text-sm font-semibold" htmlFor="project-import-paste">
                Package text
              </label>
              <textarea
                id="project-import-paste"
                value={pasted}
                onChange={(event) => setPasted(event.target.value)}
                rows={8}
                className="mt-2 w-full rounded border border-black/15 p-3 font-mono text-xs outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                data-testid="project-import-paste"
              />
              <button type="button" className={`${secondaryButton} mt-3`} onClick={readPasted}>
                Check pasted text
              </button>
            </details>
          </div>
        ) : null}

        {step === "review" && review ? (
          <div className="mt-4 space-y-5" data-testid="project-import-review">
            <p className="text-sm text-black/55">From {review.sourceName}</p>
            {summary ? (
              <>
                <div>
                  <p className="text-lg font-semibold">{review.parsed?.project.title}</p>
                  <p className="mt-1 text-sm text-black/65">
                    Page address: /projects/{summary.slug.slug}
                    {summary.slug.changed ? ` (“${summary.slug.requested}” is already used, so a number was added)` : ""}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Body · {plural(summary.blocks.length, "block")}</h3>
                  <ol className="mt-2 divide-y divide-black/10 border-y border-black/10">
                    {summary.blocks.map((block, index) => (
                      <li key={block.key} className="flex items-start gap-3 py-2 text-sm">
                        <BlockTypeIcon type={block.type} className="mt-0.5 h-4 w-4 shrink-0 text-black/60" />
                        <span className="min-w-0">
                          <span className="font-semibold">
                            {index + 1}. {contentBlockDefinition(block.type).label}
                          </span>
                          <span className="block truncate text-black/60">{summarizeContentBlock(block) || "No text"}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
                  <dt className="font-semibold">Images</dt>
                  <dd data-testid="project-import-images">
                    {summary.found.length} found in package · {summary.laterCount} to add later
                  </dd>
                  <dt className="font-semibold">Stones</dt>
                  <dd data-testid="project-import-stones">
                    {summary.resolved.length ? `Found: ${summary.resolved.join(", ")}` : "None found"}
                    {summary.unresolved.length ? ` · To choose in the editor: ${summary.unresolved.join(", ")}` : ""}
                  </dd>
                </dl>
              </>
            ) : null}
            {review.errors.length ? (
              <IssueList
                title="Fix these in Claude Design, then export again"
                issues={review.errors}
                tone="error"
                testId="project-import-errors"
              />
            ) : null}
            {summary?.warnings.length ? (
              <IssueList title="Check after importing" issues={summary.warnings} tone="warning" testId="project-import-warnings" />
            ) : null}
            <div className="flex flex-wrap justify-end gap-3 border-t border-black/10 pt-4">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => {
                  setReview(null);
                  setStep("choose");
                  clearFeedback();
                }}
              >
                Choose another file
              </button>
              <button
                type="button"
                className={primaryButton}
                disabled={!summary || review.errors.length > 0}
                onClick={() => void runImport()}
              >
                Create draft
              </button>
            </div>
          </div>
        ) : null}

        {step === "importing" ? (
          <div className="mt-4 space-y-4" data-testid="project-import-progress">
            <p className="text-base font-semibold" role="status" aria-live="polite">
              {failedImage ? `${failedImage.file} could not be uploaded.` : progress}
            </p>
            {isImporting ? <p className="text-sm text-black/60">Keep this window open. Nothing is published.</p> : null}
            {failedImage ? (
              <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                <p>{failedImage.message}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" className={primaryButton} onClick={() => failedImage.resolve("retry")}>
                    Retry
                  </button>
                  <button type="button" className={secondaryButton} onClick={() => failedImage.resolve("skip")}>
                    Skip this image
                  </button>
                </div>
              </div>
            ) : null}
            {canRetrySave && review?.parsed ? (
              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" className={secondaryButton} onClick={onClose}>
                  Close
                </button>
                <button type="button" className={primaryButton} onClick={() => void saveImportedDraft(review.parsed as ParsedProjectPackage)}>
                  Try again
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </StoneDialog>
  );
}

function IssueList({
  title,
  issues,
  tone,
  testId,
}: {
  title: string;
  issues: readonly PackageIssue[];
  tone: "error" | "warning";
  testId: string;
}) {
  const shown = issues.slice(0, 30);
  return (
    <div
      className={`border p-4 text-sm ${tone === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-300 bg-amber-50 text-amber-950"}`}
      data-testid={testId}
    >
      <h3 className="font-semibold">
        {title} ({issues.length})
      </h3>
      <ul className="mt-2 space-y-1">
        {shown.map((issue, index) => (
          <li key={`${issue.path}-${index}`}>
            <span className="font-mono text-xs">{issue.path}</span> — {issue.message}
          </li>
        ))}
      </ul>
      {issues.length > shown.length ? <p className="mt-2">and {issues.length - shown.length} more.</p> : null}
    </div>
  );
}
