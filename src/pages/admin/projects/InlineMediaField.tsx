import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { FileUp, Image as ImageIcon, Search, X } from "lucide-react";
import type { ProjectMediaOption } from "../../../features/projects/projectAggregate";
import { recordAdminAuditEvent } from "../../../lib/adminAudit";
import { supabase } from "../../../lib/supabaseClient";

const privateMediaBucket = "urblo-admin-media";
const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
export const maximumProjectImageBytes = 10 * 1024 * 1024;

interface InlineMediaFieldProps {
  label: string;
  description?: string;
  value: number | null;
  assets: readonly ProjectMediaOption[];
  userId: string | null;
  canCleanUpStorage?: boolean;
  disabled?: boolean;
  instanceKey: string;
  onPendingChange?: (instanceKey: string, pending: boolean) => void;
  onBusyChange?: (instanceKey: string, busy: boolean) => void;
  onChange: (mediaAssetId: number | null) => void;
  onAssetCreated: (asset: ProjectMediaOption) => void;
}

interface UploadedMediaRow {
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

export default function InlineMediaField({
  label,
  description,
  value,
  assets,
  userId,
  canCleanUpStorage = false,
  disabled = false,
  instanceKey,
  onPendingChange,
  onBusyChange,
  onChange,
  onAssetCreated,
}: InlineMediaFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);
  const onAssetCreatedRef = useRef(onAssetCreated);
  onChangeRef.current = onChange;
  onAssetCreatedRef.current = onAssetCreated;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingAlt, setPendingAlt] = useState("");
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [selectedAltDraft, setSelectedAltDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === value) ?? null,
    [assets, value],
  );
  const hasPendingDescription = Boolean(
    selectedAsset &&
    selectedAsset.status !== "published" &&
    selectedAltDraft.trim() !== (selectedAsset.alt ?? "").trim(),
  );
  const hasPendingWork = Boolean(
    pendingFile ||
    isUploading ||
    isUpdatingDescription ||
    hasPendingDescription,
  );
  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assets
      .filter(
        (asset) => asset.mediaType === "image" && asset.status !== "archived",
      )
      .filter((asset) => {
        if (!query) return true;
        return [asset.alt, asset.caption, asset.objectPath]
          .filter(Boolean)
          .some((item) => String(item).toLowerCase().includes(query));
      })
      .slice(0, 24);
  }, [assets, search]);

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingFile]);

  useEffect(() => {
    setSelectedAltDraft(selectedAsset?.alt ?? "");
  }, [selectedAsset?.alt, selectedAsset?.id]);

  useEffect(() => {
    onPendingChange?.(instanceKey, hasPendingWork);
    return () => onPendingChange?.(instanceKey, false);
  }, [hasPendingWork, instanceKey, onPendingChange]);

  useEffect(() => {
    const busy = isUploading || isUpdatingDescription;
    onBusyChange?.(instanceKey, busy);
    return () => onBusyChange?.(instanceKey, false);
  }, [instanceKey, isUpdatingDescription, isUploading, onBusyChange]);

  function chooseFile(file: File | null) {
    setError(null);
    setWarning(null);
    if (!file) return;
    setPendingFile(null);
    setPendingAlt("");
    if (!allowedImageTypes.has(file.type)) {
      setError("Choose a JPG, PNG, WebP, AVIF or GIF image.");
      return;
    }
    if (file.size > maximumProjectImageBytes) {
      setError("Project images must be 10 MB or smaller.");
      return;
    }
    setPendingFile(file);
    setPendingAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    setIsPickerOpen(true);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading || isUpdatingDescription) return;
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function uploadPendingFile() {
    if (!supabase || !userId || !pendingFile || disabled || isUploading) return;
    const alt = pendingAlt.trim();
    if (!alt) {
      setError("Describe what is visible in the image before uploading.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setWarning(null);
    try {
      const objectPath = buildObjectPath(pendingFile);
      const dimensions = await readImageDimensions(pendingFile);
      const upload = await supabase.storage
        .from(privateMediaBucket)
        .upload(objectPath, pendingFile, {
          cacheControl: "31536000",
          upsert: false,
          contentType: pendingFile.type,
        });

      if (upload.error) {
        console.error("Inline project media upload failed.", upload.error);
        setError(
          "The image could not be uploaded. Check your connection and try again.",
        );
        return;
      }

      const metadata = await supabase
        .from("media_assets")
        .insert({
          status: "draft",
          bucket: privateMediaBucket,
          object_path: objectPath,
          source_url: null,
          source_kind: "storage",
          media_type: "image",
          mime_type: pendingFile.type,
          width_px: dimensions?.width ?? null,
          height_px: dimensions?.height ?? null,
          size_bytes: pendingFile.size,
          alt,
          caption: null,
          credit: null,
          usage_notes: null,
          created_by: userId,
          updated_by: userId,
        })
        .select(
          "id,bucket,alt,caption,object_path,source_url,source_kind,media_type,status",
        )
        .single<UploadedMediaRow>();

      let uploadedRow = metadata.data;
      let metadataConfirmedByReadback = false;
      if (metadata.error || !uploadedRow) {
        if (metadata.error)
          console.error(
            "Inline project media metadata insert failed.",
            metadata.error,
          );
        const readback = await supabase
          .from("media_assets")
          .select(
            "id,bucket,alt,caption,object_path,source_url,source_kind,media_type,status",
          )
          .eq("bucket", privateMediaBucket)
          .eq("object_path", objectPath)
          .maybeSingle<UploadedMediaRow>();
        uploadedRow = readback.data;

        if (!uploadedRow) {
          if (readback.error) {
            console.error(
              "Inline project media metadata readback failed.",
              readback.error,
            );
            setError(
              "The image upload finished, but its library record could not be confirmed. Ask an administrator to inspect it before trying again.",
            );
            return;
          }
          if (!canCleanUpStorage) {
            setError(
              "The image record could not be completed. Ask an administrator to clean up the private upload before trying again.",
            );
            return;
          }
          const cleanup = await supabase.storage
            .from(privateMediaBucket)
            .remove([objectPath]);
          if (cleanup.error)
            console.error(
              "Inline project media cleanup failed.",
              cleanup.error,
            );
          setError(
            cleanup.error
              ? "The image record could not be completed and cleanup needs administrator attention."
              : "The image record could not be completed. The upload was cleaned up; try again.",
          );
          return;
        }
        metadataConfirmedByReadback = true;
      }

      const signedPreview = await supabase.storage
        .from(privateMediaBucket)
        .createSignedUrl(objectPath, 3600);
      const asset: ProjectMediaOption = {
        id: uploadedRow.id,
        bucket: uploadedRow.bucket,
        alt: uploadedRow.alt,
        caption: uploadedRow.caption,
        objectPath: uploadedRow.object_path,
        sourceUrl: uploadedRow.source_url,
        sourceKind: uploadedRow.source_kind,
        mediaType: uploadedRow.media_type,
        status: uploadedRow.status,
        previewUrl: signedPreview.data?.signedUrl ?? null,
      };

      onAssetCreatedRef.current(asset);
      onChangeRef.current(asset.id);
      setPendingFile(null);
      setPendingAlt("");
      setIsPickerOpen(false);
      if (signedPreview.error || !signedPreview.data?.signedUrl) {
        setWarning(
          "The image was uploaded and selected, but its preview needs a page reload.",
        );
      }

      try {
        const auditError = await recordAdminAuditEvent(supabase, {
          actorUserId: userId,
          action: "media_asset.upload",
          entityType: "media_assets",
          entityId: asset.id,
          metadata: {
            source: "project_inline",
            storagePosture: "private-first",
            metadataConfirmedByReadback,
            bucket: uploadedRow.bucket,
            objectPath: uploadedRow.object_path,
            mediaType: uploadedRow.media_type,
          },
        });
        if (auditError) {
          console.error(
            "Inline project media upload audit failed.",
            auditError,
          );
          setWarning(
            "The image was uploaded and selected, but Change history could not be updated. Ask a Website owner or CMS manager to review it.",
          );
        }
      } catch (auditError) {
        console.error("Inline project media upload audit failed.", auditError);
        setWarning(
          "The image was uploaded and selected, but Change history could not be updated. Ask a Website owner or CMS manager to review it.",
        );
      }
    } catch (uploadError) {
      console.error("Inline project media upload failed.", uploadError);
      setError(
        "The image could not be uploaded. Check your connection and try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function saveSelectedDescription() {
    if (
      !supabase ||
      !userId ||
      !selectedAsset ||
      selectedAsset.status === "published" ||
      disabled ||
      isUpdatingDescription
    )
      return;
    const alt = selectedAltDraft.trim();
    if (!alt) {
      setError("Describe what is visible in the image.");
      return;
    }
    setIsUpdatingDescription(true);
    setError(null);
    setWarning(null);
    try {
      const updated = await supabase
        .from("media_assets")
        .update({ alt, updated_by: userId })
        .eq("id", selectedAsset.id)
        .select(
          "id,bucket,alt,caption,object_path,source_url,source_kind,media_type,status",
        )
        .single<UploadedMediaRow>();

      if (updated.error || !updated.data) {
        if (updated.error)
          console.error(
            "Inline project media description update failed.",
            updated.error,
          );
        setError("The image description could not be saved. Try again.");
        return;
      }
      onAssetCreatedRef.current({
        ...selectedAsset,
        alt: updated.data.alt,
        caption: updated.data.caption,
        status: updated.data.status,
      });

      try {
        const auditError = await recordAdminAuditEvent(supabase, {
          actorUserId: userId,
          action: "media_asset.update",
          entityType: "media_assets",
          entityId: selectedAsset.id,
          metadata: {
            source: "project_inline",
            field: "alt",
          },
        });
        if (auditError) {
          console.error(
            "Inline project media description audit failed.",
            auditError,
          );
          setWarning(
            "The image description was saved, but Change history could not be updated. Ask a Website owner or CMS manager to review it.",
          );
        }
      } catch (auditError) {
        console.error(
          "Inline project media description audit failed.",
          auditError,
        );
        setWarning(
          "The image description was saved, but Change history could not be updated. Ask a Website owner or CMS manager to review it.",
        );
      }
    } catch (descriptionError) {
      console.error(
        "Inline project media description update failed.",
        descriptionError,
      );
      setError("The image description could not be saved. Try again.");
    } finally {
      setIsUpdatingDescription(false);
    }
  }

  return (
    <div
      className="border border-black/10 bg-[#f8f9f5] p-4"
      data-testid="project-inline-media-field"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-black/48">
            {label}
          </p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-black/52">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setIsPickerOpen((current) => !current)}
          disabled={disabled || isUploading || isUpdatingDescription}
          className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
        >
          <Search className="h-4 w-4" />
          {selectedAsset ? "Replace image" : "Choose image"}
        </button>
      </div>

      {selectedAsset ? (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center">
            <MediaThumb asset={selectedAsset} className="h-24 w-28" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-black">
                {selectedAsset.alt || "Image selected"}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/50">
                {selectedAsset.caption || "Ready in this project draft."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-black/15 bg-white text-black transition hover:bg-black hover:text-white disabled:text-black/30"
              aria-label={`Remove ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {selectedAsset.status !== "published" ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                Image description
                <input
                  disabled={disabled || isUploading || isUpdatingDescription}
                  value={selectedAltDraft}
                  onChange={(event) => setSelectedAltDraft(event.target.value)}
                  className="mt-2 min-h-10 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </label>
              <button
                type="button"
                onClick={() => void saveSelectedDescription()}
                disabled={
                  disabled ||
                  isUpdatingDescription ||
                  !selectedAltDraft.trim() ||
                  selectedAltDraft.trim() === (selectedAsset.alt ?? "").trim()
                }
                className="min-h-10 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/30"
              >
                {isUpdatingDescription ? "Saving…" : "Save description"}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex min-h-24 items-center justify-center border border-dashed border-black/15 bg-white text-sm font-semibold text-black/45">
          No image selected
        </div>
      )}

      {isPickerOpen ? (
        <div className="mt-4 border-t border-black/10 pt-4">
          <label className="relative block">
            <span className="sr-only">Search the image library</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <input
              type="search"
              disabled={disabled || isUploading || isUpdatingDescription}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search images by description"
              className="min-h-11 w-full rounded border border-black/15 bg-white pl-10 pr-3 text-sm font-medium outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </label>

          <div
            className="mt-3 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            data-testid="project-media-thumbnail-grid"
          >
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                disabled={disabled || isUploading || isUpdatingDescription}
                onClick={() => {
                  onChange(asset.id);
                  setIsPickerOpen(false);
                }}
                className={[
                  "overflow-hidden border bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-black",
                  value === asset.id
                    ? "border-black ring-1 ring-black"
                    : "border-black/10 hover:border-black/40",
                ].join(" ")}
              >
                <MediaThumb asset={asset} className="aspect-[4/3] w-full" />
                <span className="line-clamp-2 block min-h-12 px-2 py-2 text-[11px] font-semibold leading-4 text-black/64">
                  {asset.alt || "Image"}
                </span>
              </button>
            ))}
            {!filteredAssets.length ? (
              <p className="col-span-full py-6 text-center text-sm text-black/48">
                No matching images.
              </p>
            ) : null}
          </div>

          <div
            onDragEnter={(event) => {
              event.preventDefault();
              if (!disabled && !isUploading && !isUpdatingDescription)
                setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (event.currentTarget === event.target) setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={[
              "mt-4 border border-dashed p-4 transition",
              isDragging
                ? "border-black bg-[rgba(0,255,25,0.12)]"
                : "border-black/20 bg-white",
            ].join(" ")}
            data-testid="project-inline-media-dropzone"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded bg-black text-white">
                  <FileUp className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-black">
                    Drop a new image here
                  </p>
                  <p className="mt-1 text-xs text-black/48">
                    Or choose a file from your computer.
                  </p>
                  <p className="mt-2 max-w-xl text-xs font-medium leading-5 text-black/62">
                    Your original is kept at full quality. High-quality website versions are prepared automatically for each screen.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading || isUpdatingDescription}
                className="min-h-9 rounded bg-black px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:bg-black/25"
              >
                Choose file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                disabled={disabled || isUploading || isUpdatingDescription}
                onChange={handleFileChange}
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            {pendingFile ? (
              <div className="mt-4 grid gap-4 border-t border-black/10 pt-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                {pendingPreviewUrl ? (
                  <img
                    className="h-24 w-28 object-cover"
                    src={pendingPreviewUrl}
                    alt="Upload preview"
                  />
                ) : null}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.12em] text-black/48">
                    Image description
                    <input
                      disabled={disabled || isUploading}
                      value={pendingAlt}
                      onChange={(event) => setPendingAlt(event.target.value)}
                      placeholder="Describe what is visible"
                      className="mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium normal-case tracking-normal outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void uploadPendingFile()}
                      disabled={
                        disabled ||
                        !pendingAlt.trim() ||
                        isUploading ||
                        isUpdatingDescription
                      }
                      className="min-h-10 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white disabled:bg-black/15 disabled:text-black/35"
                    >
                      {isUploading ? "Keeping original…" : "Upload original"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingFile(null);
                        setPendingAlt("");
                      }}
                      disabled={isUploading}
                      className="min-h-10 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {error ? (
        <p
          className="mt-3 text-sm font-semibold leading-5 text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {warning ? (
        <p
          className="mt-3 border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold leading-5 text-amber-950"
          role="status"
        >
          {warning}
        </p>
      ) : null}
    </div>
  );
}

function MediaThumb({
  asset,
  className,
}: {
  asset: ProjectMediaOption;
  className: string;
}) {
  const source = asset.previewUrl || asset.sourceUrl;
  if (!source) {
    return (
      <span
        className={`${className} grid place-items-center bg-black/[0.05] text-black/30`}
      >
        <ImageIcon className="h-5 w-5" />
      </span>
    );
  }
  return (
    <img
      className={`${className} block object-cover`}
      src={source}
      alt={asset.alt || ""}
      loading="lazy"
    />
  );
}

function buildObjectPath(file: File) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "bin";
  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "project-image";
  const unique =
    globalThis.crypto?.randomUUID?.().slice(0, 12) ?? `${Date.now()}`;
  return `project-editor/${Date.now()}-${unique}-${base}.${extension}`;
}

async function readImageDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<{ width: number; height: number } | null>(
      (resolve) => {
        const image = new Image();
        image.onload = () =>
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => resolve(null);
        image.src = objectUrl;
      },
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
