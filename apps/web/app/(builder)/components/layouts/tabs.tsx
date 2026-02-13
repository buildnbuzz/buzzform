"use client";

import React from "react";
import type { Tab, TabsField as TabsFieldType } from "@buildnbuzz/buzzform";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "../../lib/store";
import { EditableNode } from "../editable-node";
import { getTabSlotKeys } from "../../lib/node-children";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layout01Icon, BlockedIcon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { useDropIndicatorIndex } from "../../hooks/use-drop-indicator-index";

interface TabsLayoutProps {
  id: string;
  field: TabsFieldType;
  childrenIds: string[];
}

const spacingMap = {
  sm: "space-y-2",
  md: "space-y-3",
  lg: "space-y-4",
} as const;

function getTabDisplayLabel(tab: Tab, index: number) {
  if (typeof tab.label === "string" && tab.label.trim().length > 0) {
    return tab.label;
  }

  if (typeof tab.label === "number") {
    return String(tab.label);
  }

  return `Tab ${index + 1}`;
}

function DropLine() {
  return <div className="h-1 bg-primary rounded-full my-1" />;
}

function TabDropZone({
  containerId,
  slot,
  tab,
  spacing,
}: {
  containerId: string;
  slot: string;
  tab: Tab;
  spacing: keyof typeof spacingMap;
}) {
  const childrenIds = useBuilderStore(
    (state) => state.nodes[containerId]?.tabChildren?.[slot] ?? [],
  );
  const indicatorIndex = useDropIndicatorIndex(containerId, slot);

  const { setNodeRef, isOver } = useDroppable({
    id: `${containerId}::tab::${encodeURIComponent(slot)}-dropzone`,
    data: { type: "tabs", parentId: containerId, parentSlot: slot },
  });

  const isEmpty = childrenIds.length === 0;

  return (
    <div
      ref={setNodeRef}
      data-container-padding
      className={cn("min-h-16 transition-colors", isOver && "bg-primary/5")}
    >
      {tab.description && (
        <p className="text-sm text-muted-foreground mb-3">{tab.description}</p>
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
        <SortableContext
          items={childrenIds}
          strategy={verticalListSortingStrategy}
        >
          <div className={cn(spacingMap[spacing])}>
            {childrenIds.map((childId, index) => (
              <div key={childId}>
                {indicatorIndex === index && <DropLine />}
                <EditableNode id={childId} />
              </div>
            ))}
            {indicatorIndex === childrenIds.length && <DropLine />}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

export function TabsLayout({ id, field }: TabsLayoutProps) {
  const tabs = React.useMemo(() => field.tabs ?? [], [field.tabs]);
  const slots = React.useMemo(() => getTabSlotKeys(tabs), [tabs]);
  const tabChildren = useBuilderStore(
    (state) => state.nodes[id]?.tabChildren ?? {},
  );
  const activeSlotFromStore = useBuilderStore(
    (state) => state.activeTabs[id] ?? null,
  );
  const setActiveTab = useBuilderStore((state) => state.setActiveTab);

  const defaultSlot = React.useMemo(() => {
    if (slots.length === 0) return "";

    const configuredDefault = field.ui?.defaultTab;
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
  }, [field.ui?.defaultTab, tabs, slots]);

  const activeSlot =
    activeSlotFromStore && slots.includes(activeSlotFromStore)
      ? activeSlotFromStore
      : defaultSlot;

  React.useEffect(() => {
    if (!activeSlot) return;
    if (activeSlotFromStore !== activeSlot) {
      setActiveTab(id, activeSlot);
    }
  }, [activeSlot, activeSlotFromStore, id, setActiveTab]);

  if (tabs.length === 0) {
    return (
      <div className="w-full rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <HugeiconsIcon icon={Layout01Icon} size={14} strokeWidth={1.5} />
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
        <HugeiconsIcon icon={Layout01Icon} size={14} strokeWidth={1.5} />
        <span className="text-xs font-medium">Tabs</span>
      </div>

      <Tabs
        value={activeSlot}
        onValueChange={(value) => setActiveTab(id, value)}
        className="w-full"
      >
        <TabsList
          variant={field.ui?.variant ?? "line"}
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
                    <HugeiconsIcon
                      icon={BlockedIcon}
                      size={12}
                      strokeWidth={1.7}
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
          const spacing = field.ui?.spacing ?? "md";

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
                      <HugeiconsIcon
                        icon={BlockedIcon}
                        size={12}
                        strokeWidth={1.7}
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
                spacing={spacing}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
