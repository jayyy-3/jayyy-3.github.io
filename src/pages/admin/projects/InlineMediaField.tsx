import type { ProjectMediaOption } from "../../../features/projects/projectAggregate";
import AdminMediaPicker from "../media/AdminMediaPicker";

// Projects use the shared admin media picker with the page's already-loaded image list. Uploads
// keep the original file (the public site prepares screen sizes from it) and land as private
// Drafts; the protected Projects endpoint copies referenced images to the public library when
// the project is published.
// The "original" policy limit (pickerOriginalMaximumBytes in ../media/mediaPickerFiles).
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
  return (
    <AdminMediaPicker
      label={label}
      description={description}
      value={value}
      assets={assets}
      userId={userId}
      canCleanUpStorage={canCleanUpStorage}
      disabled={disabled}
      instanceKey={instanceKey}
      onPendingChange={onPendingChange}
      onBusyChange={onBusyChange}
      onChange={(mediaAssetId) => onChange(mediaAssetId)}
      onAssetCreated={onAssetCreated}
      uploadPolicy="original"
      auditSource="project_inline"
      objectPathPrefix="project-editor"
      selectedNote={(asset) => asset.caption || "Ready in this project draft."}
      testIdPrefix="project-inline-media"
    />
  );
}
