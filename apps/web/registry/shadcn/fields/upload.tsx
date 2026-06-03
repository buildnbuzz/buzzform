"use client";

import * as React from "react";
import type { UploadField as UploadFieldDef } from "@buildnbuzz/form-react";
import { useDataField } from "@buildnbuzz/form-react";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

// ---------------------------------------------------------------------------
// UI Options defined inside the registry component
// ---------------------------------------------------------------------------

export interface UploadUi {
  /** Visual variant. Defaults to `"dropzone"`. */
  variant?: "dropzone" | "avatar" | "inline" | "gallery";
  /** Shape preset for avatar / dropzone preview. Defaults to `"rounded"`. */
  shape?: "circle" | "square" | "rounded";
  /** Size preset. Defaults to `"md"`. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Accepted mime types, e.g. "image/*,application/pdf". */
  accept?: string;
  /** Overwrite standard placeholder / dropzone text. */
  dropzoneText?: string;
  /** className applied to `<FieldGroup>`. */
  className?: string;
  /** Inline width applied to `<FieldGroup>`. */
  width?: string | number;
  /** Controls required asterisk visibility. */
  asterisk?: boolean;
  /** Text and label overrides. */
  labels?: {
    /** Action trigger text (gallery: "Add file", inline: "Attach File"). */
    trigger?: React.ReactNode;
    /** Remove/delete action text. Defaults to "Remove". */
    remove?: React.ReactNode;
    /** Avatar hover overlay text. Defaults to "Edit". */
    edit?: React.ReactNode;
    /** Status when empty. Defaults to "No file selected". */
    empty?: React.ReactNode;
    /** Status with files selected. Receives count. */
    selected?: (count: number) => React.ReactNode;
    /** Format support hint. Receives accept string and formatted maxSize. */
    formatHint?: (accept?: string, maxSize?: string) => React.ReactNode;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  const isImage = ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(
    ext || "",
  );
  const isPdf = ext === "pdf";
  const isZip = ["zip", "rar", "tar", "gz", "7z"].includes(ext || "");

  if (isImage) {
    return (
      <IconPlaceholder
        lucide="FileImage"
        hugeicons="Image01Icon"
        tabler="IconPhoto"
        phosphor="Image"
        remixicon="RiImageLine"
        className="size-5 text-sky-500 shrink-0"
      />
    );
  }
  if (isPdf) {
    return (
      <IconPlaceholder
        lucide="FileText"
        hugeicons="File02Icon"
        tabler="IconFileText"
        phosphor="FilePdf"
        remixicon="RiFilePdfLine"
        className="size-5 text-rose-500 shrink-0"
      />
    );
  }
  if (isZip) {
    return (
      <IconPlaceholder
        lucide="FileArchive"
        hugeicons="ZipIcon"
        tabler="IconZip"
        phosphor="Archive"
        remixicon="RiFolderZipLine"
        className="size-5 text-amber-500 shrink-0"
      />
    );
  }
  return (
    <IconPlaceholder
      lucide="File"
      hugeicons="File01Icon"
      tabler="IconFile"
      phosphor="File"
      remixicon="RiFileLine"
      className="size-5 text-muted-foreground shrink-0"
    />
  );
}

export function UploadField() {
  const {
    fieldApi,
    field,
    isDisabled,
    isRequired,
    label,
    placeholder,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleChange,
  } = useDataField<UploadFieldDef>();

  const ui = field.ui as UploadUi | undefined;
  const hasMany = !!field.hasMany;
  const variant = ui?.variant || "dropzone";
  const shape = ui?.shape || "rounded";
  const size = ui?.size || "md";

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [previews, setPreviews] = React.useState<
    Array<{ name: string; size?: number; url?: string }>
  >([]);

  const rawValue = fieldApi.state.value;

  // Sync value from state to internal previews array
  React.useEffect(() => {
    if (!rawValue) {
      setPreviews([]);
      return;
    }

    const items = Array.isArray(rawValue) ? rawValue : [rawValue];
    const newPreviews = items.map((item) => {
      if (typeof window !== "undefined" && item instanceof window.File) {
        return {
          name: item.name,
          size: item.size,
          url: item.type.startsWith("image/")
            ? URL.createObjectURL(item)
            : undefined,
        };
      }
      if (typeof item === "string") {
        return {
          name: item.split("/").pop() || item,
          url: item,
        };
      }
      return { name: "Unknown File" };
    });

    setPreviews(newPreviews);

    // Cleanup object URLs on unmount/re-sync
    return () => {
      newPreviews.forEach((p) => {
        if (p.url && p.url.startsWith("blob:")) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, [rawValue]);

  const onFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);

    if (hasMany) {
      const currentFiles = Array.isArray(rawValue)
        ? rawValue
        : rawValue
          ? [rawValue]
          : [];
      handleChange([...currentFiles, ...newFiles]);
    } else {
      handleChange(newFiles[0]);
    }
  };

  const removeFile = (index: number) => {
    if (isDisabled) return;
    if (hasMany && Array.isArray(rawValue)) {
      const updated = rawValue.filter((_, i) => i !== index);
      handleChange(updated.length > 0 ? updated : []);
    } else {
      handleChange(null as unknown as File | File[] | string | string[]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (isDisabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const triggerSelect = () => {
    if (isDisabled) return;
    fileInputRef.current?.click();
  };

  const width = ui?.width;
  const widthStyle = width
    ? {
        width: typeof width === "number" ? `${width}px` : width,
        flex: "0 1 auto",
      }
    : undefined;

  // Inline styling calculations
  const dropzoneText =
    ui?.dropzoneText ||
    placeholder ||
    (hasMany
      ? "Drop files here or click to upload"
      : "Drop file here or click to upload");

  return (
    <FieldGroup
      data-field={fieldApi.name}
      className={ui?.className}
      style={widthStyle}
    >
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired && ui?.asterisk !== false ? (
              <span className="text-destructive">*</span>
            ) : null}
          </FieldLabel>
        )}

        <FieldContent>
          <div className="relative w-full group/upload">
            <input
              ref={fileInputRef}
              type="file"
              id={fieldApi.name}
              name={fieldApi.name}
              multiple={hasMany}
              accept={ui?.accept}
              disabled={isDisabled}
              onChange={(e) => onFilesSelected(e.target.files)}
              className="hidden"
              aria-describedby={ariaDescribedBy}
              aria-invalid={isInvalid}
            />

            {/* VARIANT: AVATAR */}
            {variant === "avatar" && (
              <div className="flex flex-col items-center justify-center gap-3">
                <div
                  onClick={triggerSelect}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "relative overflow-hidden cursor-pointer border-2 border-dashed flex items-center justify-center transition-all bg-muted/40 hover:bg-muted/70",
                    shape === "circle"
                      ? "rounded-full"
                      : shape === "square"
                        ? "rounded-none"
                        : "rounded-xl",
                    size === "xs" && "size-14",
                    size === "sm" && "size-20",
                    size === "md" && "size-28",
                    size === "lg" && "size-36",
                    size === "xl" && "size-48",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-muted-foreground/50",
                    isDisabled &&
                      "opacity-60 cursor-not-allowed pointer-events-none",
                  )}
                >
                  {previews[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previews[0].url}
                      alt="Avatar"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-center p-2">
                      <IconPlaceholder
                        lucide="User"
                        hugeicons="UserIcon"
                        tabler="IconUser"
                        phosphor="User"
                        remixicon="RiUserLine"
                        className={cn(
                          size === "xs" && "size-5",
                          size === "sm" && "size-6",
                          size === "md" && "size-8",
                          size === "lg" && "size-10",
                          size === "xl" && "size-14",
                        )}
                      />
                    </div>
                  )}

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                    <IconPlaceholder
                      lucide="Camera"
                      hugeicons="Camera01Icon"
                      tabler="IconCamera"
                      phosphor="Camera"
                      remixicon="RiCameraLine"
                      className="size-4 mr-1"
                    />
                    {ui?.labels?.edit ?? "Edit"}
                  </div>
                </div>

                {previews.length > 0 && !isDisabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => removeFile(0)}
                    className="text-muted-foreground hover:text-destructive h-7 px-2"
                  >
                    {ui?.labels?.remove ?? "Remove"}
                  </Button>
                )}
              </div>
            )}

