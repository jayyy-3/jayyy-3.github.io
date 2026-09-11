import { useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Plus, Trash2 } from "lucide-react";
import type {
  ProjectAggregateMappingContext,
  ProjectFinishOption,
  ProjectMaterialDraft,
  ProjectStoneFinishCapabilityOption,
  ProjectStoneOption,
  ProjectStoneVariantOption,
} from "../../../../features/projects/projectAggregate";
import {
  ProjectMutationDisabledContext,
  fieldClass,
  secondaryButtonClass,
  textareaClass,
} from "./editorContext";

export function ProjectSection({
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

export function MaterialFields({
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

export function InlineConfirm({
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

export function TextField({
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

export function OptionField({
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

export function StoneLibraryMaterialPreview({
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

export function AddButton({
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

export function OrderControls({
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

export function RemoveButton({
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

export function EmptyCopy({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-28 place-items-center border border-dashed border-black/20 bg-[#f8f9f5] p-6 text-center text-sm font-semibold leading-6 text-black/48">
      {children}
    </div>
  );
}
