"use client";

import * as React from "react";
import { getNestedFieldPaths } from "@buildnbuzz/buzzform";
import type {
  Field,
  GroupField as GroupFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { cn } from "@/lib/utils";
import { FieldRenderer, type FieldRegistry } from "./render";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { IconPlaceholder } from "@/components/icon-placeholder";

export interface GroupFieldComponentProps {
  field: GroupFieldType;
  path: string;
  form: FormAdapter;
  registry?: FieldRegistry;
  autoFocus?: boolean;
  // Computed props
  fieldId: string;
  label: React.ReactNode | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  error?: string;
}

/**
 * Count errors in nested fields
 */
const useNestedErrors = (
  form: FormAdapter,
  fields: Field[],
  basePath: string
): number => {
  const errors = form.formState.errors;

  const nestedPaths = getNestedFieldPaths(fields, basePath);
  let errorCount = 0;

  for (const fieldPath of nestedPaths) {
    const error = errors[fieldPath];
    if (error) {
      errorCount++;
    }
  }

  return errorCount;
};

/**
 * Spacing class map
 */
const spacingMap = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
} as const;

export const GroupField = React.forwardRef<
  HTMLDivElement,
  GroupFieldComponentProps
>(({ field, path, form, registry, label }: GroupFieldComponentProps, ref) => {
  // Extract UI options with defaults
  const variant = field.ui?.variant ?? "card";
  const spacing = field.ui?.spacing ?? "md";
  const collapsed = field.ui?.collapsed ?? false;
  const showErrorBadge = field.ui?.showErrorBadge !== false;

  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  // Count nested errors for badge
  const errorCount = useNestedErrors(form, field.fields, path);

  // Render nested fields
  const renderNestedFields = () => (
    <div className={cn(spacingMap[spacing])}>
      {field.fields.map((f, i) => {
        const nestedPath = "name" in f ? `${path}.${f.name}` : path;
        return (
          <FieldRenderer
            key={i}
            field={f}
            path={nestedPath}
            form={form}
            registry={registry}
          />
        );
      })}
    </div>
  );

  // Render description if provided
  const renderDescription = () => {
    if (!field.description) return null;

    return (
      <p className="text-sm text-muted-foreground mb-3">{field.description}</p>
    );
  };

  // === FLAT VARIANT ===
  // No container, just grouped fields with optional label
  if (variant === "flat") {
    return (
      <div
        ref={ref}
        className={cn("w-full", field.style?.className)}
        style={field.style?.width ? { width: field.style.width } : undefined}
      >
        {label && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">{label}</span>
            {showErrorBadge && errorCount > 0 && (
              <div className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                <IconPlaceholder
                  lucide="AlertCircle"
                  hugeicons="AlertCircleIcon"
                  tabler="IconAlertCircle"
                  phosphor="Warning"
                  className="size-3.5"
                />
                {errorCount} {errorCount === 1 ? "error" : "errors"}
              </div>
            )}
          </div>
        )}
        {renderDescription()}
        {renderNestedFields()}
      </div>
    );
  }

  // === GHOST VARIANT ===
  // Minimal styling, subtle border, no header background
  if (variant === "ghost") {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-border/50 rounded-lg p-4",
          field.style?.className
        )}
        style={field.style?.width ? { width: field.style.width } : undefined}
      >
        {label && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">{label}</span>
            {showErrorBadge && errorCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {errorCount}
              </Badge>
            )}
          </div>
        )}
        {renderDescription()}
        {renderNestedFields()}
      </div>
    );
  }

  // === BORDERED VARIANT ===
  // Dashed border with optional collapse support
  if (variant === "bordered") {
    return (
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <div
          ref={ref}
          className={cn(
            "border border-dashed border-border rounded-lg overflow-hidden",
            field.style?.className
          )}
          style={field.style?.width ? { width: field.style.width } : undefined}
        >
          {label && (
            <CollapsibleTrigger
              className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${label}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground text-sm">
                  {label}
                </span>
                {showErrorBadge && errorCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    {errorCount}
                  </Badge>
                )}
              </div>
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                  isCollapsed && "-rotate-90"
                )}
              />
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <div className="px-4 pt-2 pb-4">
              {renderDescription()}
              {renderNestedFields()}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // === CARD VARIANT (DEFAULT) ===
  // Full card with header background and border
  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(open) => setIsCollapsed(!open)}
    >
      <Card
        ref={ref}
        className={cn("py-0 gap-0", field.style?.className)}
        style={field.style?.width ? { width: field.style.width } : undefined}
      >
        {label && (
          <CardHeader className="p-0 border-b-0">
            <CollapsibleTrigger
              className={cn(
                "w-full px-4 py-3 flex flex-row items-center justify-between",
                "hover:bg-muted/75 bg-muted/50 transition-colors select-none cursor-pointer",
                !isCollapsed && "border-b"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${label}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{label}</span>
                {showErrorBadge && errorCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    {errorCount}
                  </Badge>
                )}
              </div>
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                  isCollapsed && "-rotate-90"
                )}
              />
            </CollapsibleTrigger>
          </CardHeader>
        )}

        <CollapsibleContent>
          <CardContent className="px-4 pt-3 pb-4">
            {renderDescription()}
            {renderNestedFields()}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});