            {/* VARIANT: DROPZONE (DEFAULT) */}
            {variant === "dropzone" && (
              <div className="space-y-3">
                <div
                  onClick={triggerSelect}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer bg-muted/20 hover:bg-muted/40",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-muted-foreground/50",
                    isDisabled &&
                      "opacity-60 cursor-not-allowed pointer-events-none",
                  )}
                >
                  <div className="size-10 rounded-lg bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                    <IconPlaceholder
                      lucide="Upload"
                      hugeicons="Upload04Icon"
                      tabler="IconUpload"
                      phosphor="UploadSimple"
                      remixicon="RiUploadLine"
                      className="size-5"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{dropzoneText}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ui?.labels?.formatHint
                        ? ui.labels.formatHint(
                            ui.accept,
                            field.maxSize ? formatBytes(field.maxSize) : undefined,
                          )
                        : (
                            <>
                              {ui?.accept
                                ? `Supports: ${ui.accept}`
                                : "All formats supported"}
                              {field.maxSize
                                ? ` up to ${formatBytes(field.maxSize)}`
                                : ""}
                            </>
                          )}
                    </p>
                  </div>
                </div>

                {/* Render Selected Files List */}
                {previews.length > 0 && (
                  <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-background">
                    {previews.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 text-sm"
                      >
                        <FileTypeIcon name={file.name} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          {file.size && (
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(file.size)}
                            </p>
                          )}
                        </div>
                        {!isDisabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(idx)}
                            className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <IconPlaceholder
                              lucide="Trash2"
                              hugeicons="Delete02Icon"
                              tabler="IconTrash"
                              phosphor="Trash"
                              remixicon="RiDeleteBinLine"
                              className="size-4"
                            />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VARIANT: INLINE */}
            {variant === "inline" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isDisabled}
                    onClick={triggerSelect}
                    className="gap-2 shrink-0 border-dashed"
                  >
                    <IconPlaceholder
                      lucide="Upload"
                      hugeicons="Upload04Icon"
                      tabler="IconUpload"
                      phosphor="UploadSimple"
                      remixicon="RiUploadLine"
                      className="size-4"
                    />
                    {ui?.labels?.trigger ?? "Attach File"}
                  </Button>
                  <span className="text-xs text-muted-foreground truncate">
                    {previews.length === 0
                      ? (ui?.labels?.empty ?? "No file selected")
                      : (ui?.labels?.selected?.(previews.length) ??
                        `${previews.length} file(s) attached`)}
                  </span>
                </div>

                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {previews.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-muted/50 border border-border rounded-full pl-3 pr-1.5 py-1 text-xs font-medium"
                      >
                        <FileTypeIcon name={file.name} />
                        <span className="truncate max-w-30">{file.name}</span>
                        {!isDisabled && (
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="size-5 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <IconPlaceholder
                              lucide="X"
                              hugeicons="Cancel01Icon"
                              tabler="IconX"
                              phosphor="X"
                              remixicon="RiCloseLine"
                              className="size-3.5"
                            />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VARIANT: GALLERY */}
            {variant === "gallery" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previews.map((file, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "relative group/gallery aspect-square border border-border flex items-center justify-center overflow-hidden bg-muted/10",
                      shape === "circle"
                        ? "rounded-full"
                        : shape === "square"
                          ? "rounded-none"
                          : "rounded-xl",
                    )}
                  >
                    {file.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.url}
                        alt={file.name}
                        className="size-full object-cover transition-transform group-hover/gallery:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-3 text-center">
                        <FileTypeIcon name={file.name} />
                        <span className="text-[10px] mt-1 truncate max-w-20">
                          {file.name}
                        </span>
                      </div>
                    )}

                    {/* Delete overlay */}
                    {!isDisabled && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFile(idx)}
                          className="size-8"
                        >
                          <IconPlaceholder
                            lucide="Trash2"
                            hugeicons="Delete02Icon"
                            tabler="IconTrash"
                            phosphor="Trash"
                            remixicon="RiDeleteBinLine"
                            className="size-4"
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Box */}
                {(!hasMany && previews.length === 0) ||
                (hasMany && (!field.max || previews.length < field.max)) ? (
                  <div
                    onClick={triggerSelect}
                    className={cn(
                      "aspect-square border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/10 hover:bg-muted/30",
                      shape === "circle"
                        ? "rounded-full"
                        : shape === "square"
                          ? "rounded-none"
                          : "rounded-xl",
                      isDisabled &&
                        "opacity-60 cursor-not-allowed pointer-events-none",
                    )}
                  >
                    <IconPlaceholder
                      lucide="Plus"
                      hugeicons="PlusSignIcon"
                      tabler="IconPlus"
                      phosphor="Plus"
                      remixicon="RiAddLine"
                      className="size-5 text-muted-foreground"
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {ui?.labels?.trigger ?? "Add file"}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}
