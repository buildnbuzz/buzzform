"use client";

import { BuilderNode, useBuilderStore } from "@buildnbuzz/form-builder-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CoreField as Field, TabsField } from "@buildnbuzz/form-react";

interface TabsRendererProps {
  id: string;
  field: Field;
}

/**
 * Visual renderer for 'tabs' fields.
 * Orchestrates multiple slots as tabs.
 */
export const TabsRenderer = ({ id, field }: TabsRendererProps) => {
  const tabsField = field as TabsField;
  const tabs = tabsField.tabs || [];

  const activeTab = useBuilderStore((s) => s.activeTabs[id] || "__tab_0");
  const setActiveTab = useBuilderStore((s) => s.setActiveTab);

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(val) => val && setActiveTab(id, val as string)}
        className="w-full"
      >
        <TabsList className="mb-4">
          {tabs.map((tab, i) => (
            <TabsTrigger key={i} value={`__tab_${i}`}>
              {typeof tab.label === "string" ? tab.label : `Tab ${i + 1}`}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((_, i) => (
          <TabsContent
            key={i}
            value={`__tab_${i}`}
            className="min-h-25 rounded-lg border border-dashed p-4"
          >
            <BuilderNode
              id={id}
              render={({ renderSlot }) => renderSlot(`__tab_${i}`)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
