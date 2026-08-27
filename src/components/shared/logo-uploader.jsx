import { useMemo, useRef } from "react";
import { Camera, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MAX_LOGO_SIZE, SUPPORTED_LOGO_TYPES } from "@/constants/constraints";
import { formatFileSize, useFilePreviews } from "@/lib/file-handle";
import { cn, getInitials } from "@/lib/utils";

const DEFAULT_FORMATS_LABEL = "PNG, JPG, or WebP";

const formatMaxFileSize = (size) => formatFileSize(size).replace(".0 ", " ");

const LogoUploader = ({
  value,
  onChange,
  name = "",
  previewUrl = "",
  fallbackIcon,
  disabled = false,
  className,
  logoLabel = "Logo",
  formatsLabel = DEFAULT_FORMATS_LABEL,
  supportedTypes = SUPPORTED_LOGO_TYPES,
  maxSize = MAX_LOGO_SIZE,
  onRemove,
}) => {
  const inputRef = useRef(null);
  const selectedFiles = useMemo(() => (value ? [value] : []), [value]);
  const previews = useFilePreviews(selectedFiles);
  const FallbackIcon = fallbackIcon || ImageIcon;
  const activePreview = previews[0]?.url || previewUrl;
  const canRemove = Boolean(value || (previewUrl && onRemove));
  const maxSizeLabel = formatMaxFileSize(maxSize);

  const selectLogo = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!supportedTypes.includes(file.type)) {
      toast.error(`Choose a ${formatsLabel} image`);
      return;
    }

    if (file.size > maxSize) {
      toast.error(`${logoLabel} must be smaller than ${maxSizeLabel}`);
      return;
    }

    onChange(file);
  };

  const removeLogo = () => {
    onChange(null);
    onRemove?.();
  };

  return (
    <div className={cn("w-full shrink-0 sm:w-32", className)}>
      <div className="flex group relative mx-auto size-28 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-cyan-100 shadow-sm dark:to-cyan-950/40 sm:mx-0">
        {activePreview ? (
          <img
            src={activePreview}
            alt={`${name.trim() || logoLabel} preview`}
            className="h-full w-full object-cover"
          />
        ) : name.trim() ? (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
            {getInitials(name)}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary">
            <FallbackIcon className="size-8" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 disabled:pointer-events-none"
          aria-label={`Upload ${logoLabel.toLowerCase()}`}
        >
          <Camera className="size-6" />
        </button>

        {canRemove && (
          <Button
            type="button"
            size="icon-xs"
            variant="destructive"
            onClick={removeLogo}
            disabled={disabled}
            aria-label={`Discard selected ${logoLabel.toLowerCase()}`}
            className="absolute right-2 top-2"
          >
            <X />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={supportedTypes.join(",")}
        onChange={selectLogo}
        disabled={disabled}
        className="sr-only"
      />

      <div className="mt-2 text-center text-[10px] text-muted-foreground -ml-3.5">
        <p className="truncate">{value ? value.name : formatsLabel}</p>
        <p>{value ? formatFileSize(value.size) : `max ${maxSizeLabel}`}</p>
      </div>
    </div>
  );
};

export default LogoUploader;
