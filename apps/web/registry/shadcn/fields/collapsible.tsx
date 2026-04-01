"use client";

import * as React from "react";
import type { CollapsibleField as CollapsibleFieldDef } from "@buildnbuzz/form-core";
import { useLayoutField, useNestedErrorCount } from "@buildnbuzz/form-react";
import { resolveDynamicValue, toDotNotation } from "@buildnbuzz/form-core";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface CollapsibleUi {
  /** Visual variant. Defaults to `"bordered"`. */
  variant?: "card" | "bordered" | "ghost";
  /** Vertical spacing between nested fields. Defaults to `"md"`. */
  spacing?: "sm" | "md" | "lg";
  /** Show an error-count badge next to the trigger label. Defaults to `true`. */
  showErrorBadge?: boolean;
  /** Description rendered below the trigger label when expanded. */
  description?: string;
  /** Icon rendered before the trigger label. */
  icon?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const spacingClass: Record<NonNullable<CollapsibleUi["spacing"]>, string> = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function TriggerChevron({ open }: { open: boolean }) {
  return (
    <IconPlaceholder
      lucide="ChevronDown"
      hugeicons="ArrowDown01Icon"
      tabler="IconChevronDown"
      phosphor="CaretDown"
      remixicon="RiArrowDownSLine"
      className={cn(
        "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
        !open && "-rotate-90",
      )}
    />
  );
}

function TriggerLabel({
  label,
  icon,
  errorCount,
  showErrorBadge,
  bold,
}: {
  label: string;
  icon?: React.ReactNode;
  errorCount: number;
  showErrorBadge: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 flex items-center gap-2">
      {icon && (
        <span className="shrink-0 text-muted-foreground">{icon}</span>
      )}
      <span
        className={cn(
          "text-sm truncate",
          bold ? "font-semibold" : "font-medium",
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
  );
}

// ---------------------------------------------------------------------------
// CollapsibleField
// ---------------------------------------------------------------------------

export function CollapsibleField({ children }: { children?: React.ReactNode }) {
  const { field, fieldPath, formData, contextData, label } =
    useLayoutField<CollapsibleFieldDef>();

  const ui = field.ui as CollapsibleUi | undefined;
  const variant = ui?.variant ?? "bordered";
  const spacing = ui?.spacing ?? "md";
  const showErrorBadge = ui?.showErrorBadge !== false;
  const description = ui?.description;
  const icon = ui?.icon;

  const resolvedCollapsed = resolveDynamicValue(
    field.collapsed,
    formData,
    contextData,
  );
  const [isOpen, setIsOpen] = React.useState(resolvedCollapsed !== true);

  // Read current error count from the store snapshot (re-renders when form state changes)
  const errorCount = useNestedErrorCount(field.fields, toDotNotation(fieldPath));

  const triggerLabelProps = {
    label: label || "Toggle",
    icon,
    errorCount,
    showErrorBadge,
  };

  const descriptionNode = description ? (
    <p className="text-sm text-muted-foreground mb-3">{description}</p>
  ) : null;

  // ── GHOST ──────────────────────────────────────────────────────────────────
  if (variant === "ghost") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className="w-full px-2 py-2 rounded-md flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
        >
          <TriggerLabel {...triggerLabelProps} />
          <TriggerChevron open={isOpen} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className={cn("pt-4 pl-2", spacingClass[spacing])}>
            {descriptionNode}
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // ── BORDERED ───────────────────────────────────────────────────────────────
  if (variant === "bordered") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border border-dashed border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger
            className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
          >
            <TriggerLabel {...triggerLabelProps} />
            <TriggerChevron open={isOpen} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className={cn("px-4 pt-2 pb-4", spacingClass[spacing])}>
              {descriptionNode}
              {children}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // ── CARD (default) ─────────────────────────────────────────────────────────
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="py-0 gap-0">
        <CardHeader className="p-0 border-b-0">
          <CollapsibleTrigger
            className={cn(
              "w-full px-4 py-3 flex flex-row items-center justify-between",
              "hover:bg-muted/75 bg-muted/50 transition-colors select-none cursor-pointer",
              isOpen && "border-b",
            )}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
          >
            <TriggerLabel {...triggerLabelProps} bold />
            <TriggerChevron open={isOpen} />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className={cn("px-4 pt-3 pb-4", spacingClass[spacing])}>
            {descriptionNode}
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
