"use client";

import React, { useMemo, useEffect } from "react";
import {
  useBuilderStore,
  type BuilderNodeRendererProps,
} from "@buildnbuzz/form-builder-react";
import { getTabSlotKeys } from "@buildnbuzz/form-builder-core";
import { useDroppable } from "@dnd-kit/core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";
import type { TabsField, Tab } from "@buildnbuzz/form-core";

function getTabDisplayLabel(tab: Tab, index: number) {
  const label = tab.label;
  if (typeof label === "string" && label.trim().length > 0) {
    return label;
  }
  if (typeof label === "number") {
    return String(label);
  }
  return `Tab ${index + 1}`;
}

interface TabDropZoneProps {
  containerId: string;
  slot: string;
  tab: Tab;
  childrenIds: string[];
  renderSlot: (slot: string) => React.ReactNode;
}

function TabDropZone({
  containerId,
  slot,
  tab,
  childrenIds,
  renderSlot,
}: TabDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${containerId}::tab::${encodeURIComponent(slot)}-dropzone`,
    data: { type: "tabs", parentId: containerId, parentSlot: slot },
  });

  const isEmpty = childrenIds.length === 0;
  const description = (tab as unknown as Record<string, unknown>).description;

  return (
    <div
      ref={setNodeRef}
      data-container-padding
      className={cn("min-h-16 transition-colors", isOver && "bg-primary/5")}
    >
      {typeof description === "string" && description && (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      )}

      {isEmpty ? (
        <div
          className={cn(
            "h-16 flex items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            isOver
              ? "border-primary/50 bg-primary/5"
              : "border-muted-foreground/20 bg-muted/30",
          )}
        >
          <span className="text-muted-foreground text-sm italic">
            Drop fields in this tab
          </span>
        </div>
      ) : (
        renderSlot(slot)
      )}
    </div>
  );
}

/**
 * Visual renderer for 'tabs' fields.
 * Orchestrates multiple slots as tabs.
 */
export const TabsRenderer = ({
  id,
  field,
  renderSlot,
}: BuilderNodeRendererProps) => {
  const tabsField = field as TabsField;
  const tabs = useMemo(() => tabsField.tabs ?? [], [tabsField.tabs]);
  const slots = useMemo(() => getTabSlotKeys(tabs), [tabs]);

  const activeSlotFromStore = useBuilderStore(
    (state) => state.activeTabs[id] ?? null,
  );
  const setActiveTab = useBuilderStore((state) => state.setActiveTab);
  const tabChildren = useBuilderStore(
    (state) => state.nodes[id]?.children ?? {},
  );

  const defaultSlot = useMemo(() => {
    if (slots.length === 0) return "";
    const configuredDefault = tabsField.ui?.defaultTab;
    const enabledSlots = slots.filter(
      (_, index) => tabs[index]?.disabled !== true,
    );
    const enabledFallbackSlot = enabledSlots[0] ?? slots[0];

    if (typeof configuredDefault === "number") {
      const index = Math.max(0, Math.min(slots.length - 1, configuredDefault));
      return tabs[index]?.disabled === true
        ? enabledFallbackSlot
        : slots[index];
    }

    if (typeof configuredDefault === "string") {
      const index = tabs.findIndex((tab) => tab.name === configuredDefault);
      if (index >= 0 && tabs[index]?.disabled !== true) {
        return slots[index];
      }
    }

    return enabledFallbackSlot;
  }, [tabsField.ui?.defaultTab, tabs, slots]);

  const activeSlot =
    activeSlotFromStore && slots.includes(activeSlotFromStore)
      ? activeSlotFromStore
      : defaultSlot;

  useEffect(() => {
    if (!activeSlot) return;
    if (activeSlotFromStore !== activeSlot) {
      setActiveTab(id, activeSlot);
    }
  }, [activeSlot, activeSlotFromStore, id, setActiveTab]);

  if (tabs.length === 0) {
    return (
      <div className="w-full rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <IconPlaceholder lucide="Layout" hugeicons="Layout01Icon" size={14} />
          <span className="text-xs font-medium">Tabs</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Add at least one tab in the properties panel.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        <IconPlaceholder lucide="Layout" hugeicons="Layout01Icon" size={14} />
        <span className="text-xs font-medium">Tabs</span>
      </div>

      <Tabs
        value={activeSlot}
        onValueChange={(val) => val && setActiveTab(id, val)}
        className="w-full"
      >
        <TabsList
          variant={(tabsField.ui?.variant as "line" | "default") ?? "line"}
          className="w-full justify-start"
        >
          {tabs.map((tab, index) => {
            const slot = slots[index];
            const childCount = tabChildren[slot]?.length ?? 0;

            return (
              <TabsTrigger
                key={slot}
                value={slot}
                className={cn(
                  tab.disabled &&
                    "opacity-80 text-muted-foreground data-[state=active]:text-muted-foreground",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{getTabDisplayLabel(tab, index)}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {childCount}
                  </Badge>
                  {tab.disabled && (
                    <IconPlaceholder
                      lucide="Ban"
                      hugeicons="BlockedIcon"
                      size={12}
                      className="text-muted-foreground/70"
                    />
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab, index) => {
          const slot = slots[index];
          const childrenIdsForSlot = tabChildren[slot] || [];

          return (
            <TabsContent key={slot} value={slot} className="mt-4">
              {tab.name && (
                <p className="text-xs text-muted-foreground mb-2">
                  Key: <code className="font-mono">{tab.name}</code>
                  {tab.disabled && (
                    <Badge
                      variant="outline"
                      className="ml-2 h-5 gap-1 border-muted-foreground/20 bg-muted/50 px-1.5 text-[10px] font-normal text-muted-foreground"
                    >
                      <IconPlaceholder
                        lucide="Ban"
                        hugeicons="BlockedIcon"
                        size={12}
                      />
                      Disabled
                    </Badge>
                  )}
                </p>
              )}
              <TabDropZone
                containerId={id}
                slot={slot}
                tab={tab}
                childrenIds={childrenIdsForSlot}
                renderSlot={renderSlot}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
