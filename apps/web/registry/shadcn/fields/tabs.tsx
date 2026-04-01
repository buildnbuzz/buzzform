"use client";

import type { TabsField as TabsFieldDef, Tab } from "@buildnbuzz/form-core";
import { useLayoutField, RenderFields, useNestedErrorCount } from "@buildnbuzz/form-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toDotNotation, resolveDynamicValue } from "@buildnbuzz/form-core";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// UI options
// ---------------------------------------------------------------------------

interface TabsUi {
  /**
   * Default active tab — zero-based index or tab label string.
   * Defaults to the first non-disabled tab.
   */
  defaultTab?: number | string;
  /** Visual variant for the tab list. Defaults to `"default"`. */
  variant?: "default" | "line";
  /** Vertical spacing between fields inside each tab. Defaults to `"md"`. */
  spacing?: "sm" | "md" | "lg";
  /**
   * Show an error-count badge on tabs that contain invalid fields.
   * Defaults to `true`.
   *
   * > **Note:** Tabs are purely layout — they do not create a data namespace.
   * > All fields across all tabs share the same flat data scope.
   * > If you need tab-namespaced data (e.g. `{ profile: {}, settings: {} }`),
   * > wrap each tab's fields in a `group` field with the desired `name`.
   */
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
  tab,
  value,
  showErrorBadge,
  basePath,
}: {
  tab: Tab;
  value: string;
  showErrorBadge: boolean;
  basePath: string;
}) {
  const errorCount = useNestedErrorCount(tab.fields, basePath);
  const isDisabled = tab.disabled === true;

  return (
    <TabsTrigger value={value} disabled={isDisabled}>
      <span className="flex items-center gap-1.5">
        <span>{value}</span>
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
  const { field, form, fieldPath, formData, contextData } =
    useLayoutField<TabsFieldDef>();

  const tabs = field.tabs ?? [];
  if (tabs.length === 0) return null;

  const ui = field.ui as TabsUi | undefined;
  const variant = ui?.variant ?? "default";
  const spacing = ui?.spacing ?? "md";
  const showErrorBadge = ui?.showErrorBadge !== false;

  const resolveLabel = (label: unknown): string =>
    (resolveDynamicValue(label as string, formData, contextData) as string) || "Tab";

  // Resolve tab labels (used as Tabs `value` keys)
  const tabLabels = tabs.map((tab) => resolveLabel(tab.label));

  // Resolve defaultTab
  const rawDefault = ui?.defaultTab;
  let defaultValue: string;
  if (typeof rawDefault === "string") {
    // Match by label
    defaultValue = tabLabels.includes(rawDefault) ? rawDefault : (tabLabels[0] ?? "");
  } else if (typeof rawDefault === "number") {
    defaultValue = tabLabels[rawDefault] ?? tabLabels[0] ?? "";
  } else {
    // First non-disabled tab
    const firstEnabled = tabs.findIndex((t) => t.disabled !== true);
    defaultValue = tabLabels[firstEnabled >= 0 ? firstEnabled : 0] ?? "";
  }

  const basePath = toDotNotation(fieldPath);

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList variant={variant} className="w-full justify-start">
        {tabs.map((tab, i) => (
          <TabTriggerWithBadge
            key={i}
            tab={tab}
            value={tabLabels[i] ?? String(i)}
            showErrorBadge={showErrorBadge}
            basePath={basePath}
          />
        ))}
      </TabsList>

      {tabs.map((tab, i) => (
        <TabsContent
          key={i}
          value={tabLabels[i] ?? String(i)}
          className={cn("mt-4", spacingClass[spacing])}
        >
          <RenderFields
            fields={tab.fields}
            form={form}
            basePath={basePath}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
