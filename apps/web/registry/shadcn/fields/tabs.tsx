"use client";

import type { TabsField as TabsFieldDef } from "@buildnbuzz/form-core";
import { useLayoutField, RenderFields } from "@buildnbuzz/form-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toDotNotation, resolveDynamicValue } from "@buildnbuzz/form-core";

export function TabsField() {
  const { field, form, fieldPath, formData, contextData } = useLayoutField<TabsFieldDef>();
  const tabs = field.tabs || [];

  if (tabs.length === 0) return null;

  const resolveLabel = (label: any) => 
    (resolveDynamicValue(label, formData, contextData) as string) || "Tab";

  return (
    <Tabs defaultValue={resolveLabel(tabs[0]?.label)} className="w-full">
      <TabsList className="mb-4">
        {tabs.map((tab, index) => {
          const label = resolveLabel(tab.label);
          return (
            <TabsTrigger
              key={index}
              value={label}
              disabled={tab.disabled === true}
            >
              {label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab, index) => {
        const label = resolveLabel(tab.label);
        return (
          <TabsContent key={index} value={label} className="space-y-4">
            <RenderFields
              fields={tab.fields}
              form={form}
              basePath={toDotNotation(fieldPath)}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
