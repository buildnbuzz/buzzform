"use client";

import * as React from "react";
import type { GroupField as GroupFieldDef } from "@buildnbuzz/form-react";
import { useDataField, useNestedErrorCount } from "@buildnbuzz/form-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface GroupUi {
  /** Visual variant. Defaults to `"card"`. */
  variant?: "card" | "bordered" | "ghost" | "flat";
  /** Vertical spacing between nested fields. Defaults to `"md"`. */
  spacing?: "sm" | "md" | "lg";
  /** Start collapsed (card and bordered variants only). Defaults to `false`. */
  collapsed?: boolean;
  /** Show an error-count badge next to the label. Defaults to `true`. */
  showErrorBadge?: boolean;
  /** Description rendered below the label. */
  description?: string;
  /** Controls required asterisk visibility. */
  asterisk?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const spacingClass: Record<NonNullable<GroupUi["spacing"]>, string> = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

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

// ---------------------------------------------------------------------------
// GroupField
// ---------------------------------------------------------------------------

export function GroupField({ children }: { children?: React.ReactNode }) {
  const {
    fieldApi,
    field,
    isDisabled,
    isRequired,
    label,
    description: resolvedDescription,
    errors,
    isInvalid,
    descriptionId,
    errorId,
  } = useDataField<GroupFieldDef>();

  const ui = field.ui as GroupUi | undefined;
  const variant = ui?.variant ?? "card";
  const spacing = ui?.spacing ?? "md";
  const showErrorBadge = ui?.showErrorBadge !== false;
  const description = ui?.description ?? resolvedDescription;

  const [isOpen, setIsOpen] = React.useState(!(ui?.collapsed ?? false));

  // Error count scoped to this group's nested fields
  const errorCount = useNestedErrorCount(field.fields, fieldApi.name);

  // Inline label+badge used inside trigger buttons (phrasing content only)
  const triggerLabelContent = label ? (
    <>
      <span
        className={cn(
          "text-sm truncate",
          variant === "card" ? "font-semibold" : "font-medium",
        )}
      >
        {label}
      </span>
      {showErrorBadge && errorCount > 0 && (
        <Badge variant="destructive" className="h-5 px-1.5 text-xs">
          {errorCount}
        </Badge>
      )}
    </>
  ) : null;

  const descriptionNode = description ? (
    <FieldDescription id={descriptionId}>{description}</FieldDescription>
  ) : null;

  const errorNode = isInvalid ? (
    <FieldError id={errorId} errors={errors} />
  ) : null;

  // ── FLAT ───────────────────────────────────────────────────────────────────
  if (variant === "flat") {
    return (
      <FieldGroup data-field={fieldApi.name}>
        <Field data-invalid={isInvalid} data-disabled={isDisabled}>
          <FieldSet disabled={isDisabled} className={spacingClass[spacing]}>
            {label && (
              <FieldLegend>
                {label}
                {isRequired && ui?.asterisk !== false ? (
                  <span className="text-destructive ml-1">*</span>
                ) : null}
                {showErrorBadge && errorCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs ml-2">
                    {errorCount}
                  </Badge>
                )}
              </FieldLegend>
            )}
            {descriptionNode}
            {errorNode}
            {children}
          </FieldSet>
        </Field>
      </FieldGroup>
    );
  }

  // ── GHOST ──────────────────────────────────────────────────────────────────
  if (variant === "ghost") {
    return (
      <FieldGroup data-field={fieldApi.name}>
        <Field data-invalid={isInvalid} data-disabled={isDisabled}>
          <FieldSet
            disabled={isDisabled}
            className="border border-border/50 rounded-lg p-4"
          >
            {label && (
              <FieldLegend className="flex items-center gap-2">
                {label}
                {isRequired && ui?.asterisk !== false ? (
                  <span className="text-destructive ml-1">*</span>
                ) : null}
                {showErrorBadge && errorCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    {errorCount}
                  </Badge>
                )}
              </FieldLegend>
            )}
            {descriptionNode}
            {errorNode}
            <div className={spacingClass[spacing]}>{children}</div>
          </FieldSet>
        </Field>
      </FieldGroup>
    );
  }

  // ── BORDERED ───────────────────────────────────────────────────────────────
  if (variant === "bordered") {
    return (
      <FieldGroup data-field={fieldApi.name}>
        <Field data-invalid={isInvalid} data-disabled={isDisabled}>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <FieldSet
              disabled={isDisabled}
              className="border border-dashed border-border rounded-lg overflow-hidden"
            >
              {label && (
                <CollapsibleTrigger
                  className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${label}`}
                >
                  <span className="flex items-center gap-2">
                    {triggerLabelContent}
                  </span>
                  <TriggerChevron open={isOpen} />
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <div className={cn("px-4 pt-2 pb-4", spacingClass[spacing])}>
                  {descriptionNode}
                  {errorNode}
                  {children}
                </div>
              </CollapsibleContent>
            </FieldSet>
          </Collapsible>
        </Field>
      </FieldGroup>
    );
  }

  // ── CARD (default) ─────────────────────────────────────────────────────────
  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className="py-0 gap-0">
            {label && (
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
                  <span className="flex items-center gap-2">
                    {triggerLabelContent}
                  </span>
                  <TriggerChevron open={isOpen} />
                </CollapsibleTrigger>
              </CardHeader>
            )}
            <CollapsibleContent>
              <CardContent className={cn("px-4 pt-3 pb-4", spacingClass[spacing])}>
                {descriptionNode}
                {errorNode}
                {children}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </Field>
    </FieldGroup>
  );
}
