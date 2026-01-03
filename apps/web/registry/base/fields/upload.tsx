"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type {
  UploadField as UploadFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { generateFieldId } from "@buildnbuzz/buzzform";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { IconPlaceholder } from "@/components/icon-placeholder";
import Image from "next/image";

type FileValue = File | string | null;
type FileArrayValue = (File | string)[];

function isImage(file: File | string): boolean {
  if (typeof file === "string") {
    return /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)$/i.test(file);
  }
  return file.type.startsWith("image/");
}

function getPreviewUrl(file: File | string): string | null {
  if (typeof file === "string") return file;
  if (file.type.startsWith("image/")) return URL.createObjectURL(file);
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileName(file: File | string): string {
  if (typeof file === "string") {
    const parts = file.split("/");
    return parts[parts.length - 1] || "file";
  }
  return file.name;
}

type SizeKey = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<
  SizeKey,
  { width: number; height: number; className: string }
> = {
  xs: { width: 64, height: 64, className: "size-16" },
  sm: { width: 80, height: 80, className: "size-20" },
  md: { width: 96, height: 96, className: "size-24" },
  lg: { width: 128, height: 128, className: "size-32" },
  xl: { width: 160, height: 160, className: "size-40" },
};

const DZ_SIZE_MAP: Record<
  SizeKey,
  { minHeight: string; padding: string; iconSize: string }
> = {
  xs: { minHeight: "min-h-24", padding: "py-4", iconSize: "size-4" },
  sm: { minHeight: "min-h-32", padding: "py-6", iconSize: "size-5" },
  md: { minHeight: "min-h-40", padding: "py-8", iconSize: "size-6" },
  lg: { minHeight: "min-h-56", padding: "py-12", iconSize: "size-8" },
  xl: { minHeight: "min-h-72", padding: "py-16", iconSize: "size-10" },
};

function CircularProgress({
  progress,
  size = 40,
}: {
  progress: number;
  size?: number;
}) {
  const radius = size * 0.4;
  const circum = 2 * Math.PI * radius;
  const offset = circum - (progress / 100) * circum;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circum}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

function DropzoneVariant({
  field,
  value,
  progress,
  onChange,
  disabled,
  inputRef,
}: {
  field: UploadFieldType;
  value: FileValue;
  progress?: number;
  onChange: (value: FileValue) => void;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const previewUrl = useMemo(() => {
    if (!value) return null;
    return getPreviewUrl(value);
  }, [value]);

  useEffect(() => {
    const url = previewUrl;
    return () => {
      if (
        typeof url === "string" &&
        url.startsWith("blob:") &&
        value instanceof File
      ) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrl, value]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onChange(file);
    },
    [disabled, onChange]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  const sizeConfig = (field.ui?.size as SizeKey) || "md";
  const dzSize = DZ_SIZE_MAP[sizeConfig] || DZ_SIZE_MAP.md;
  const isImageValue = value ? isImage(value) : false;
  const shape = field.ui?.shape || "rounded";
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
        ? "rounded-xl"
        : "rounded-lg";

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={!disabled ? handleDragOver : undefined}
      onDragLeave={!disabled ? handleDragLeave : undefined}
      onDrop={!disabled ? handleDrop : undefined}
      className={cn(
        "relative group flex flex-col items-center justify-center w-full border-2 border-dashed transition-all cursor-pointer text-center",
        shapeClass,
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/25",
        !value ? `${dzSize.minHeight} ${dzSize.padding}` : "min-h-0 py-4",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      {value && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-background border shadow-md hover:bg-muted text-muted-foreground transition-all z-50 opacity-0 group-hover:opacity-100"
        >
          <IconPlaceholder
            lucide="X"
            tabler="IconX"
            hugeicons="Cancel01Icon"
            phosphor="X"
            className="size-3"
          />
        </button>
      )}

      <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-3">
        {value ? (
          <div className="relative w-full flex flex-col items-center justify-center gap-4 px-4">
            {previewUrl && isImageValue ? (
              <div className="relative group/preview w-full flex flex-col items-center gap-4">
                <div className="relative h-32 w-full max-w-60 shadow-sm ring-1 ring-border rounded-md overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {progress !== undefined && progress < 100 && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                      <CircularProgress progress={progress} size={44} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-medium text-foreground truncate max-w-50">
                    {getFileName(value)}
                  </p>
                  {value instanceof File && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(value.size)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-muted-foreground w-full max-w-md mx-auto p-3 rounded-lg border bg-muted/30">
                <div className="relative shrink-0">
                  <div className="p-2 rounded-md bg-background border shadow-sm">
                    <IconPlaceholder
                      lucide="File"
                      tabler="IconFile"
                      hugeicons="File02Icon"
                      phosphor="File"
                      className="size-8 text-primary"
                    />
                  </div>
                </div>
                <div className="text-left flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getFileName(value)}
                  </p>
                  <div className="flex items-center gap-2">
                    {value instanceof File && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(value.size)}
                      </p>
                    )}
                    {progress !== undefined && progress < 100 && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {Math.round(progress)}%
                      </span>
                    )}
                  </div>
                  {progress !== undefined && progress < 100 && (
                    <div className="mt-2 w-full">
                      <Progress value={progress} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                "rounded-full bg-muted/50",
                dzSize.iconSize === "size-4" ? "p-2" : "p-3"
              )}
            >
              <IconPlaceholder
                lucide="Upload"
                tabler="IconUpload"
                hugeicons="Upload04Icon"
                phosphor="UploadSimple"
                className={cn(dzSize.iconSize, "text-muted-foreground")}
              />
            </div>
            <div className="space-y-1">
              <p
                className={cn(
                  "font-medium",
                  sizeConfig === "xs" ? "text-[10px]" : "text-sm"
                )}
              >
                <span className="text-primary font-semibold">
                  {field.ui?.dropzoneText || "Click to upload"}
                </span>{" "}
                {sizeConfig !== "xs" &&
                  sizeConfig !== "sm" &&
                  "or drag and drop"}
              </p>
              {sizeConfig !== "xs" && sizeConfig !== "sm" && (
                <p className="text-xs text-muted-foreground">
                  {field.ui?.accept
                    ? field.ui.accept.split(",").join(", ")
                    : "Any file"}
                  {field.maxSize && ` (Max ${formatFileSize(field.maxSize)})`}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AvatarVariant({
  field,
  value,
  progress,
  onChange,
  disabled,
  inputRef,
}: {
  field: UploadFieldType;
  value: FileValue;
  progress?: number;
  onChange: (value: FileValue) => void;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [isHovering, setIsHovering] = useState(false);

  const shape = field.ui?.shape || "circle";
  const sizeConfig = field.ui?.size || "md";
  const sizeClass =
    typeof sizeConfig === "string" && sizeConfig in SIZE_MAP
      ? SIZE_MAP[sizeConfig as SizeKey].className
      : "size-24";

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
        ? "rounded-xl"
        : "rounded-md";

  const previewUrl = useMemo(() => {
    if (!value) return null;
    return getPreviewUrl(value);
  }, [value]);

  useEffect(() => {
    const url = previewUrl;
    return () => {
      if (url && value instanceof File) URL.revokeObjectURL(url);
    };
  }, [previewUrl, value]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClass
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={cn(
          "w-full h-full border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center",
          shapeClass,
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-primary/50 hover:bg-muted/50",
          value ? "border-transparent" : "border-muted-foreground/25"
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={previewUrl}
              alt="Avatar"
              fill
              className={cn("object-cover", shapeClass)}
              unoptimized
            />
            {progress !== undefined && progress < 100 && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                <CircularProgress
                  progress={progress}
                  size={sizeConfig === "xs" ? 32 : 40}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <IconPlaceholder
              lucide="Image"
              tabler="IconPhoto"
              hugeicons="Image01Icon"
              phosphor="Image"
              className="size-6"
            />
            <span className="text-[10px]">Upload</span>
          </div>
        )}
      </div>
      {previewUrl && !disabled && isHovering && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 p-1 rounded-full bg-background border shadow-sm hover:bg-muted text-muted-foreground transition-all z-50"
        >
          <IconPlaceholder
            lucide="X"
            tabler="IconX"
            hugeicons="Cancel01Icon"
            phosphor="X"
            className="size-3"
          />
        </button>
      )}
    </div>
  );
}

function InlineVariant({
  field,
  value,
  onChange,
  disabled,
  inputRef,
}: {
  field: UploadFieldType;
  value: FileValue;
  onChange: (value: FileValue) => void;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const sizeConfig = (field.ui?.size as SizeKey) || "md";
  const btnSize =
    sizeConfig === "xs" || sizeConfig === "sm"
      ? sizeConfig
      : sizeConfig === "xl"
        ? "lg"
        : "default";
  const iconSize = sizeConfig === "xs" ? "size-3.5" : "size-4";
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size={btnSize}
        onClick={() => !disabled && inputRef.current?.click()}
        disabled={disabled}
        className="gap-2"
      >
        <IconPlaceholder
          lucide="Upload"
          tabler="IconUpload"
          hugeicons="Upload04Icon"
          phosphor="UploadSimple"
          className={iconSize}
        />
        {sizeConfig === "xs" ? "Upload" : "Choose File"}
      </Button>
      {value ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate max-w-48">{getFileName(value)}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center justify-center p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <IconPlaceholder
                lucide="X"
                tabler="IconX"
                hugeicons="Cancel01Icon"
                phosphor="X"
                className="size-4"
              />
            </button>
          )}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">No file selected</span>
      )}
    </div>
  );
}

function GalleryThumbnail({
  file,
  size,
  shape,
  progress,
  onRemove,
  disabled,
}: {
  file: File | string;
  size: number;
  shape: "circle" | "square" | "rounded";
  progress?: number;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
        ? "rounded-lg"
        : "rounded-md";

  const previewUrl = useMemo(() => getPreviewUrl(file), [file]);

  useEffect(() => {
    const url = previewUrl;
    return () => {
      // Only revoke if it's a blob URL we created
      if (
        typeof url === "string" &&
        url.startsWith("blob:") &&
        file instanceof File
      ) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrl, file]);

  const isImageFile = isImage(file);

  return (
    <div style={{ width: size, height: size }} className="relative group">
      <div
        className={cn(
          "w-full h-full overflow-hidden border border-border bg-muted/50 transition-colors",
          shapeClass
        )}
      >
        {previewUrl && isImageFile ? (
          <div className="relative w-full h-full">
            <Image
              src={previewUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
            {progress !== undefined && progress < 100 && (
              <div className="absolute inset-x-1.5 bottom-1.5">
                <Progress value={progress} />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <IconPlaceholder
              lucide="File"
              tabler="IconFile"
              hugeicons="File02Icon"
              phosphor="File"
              className="size-6 text-muted-foreground"
            />
            <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-full px-1">
              {getFileName(file)}
            </span>
            {progress !== undefined && progress < 100 && (
              <Progress value={progress} className="mt-2 w-[80%]" />
            )}
          </div>
        )}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 p-1 rounded-full bg-background border shadow-sm text-muted-foreground transition-all z-50",
            "opacity-0 group-hover:opacity-100",
            "hover:bg-muted"
          )}
        >
          <IconPlaceholder
            lucide="X"
            tabler="IconX"
            hugeicons="Cancel01Icon"
            phosphor="X"
            className="size-3"
          />
        </button>
      )}
    </div>
  );
}

function GalleryVariant({
  field,
  value = [],
  progressMap,
  onChange,
  disabled,
  inputRef,
}: {
  field: UploadFieldType;
  value: FileArrayValue;
  progressMap: Record<string, number>;
  onChange: (value: FileArrayValue) => void;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const sizeConfig = field.ui?.size || "md";
  const thumbnailSize =
    typeof sizeConfig === "string" && sizeConfig in SIZE_MAP
      ? SIZE_MAP[sizeConfig as SizeKey].width
      : 100;

  const shape = field.ui?.shape || "rounded";
  const maxFiles = field.maxFiles;
  const minFiles = field.minFiles;

  const handleRemove = useCallback(
    (index: number) => {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles);
    },
    [value, onChange]
  );

  const fileIds = useMemo(() => {
    const seen = new Map<string, number>();
    return value.map((file) => {
      const baseId =
        file instanceof File
          ? `${file.name}-${file.size}-${file.lastModified}`
          : file;
      const count = (seen.get(baseId) || 0) + 1;
      seen.set(baseId, count);
      return count === 1 ? baseId : `${baseId}-${count}`;
    });
  }, [value]);

  const canAddMore = !maxFiles || value.length < maxFiles;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((file, index) => {
          const fileId = fileIds[index];
          return (
            <GalleryThumbnail
              key={fileId}
              file={file}
              size={thumbnailSize}
              shape={field.ui?.shape || "rounded"}
              progress={progressMap[fileId]}
              onRemove={() => handleRemove(index)}
              disabled={disabled}
            />
          );
        })}
        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed transition-colors gap-2",
              "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              "text-muted-foreground hover:text-foreground",
              shape === "circle"
                ? "rounded-full"
                : shape === "rounded"
                  ? "rounded-xl"
                  : "rounded-md"
            )}
            style={{ width: thumbnailSize, height: thumbnailSize }}
          >
            <IconPlaceholder
              lucide="Plus"
              tabler="IconPlus"
              hugeicons="Add01Icon"
              phosphor="Plus"
              className={cn(thumbnailSize < 80 ? "size-4" : "size-6")}
            />
            {thumbnailSize >= 100 && (
              <span className="text-[10px] font-medium px-2 text-center leading-none">
                {field.ui?.dropzoneText || "Add"}
              </span>
            )}
          </button>
        )}
      </div>
      {(maxFiles || minFiles) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <p>
            {value.length} {maxFiles ? `/ ${maxFiles}` : ""} files
          </p>
          {minFiles && value.length < minFiles && (
            <p className="text-destructive font-medium">
              (Min {minFiles} required)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export interface UploadFieldProps {
  field: UploadFieldType;
  path: string;
  form: FormAdapter;
  autoFocus?: boolean;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
}

export function UploadField({
  field,
  path,
  form,
  autoFocus,
  formValues,
  siblingData,
}: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const value = form.watch(path);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const error = form.formState.errors[path];
  const errorMessage =
    typeof error === "string"
      ? error
      : Array.isArray(error)
        ? error[0]
        : undefined;
  const hasError = !!errorMessage;

  const isDisabled =
    (typeof field.disabled === "function"
      ? field.disabled(formValues, siblingData)
      : (field.disabled ?? false)) || form.formState.isSubmitting;

  const isReadOnly =
    typeof field.readOnly === "function"
      ? field.readOnly(formValues, siblingData)
      : (field.readOnly ?? false);

  const label = field.label !== false ? (field.label ?? field.name) : null;
  const fieldId = field.id ?? generateFieldId(path);
  const variant = field.ui?.variant || "dropzone";
  const hasMany = field.hasMany;
  const showProgress = field.ui?.showProgress;

  const simulateProgress = useCallback(
    (fileId: string) => {
      // Check if already 100 or already simulating
      if (progressMap[fileId] === 100) return;

      let current = 0;
      const interval = setInterval(() => {
        current += Math.random() * 15 + 2;
        if (current >= 100) {
          current = 100;
          clearInterval(interval);
        }
        setProgressMap((prev) => ({ ...prev, [fileId]: current }));
      }, 300);
    },
    [progressMap]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;

      if (hasMany) {
        const currentValue = (value as FileArrayValue) || [];
        const newFiles = Array.from(files);
        const combined = [...currentValue, ...newFiles];

        if (showProgress) {
          newFiles.forEach((f, idx) => {
            // Include index and timestamp for absolute uniqueness within a single select
            const id = `${f.name}-${f.size}-${f.lastModified}-${Date.now()}-${idx}`;
            simulateProgress(id);
          });
        }

        const maxFiles = field.maxFiles;
        const finalValue = maxFiles ? combined.slice(0, maxFiles) : combined;

        form.setValue(path, finalValue, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        const file = files[0];

        if (showProgress && file) {
          const id = `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`;
          simulateProgress(id);
        }

        form.setValue(path, file, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (inputRef.current) inputRef.current.value = "";
    },
    [hasMany, value, field.maxFiles, form, path, showProgress, simulateProgress]
  );

  const handleSingleChange = useCallback(
    (newValue: FileValue) => {
      form.setValue(path, newValue, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form, path]
  );

  const handleMultiChange = useCallback(
    (newValue: FileArrayValue) => {
      form.setValue(path, newValue, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form, path]
  );

  const renderVariant = () => {
    const commonProps = {
      field,
      disabled: isDisabled || isReadOnly,
      inputRef,
    };

    if (process.env.NODE_ENV === "development" && field.ui?.crop) {
      console.warn(
        `UploadField (${field.name}): 'crop' option is currently not implemented.`
      );
    }

    if (hasMany) {
      return (
        <GalleryVariant
          {...commonProps}
          value={(value as FileArrayValue) || []}
          progressMap={progressMap}
          onChange={handleMultiChange}
        />
      );
    }

    const fileId =
      value instanceof File
        ? `${value.name}-${value.size}-${value.lastModified}`
        : null;
    const currentProgress = fileId ? progressMap[fileId] : undefined;

    switch (variant) {
      case "avatar":
        return (
          <AvatarVariant
            {...commonProps}
            value={value as FileValue}
            progress={currentProgress}
            onChange={handleSingleChange}
          />
        );
      case "inline":
        return (
          <InlineVariant
            {...commonProps}
            value={value as FileValue}
            onChange={handleSingleChange}
          />
        );
      case "dropzone":
      case "gallery":
      default:
        return (
          <DropzoneVariant
            {...commonProps}
            value={value as FileValue}
            progress={currentProgress}
            onChange={handleSingleChange}
          />
        );
    }
  };

  return (
    <Field
      className={field.style?.className}
      data-invalid={hasError}
      data-disabled={isDisabled}
      style={
        field.style?.width
          ? {
              width:
                typeof field.style.width === "number"
                  ? `${field.style.width}px`
                  : field.style.width,
            }
          : undefined
      }
    >
      {label && (
        <FieldLabel htmlFor={fieldId} className="gap-1 items-baseline">
          {label}
          {field.required && <span className="text-destructive">*</span>}
        </FieldLabel>
      )}

      <FieldContent>
        <input
          id={fieldId}
          type="file"
          ref={inputRef}
          className="hidden"
          accept={field.ui?.accept}
          multiple={hasMany}
          onChange={handleFileChange}
          disabled={isDisabled || isReadOnly}
          autoFocus={autoFocus}
        />
        {renderVariant()}
      </FieldContent>

      {field.description && (
        <FieldDescription id={`${fieldId}-description`}>
          {field.description}
        </FieldDescription>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </Field>
  );
}

export function UploadFieldSkeleton({ field }: { field: UploadFieldType }) {
  const label = field.label !== false ? (field.label ?? field.name) : null;
  const variant = field.ui?.variant || "dropzone";
  const sizeConfig = field.ui?.size || "md";
  const shape = field.ui?.shape || "circle";

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
        ? "rounded-xl"
        : "rounded-md";

  const sizeClass =
    typeof sizeConfig === "string" && sizeConfig in SIZE_MAP
      ? SIZE_MAP[sizeConfig as SizeKey].className
      : "size-24";

  if (variant === "avatar") {
    return (
      <Field className={field.style?.className}>
        {label && <div className="h-4 w-20 animate-pulse rounded bg-muted" />}
        <FieldContent>
          <div
            className={cn("animate-pulse bg-muted", sizeClass, shapeClass)}
          />
        </FieldContent>
        {field.description && (
          <div className="h-3 w-32 mt-2 animate-pulse rounded bg-muted" />
        )}
      </Field>
    );
  }

  if (variant === "inline") {
    return (
      <Field className={field.style?.className}>
        {label && <div className="h-4 w-20 animate-pulse rounded bg-muted" />}
        <FieldContent>
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        </FieldContent>
      </Field>
    );
  }

  return (
    <Field className={field.style?.className}>
      {label && <div className="h-4 w-24 animate-pulse rounded bg-muted" />}
      <FieldContent>
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
      </FieldContent>
      {field.description && (
        <div className="h-3 w-48 mt-2 animate-pulse rounded bg-muted" />
      )}
    </Field>
  );
}
