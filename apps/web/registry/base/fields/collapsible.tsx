"use client";

import * as React from "react";
import { getNestedFieldPaths } from "@buildnbuzz/buzzform";
import type {
  Field,
  CollapsibleField as CollapsibleFieldType,
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

export interface CollapsibleFieldComponentProps {
  field: CollapsibleFieldType;
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

export const CollapsibleField = React.forwardRef<
  HTMLDivElement,
  CollapsibleFieldComponentProps
>(
  (
    { field, path, form, registry, label }: CollapsibleFieldComponentProps,
    ref
  ) => {
    // Extract UI options with defaults
    const variant = field.ui?.variant ?? "bordered";
    const spacing = field.ui?.spacing ?? "md";
    const collapsed = field.collapsed ?? false;
    const showErrorBadge = field.ui?.showErrorBadge !== false;
    const description = field.ui?.description;
    const customIcon = field.ui?.icon;

    const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

    // Count nested errors for badge
    const errorCount = useNestedErrors(form, field.fields, path);

    // Render nested fields
    const renderNestedFields = () => (
      <div className={cn(spacingMap[spacing])}>
        {field.fields.map((f, i) => {
          const nestedPath =
            "name" in f ? (path ? `${path}.${f.name}` : f.name) : path;
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
      if (!description) return null;

      return (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      );
    };

    // Render header content (label, icon, error badge)
    const renderHeaderContent = () => (
      <div className="flex-1 min-w-0 flex items-start gap-2">
        {customIcon && (
          <span className="shrink-0 text-muted-foreground mt-0.5">
            {customIcon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm truncate",
                variant === "card" ? "font-semibold" : "font-medium"
              )}
            >
              {label}
            </span>
            {showErrorBadge && errorCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {errorCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );

    const containerStyle = field.style?.width
      ? { width: field.style.width }
      : undefined;

    // === GHOST VARIANT ===
    if (variant === "ghost") {
      return (
        <Collapsible
          open={!isCollapsed}
          onOpenChange={(open) => setIsCollapsed(!open)}
        >
          <div
            ref={ref}
            className={cn("w-full", field.style?.className)}
            style={containerStyle}
          >
            <CollapsibleTrigger
              className="w-full px-2 py-2 rounded-md flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${label}`}
            >
              {renderHeaderContent()}
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                remixicon="RiArrowDownSLine"
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
                  isCollapsed && "-rotate-90"
                )}
              />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="pt-4 pl-2">
                {renderDescription()}
                {renderNestedFields()}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      );
    }

    // === BORDERED VARIANT ===
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
            style={containerStyle}
          >
            <CollapsibleTrigger
              className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${label}`}
            >
              {renderHeaderContent()}
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                remixicon="RiArrowDownSLine"
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
                  isCollapsed && "-rotate-90"
                )}
              />
            </CollapsibleTrigger>
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
    return (
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <Card
          ref={ref}
          className={cn("py-0 gap-0", field.style?.className)}
          style={containerStyle}
        >
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
              {renderHeaderContent()}
              <IconPlaceholder
                lucide="ChevronDown"
                hugeicons="ArrowDown01Icon"
                tabler="IconChevronDown"
                phosphor="CaretDown"
                remixicon="RiArrowDownSLine"
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
                  isCollapsed && "-rotate-90"
                )}
              />
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="px-4 pt-3 pb-4">
              {renderDescription()}
              {renderNestedFields()}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }
);

CollapsibleField.displayName = "CollapsibleField";

/**
 * CollapsibleFieldSkeleton - Loading state for collapsible fields.
 */
export const CollapsibleFieldSkeleton = React.forwardRef<
  HTMLDivElement,
  { field: CollapsibleFieldType }
>(({ field }: { field: CollapsibleFieldType }, ref) => {
  const variant = field.ui?.variant ?? "bordered";
  const spacing = field.ui?.spacing ?? "md";

  const renderNestedSkeletons = () => (
    <div className={cn(spacingMap[spacing])}>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );

  const containerStyle = field.style?.width
    ? { width: field.style.width }
    : undefined;

  if (variant === "ghost") {
    return (
      <div
        ref={ref}
        className={cn("w-full", field.style?.className)}
        style={containerStyle}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="pt-3 pl-2">{renderNestedSkeletons()}</div>
      </div>
    );
  }

  if (variant === "bordered") {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-dashed border-border rounded-lg overflow-hidden",
          field.style?.className
        )}
        style={containerStyle}
      >
        <div className="px-4 py-2 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="px-4 pb-4">{renderNestedSkeletons()}</div>
      </div>
    );
  }

  return (
    <Card
      ref={ref}
      className={cn("py-0", field.style?.className)}
      style={containerStyle}
    >
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

CollapsibleFieldSkeleton.displayName = "CollapsibleFieldSkeleton";
