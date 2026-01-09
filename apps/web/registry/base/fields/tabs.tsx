"use client";

import * as React from "react";
import { getNestedFieldPaths } from "@buildnbuzz/buzzform";
import type {
  TabsField as TabsFieldType,
  Tab,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { cn } from "@/lib/utils";
import { FieldRenderer, type FieldRegistry } from "./render";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export interface TabsFieldComponentProps {
  field: TabsFieldType;
  path: string;
  form: FormAdapter;
  registry?: FieldRegistry;
  // Computed props
  fieldId: string;
  label: React.ReactNode | null;
  isDisabled: boolean;
  isReadOnly: boolean;
  error?: string;
  autoFocus?: boolean;
}

const spacingMap = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
} as const;

const useTabErrors = (
  form: FormAdapter,
  tab: Tab,
  basePath: string
): number => {
  const errors = form.formState.errors;

  const tabPath = tab.name
    ? basePath
      ? `${basePath}.${tab.name}`
      : tab.name
    : basePath;

  const nestedPaths = getNestedFieldPaths(tab.fields, tabPath);
  let errorCount = 0;

  for (const fieldPath of nestedPaths) {
    const error = errors[fieldPath];
    if (error) {
      errorCount++;
    }
  }

  return errorCount;
};

interface TabTriggerWithBadgeProps {
  tab: Tab;
  index: number;
  path: string;
  form: FormAdapter;
  showErrorBadge: boolean;
}

function TabTriggerWithBadge({
  tab,
  index,
  path,
  form,
  showErrorBadge,
}: TabTriggerWithBadgeProps) {
  const errorCount = useTabErrors(form, tab, path);

  return (
    <TabsTrigger
      value={String(index)}
      disabled={tab.disabled}
      className={cn(tab.disabled && "opacity-50 cursor-not-allowed")}
    >
      <span className="flex items-center gap-1.5">
        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
        <span>{tab.label}</span>
        {showErrorBadge && errorCount > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
            {errorCount}
          </Badge>
        )}
      </span>
    </TabsTrigger>
  );
}

export function TabsField({
  field,
  path,
  form,
  registry,
}: TabsFieldComponentProps) {
  const ui = field.ui;
  const defaultTab = ui?.defaultTab ?? 0;
  const showErrorBadge = ui?.showErrorBadge !== false;
  const variant = ui?.variant ?? "default";
  const spacing = ui?.spacing ?? "md";

  if (!field.tabs.length) return null;

  const resolvedDefaultTab =
    typeof defaultTab === "string"
      ? field.tabs.findIndex((t) => t.name === defaultTab)
      : defaultTab;

  const safeDefaultTab = Math.min(
    Math.max(0, resolvedDefaultTab === -1 ? 0 : resolvedDefaultTab),
    field.tabs.length - 1
  );

  return (
    <Tabs defaultValue={String(safeDefaultTab)} className="w-full">
      <TabsList variant={variant} className="w-full justify-start">
        {field.tabs.map((tab, i) => (
          <TabTriggerWithBadge
            key={i}
            tab={tab}
            index={i}
            path={path}
            form={form}
            showErrorBadge={showErrorBadge}
          />
        ))}
      </TabsList>

      {field.tabs.map((tab, i) => {
        const tabPath = tab.name
          ? path
            ? `${path}.${tab.name}`
            : tab.name
          : path;

        return (
          <TabsContent key={i} value={String(i)} className="mt-4">
            {tab.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {tab.description}
              </p>
            )}
            <div className={cn(spacingMap[spacing])}>
              {tab.fields.map((f, j) => {
                const nestedPath =
                  "name" in f
                    ? tabPath
                      ? `${tabPath}.${f.name}`
                      : f.name
                    : tabPath;

                return (
                  <FieldRenderer
                    key={j}
                    field={f}
                    path={nestedPath}
                    form={form}
                    registry={registry}
                  />
                );
              })}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export function TabsFieldSkeleton({ field }: { field: TabsFieldType }) {
  const spacing = field.ui?.spacing ?? "md";

  const renderNestedSkeletons = () => (
    <div className={cn(spacingMap[spacing])}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-4 p-1 bg-muted/50 rounded-lg w-fit">
        {field.tabs.slice(0, 4).map((tab, i) => (
          <div key={i} className="flex items-center gap-1.5 px-2">
            {tab.icon && <Skeleton className="h-4 w-4 rounded" />}
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        ))}
        {field.tabs.length > 4 && <Skeleton className="h-7 w-8 rounded-md" />}
      </div>

      {field.tabs[0]?.description && <Skeleton className="h-4 w-3/4 mb-4" />}
      {renderNestedSkeletons()}
    </div>
  );
}