GroupField.displayName = "GroupField";

/**
 * GroupFieldSkeleton - Loading state for group fields.
 * Recursively renders skeletons for nested fields.
 */
export const GroupFieldSkeleton = React.forwardRef<
  HTMLDivElement,
  { field: GroupFieldType }
>(({ field }: { field: GroupFieldType }, ref) => {
  const variant = field.ui?.variant ?? "card";
  const spacing = field.ui?.spacing ?? "md";
  const label = field.label !== false ? field.label || field.name : null;

  // Estimate nested field heights for skeleton
  const getSkeletonHeight = (nestedField: Field) => {
    switch (nestedField.type) {
      case "textarea":
        return "h-24";
      case "upload":
        return "h-32";
      case "checkbox":
      case "switch":
        return "h-6";
      case "group":
      case "array":
        return "h-40";
      default:
        return "h-9";
    }
  };

  const renderNestedSkeletons = () => (
    <div className={cn(spacingMap[spacing])}>
      {field.fields.slice(0, 3).map((f, i) => (
        <div key={i} className="space-y-2">
          {"label" in f && f.label !== false && (
            <Skeleton className="h-4 w-20" />
          )}
          <Skeleton className={cn("w-full rounded-md", getSkeletonHeight(f))} />
        </div>
      ))}
      {field.fields.length > 3 && (
        <div className="text-xs text-muted-foreground">
          +{field.fields.length - 3} more fields...
        </div>
      )}
    </div>
  );

  // Flat variant skeleton
  if (variant === "flat") {
    return (
      <div
        ref={ref}
        className={cn("w-full", field.style?.className)}
        style={field.style?.width ? { width: field.style.width } : undefined}
      >
        {label && <Skeleton className="h-5 w-32 mb-3" />}
        {renderNestedSkeletons()}
      </div>
    );
  }

  // Ghost variant skeleton
  if (variant === "ghost") {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-border/50 rounded-lg p-4",
          field.style?.className
        )}
        style={field.style?.width ? { width: field.style.width } : undefined}
      >
        {label && <Skeleton className="h-5 w-32 mb-1" />}
        {renderNestedSkeletons()}
      </div>
    );
  }

  // Bordered variant skeleton
  if (variant === "bordered") {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-dashed border-border rounded-lg overflow-hidden",
          field.style?.className
        )}
        style={field.style?.width ? { width: field.style.width } : undefined}
      >
        <div className="px-4 py-2 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="px-4 pb-4">{renderNestedSkeletons()}</div>
      </div>
    );
  }

  // Card variant skeleton (default)
  return (
    <Card ref={ref} className={cn("py-0", field.style?.className)}>
      <CardHeader className="px-4 py-3 bg-muted/50 border-b flex flex-row justify-between items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="pt-4 px-4 pb-4">
        {renderNestedSkeletons()}
      </CardContent>
    </Card>
  );
});

GroupFieldSkeleton.displayName = "GroupFieldSkeleton";
