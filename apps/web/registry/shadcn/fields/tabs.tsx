"use client";

import type { TabsField as TabsFieldDef } from "@buildnbuzz/form-react";
import {
  useLayoutField,
  RenderFields,
  useNestedErrorCount,
  toDotNotation,
  type CoreField,
} from "@buildnbuzz/form-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface TabsUi {
  /** Default active tab (index or label). Defaults to first enabled tab. */
  defaultTab?: number | string;
  /** Visual variant. Default: "default". */
  variant?: "default" | "line";
  /** Content spacing. Default: "md". */
  spacing?: "sm" | "md" | "lg";
  /** Show error badge on tabs. Default: true. */
  showErrorBadge?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const spacingClass: Record<NonNullable<TabsUi["spacing"]>, string> = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

// ---------------------------------------------------------------------------
// Per-tab trigger with reactive error badge
// ---------------------------------------------------------------------------

function TabTriggerWithBadge({
  label,
  value,
  disabled,
  fields,
  basePath,
  showErrorBadge,
}: {
  label: string;
  value: string;
  disabled: boolean;
  fields: readonly CoreField[];
  basePath: string;
  showErrorBadge: boolean;
}) {
  const errorCount = useNestedErrorCount(fields, basePath);
  return (
    <TabsTrigger value={value} disabled={disabled}>
      <span className="flex items-center gap-1.5">
        <span>{label}</span>
        {showErrorBadge && errorCount > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
            {errorCount}
          </Badge>
        )}
      </span>
    </TabsTrigger>
  );
}

// ---------------------------------------------------------------------------
// TabsField
// ---------------------------------------------------------------------------

export function TabsField() {
  const { form, fieldPath, resolvedTabs, field } =
    useLayoutField<TabsFieldDef>();

  if (resolvedTabs.length === 0) return null;

  const ui = field.ui as TabsUi | undefined;
  const variant = ui?.variant ?? "default";
  const spacing = ui?.spacing ?? "md";
  const showErrorBadge = ui?.showErrorBadge !== false;

  // Resolve defaultTab
  const rawDefault = ui?.defaultTab;
  let defaultValue: string;
  if (typeof rawDefault === "string") {
    // Match by label
    defaultValue = resolvedTabs.some((t) => t.label === rawDefault)
      ? rawDefault
      : (resolvedTabs[0]?.label ?? "");
  } else if (typeof rawDefault === "number") {
    defaultValue =
      resolvedTabs[rawDefault]?.label ?? resolvedTabs[0]?.label ?? "";
  } else {
    // First non-disabled tab
    const firstEnabled = resolvedTabs.findIndex((t) => !t.disabled);
    defaultValue =
      resolvedTabs[firstEnabled >= 0 ? firstEnabled : 0]?.label ?? "";
  }

  const basePath = toDotNotation(fieldPath);

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList variant={variant} className="w-full justify-start">
        {resolvedTabs.map((tab, i) => {
          const rawTab = (field as TabsFieldDef).tabs[i];
          return (
            <TabTriggerWithBadge
              key={i}
              label={tab.label}
              value={tab.label}
              disabled={tab.disabled}
              showErrorBadge={showErrorBadge}
              fields={rawTab?.fields ?? []}
              basePath={basePath}
            />
          );
        })}
      </TabsList>

      {resolvedTabs.map((tab, i) => {
        const rawTab = (field as TabsFieldDef).tabs[i];
        return (
          <TabsContent
            key={i}
            value={tab.label}
            className={cn("mt-4", spacingClass[spacing])}
          >
            <RenderFields
              fields={rawTab?.fields ?? []}
              form={form}
              basePath={basePath}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
