import { useRef } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { MapPin, MousePointer2, Plus } from "lucide-react";
import type { ProjectHotspotDraft } from "../../../features/projects/projectAggregate";

interface VisualHotspotEditorProps {
  imageUrl: string;
  imageAlt: string;
  hotspots: readonly ProjectHotspotDraft[];
  selectedKey: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  selectionDisabled?: boolean;
  onAdd: (position: { xPercent: number; yPercent: number }) => void;
  onSelect: (key: string) => void;
  onMove: (
    key: string,
    position: { xPercent: number; yPercent: number },
  ) => void;
}

export default function VisualHotspotEditor({
  imageUrl,
  imageAlt,
  hotspots,
  selectedKey,
  disabled = false,
  readOnly = false,
  selectionDisabled = false,
  onAdd,
  onSelect,
  onMove,
}: VisualHotspotEditorProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const draggingKeyRef = useRef<string | null>(null);

  function positionFromPointer(event: ReactPointerEvent<HTMLElement>) {
    const frame = frameRef.current;
    if (!frame) return null;
    const bounds = frame.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return {
      xPercent: clamp(((event.clientX - bounds.left) / bounds.width) * 100),
      yPercent: clamp(((event.clientY - bounds.top) / bounds.height) * 100),
    };
  }

  function handleFramePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || readOnly || event.target !== event.currentTarget) return;
    const position = positionFromPointer(event);
    if (position) onAdd(position);
  }

  function handleMarkerPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    key: string,
  ) {
    if (disabled || selectionDisabled) return;
    event.stopPropagation();
    onSelect(key);
    if (readOnly) return;
    draggingKeyRef.current = key;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleMarkerPointerMove(
    event: ReactPointerEvent<HTMLButtonElement>,
    key: string,
  ) {
    if (disabled || readOnly || draggingKeyRef.current !== key) return;
    const position = positionFromPointer(event);
    if (position) onMove(key, position);
  }

  function stopDragging(event: ReactPointerEvent<HTMLButtonElement>) {
    draggingKeyRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleMarkerKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    hotspot: ProjectHotspotDraft,
  ) {
    if (disabled || readOnly || selectionDisabled) return;
    const movement = event.shiftKey ? 5 : 1;
    let nextX = hotspot.xPercent;
    let nextY = hotspot.yPercent;

    if (event.key === "ArrowLeft") nextX -= movement;
    else if (event.key === "ArrowRight") nextX += movement;
    else if (event.key === "ArrowUp") nextY -= movement;
    else if (event.key === "ArrowDown") nextY += movement;
    else return;

    event.preventDefault();
    onMove(hotspot.key, { xPercent: clamp(nextX), yPercent: clamp(nextY) });
  }

  if (!imageUrl) {
    return (
      <div className="grid min-h-64 place-items-center border border-dashed border-black/20 bg-black/[0.025] p-8 text-center">
        <div>
          <MapPin className="mx-auto h-6 w-6 text-black/35" />
          <p className="mt-3 text-sm font-semibold text-black/60">
            Choose the image first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={frameRef}
        className={[
          "relative isolate overflow-hidden border border-black/12 bg-black/[0.03] touch-none",
          disabled || readOnly ? "cursor-default" : "cursor-crosshair",
        ].join(" ")}
        onPointerDown={handleFramePointerDown}
        data-testid="project-hotspot-canvas"
      >
        <img
          className="pointer-events-none block h-auto w-full select-none"
          src={imageUrl}
          alt={imageAlt}
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        {hotspots.map((hotspot, index) => (
          <button
            key={hotspot.key}
            type="button"
            aria-label={`Point ${index + 1}${hotspot.label ? `: ${hotspot.label}` : ""}`}
            aria-pressed={selectedKey === hotspot.key}
            onPointerDown={(event) =>
              handleMarkerPointerDown(event, hotspot.key)
            }
            onPointerMove={(event) =>
              handleMarkerPointerMove(event, hotspot.key)
            }
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onKeyDown={(event) => handleMarkerKeyDown(event, hotspot)}
            onClick={() => onSelect(hotspot.key)}
            disabled={disabled || selectionDisabled}
            // Public point spec (docs/DESIGN.md, Project point marker) plus the editor modifier:
            // no halo, a lime ring on the selected point and a small number beside the dot that
            // matches the "Point N" tabs.
            className={[
              "urblo-hotspot-marker urblo-hotspot-marker--editor absolute -translate-x-1/2 -translate-y-1/2",
              selectedKey === hotspot.key ? "z-20" : "z-10",
            ].join(" ")}
            data-draggable={disabled || readOnly ? undefined : "true"}
            style={{
              left: `${hotspot.xPercent}%`,
              top: `${hotspot.yPercent}%`,
            }}
            data-testid="project-hotspot-marker"
          >
            <span className="urblo-hotspot-marker__dot" aria-hidden="true" />
            <span
              className={[
                "urblo-hotspot-marker__label",
                hotspot.xPercent > 90 ? "urblo-hotspot-marker__label--start" : "",
              ].join(" ")}
              aria-hidden="true"
            >
              {index + 1}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs font-semibold leading-5 text-black/52">
          <MousePointer2 className="h-4 w-4 shrink-0" />
          {readOnly
            ? "Select a point to inspect its details."
            : "Click the image to add a point. Drag a point to place it precisely."}
        </p>
        <button
          type="button"
          onClick={() => onAdd({ xPercent: 50, yPercent: 50 })}
          disabled={disabled || readOnly}
          className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.11em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/30"
        >
          <Plus className="h-4 w-4" />
          Add point at centre
        </button>
      </div>
    </div>
  );
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value * 100) / 100));
}
