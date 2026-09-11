import { useState } from "react";
import {
  countHotspotsForMaterial,
  type ProjectAggregateDraft,
  type ProjectAggregateMappingContext,
  type ProjectFinishOption,
  type ProjectMoveDirection,
  type ProjectOrderedCollection,
  type ProjectStoneFinishCapabilityOption,
  type ProjectStoneOption,
  type ProjectStoneVariantOption,
} from "../../../../features/projects/projectAggregate";
import {
  AddButton,
  EmptyCopy,
  InlineConfirm,
  MaterialFields,
  OrderControls,
  ProjectSection,
  RemoveButton,
} from "./EditorControls";
import type { UpdateProjectCollection } from "./editorContext";

interface MaterialsSectionProps {
  draft: ProjectAggregateDraft;
  context: ProjectAggregateMappingContext;
  stones: readonly ProjectStoneOption[];
  stoneVariants: readonly ProjectStoneVariantOption[];
  finishes: readonly ProjectFinishOption[];
  finishCapabilities: readonly ProjectStoneFinishCapabilityOption[];
  open: boolean;
  onToggle: () => void;
  onChange: (draft: ProjectAggregateDraft) => void;
  onAddMaterial: () => void;
  moveItem: (
    collection: ProjectOrderedCollection,
    key: string,
    direction: ProjectMoveDirection,
  ) => void;
  updateCollection: UpdateProjectCollection;
}

/** Material schedule: every stone and finish used, with how many image points use it. */
export default function MaterialsSection({
  draft,
  context,
  stones,
  stoneVariants,
  finishes,
  finishCapabilities,
  open,
  onToggle,
  onChange,
  onAddMaterial,
  moveItem,
  updateCollection,
}: MaterialsSectionProps) {
  const [pendingRemoval, setPendingRemoval] = useState<
    { key: string; count: number } | null
  >(null);

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
    else setPendingRemoval({ key, count });
  }

  return (
    <ProjectSection
      id="project-materials"
      title="Material schedule"
      summary="Every stone and finish used in the project, and where it appears."
      action={<AddButton label="Add material" onClick={onAddMaterial} />}
      open={open}
      onToggle={onToggle}
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
                {pendingRemoval?.key === material.key ? (
                  <InlineConfirm
                    message={`${pendingRemoval.count} ${pendingRemoval.count === 1 ? "point" : "points"} will lose their material. You can reconnect them on the image.`}
                    confirmLabel="Remove material"
                    keepLabel="Keep material"
                    onConfirm={() => removeMaterialNow(material.key)}
                    onKeep={() => setPendingRemoval(null)}
                  />
                ) : null}
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
  );
}
