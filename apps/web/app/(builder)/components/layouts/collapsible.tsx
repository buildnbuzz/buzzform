"use client";

import { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { EditableNode } from "../editable-node";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowShrink02Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { CollapsibleField } from "@buildnbuzz/buzzform";
import { useDropIndicatorIndex } from "../../hooks/use-drop-indicator-index";
import { useBuilderStore } from "../../lib/store";

interface CollapsibleLayoutProps {
  id: string;
  field: CollapsibleField;
  childrenIds: string[];
}

const spacingMap = {
  sm: "space-y-2",
  md: "space-y-3",
  lg: "space-y-4",
} as const;

export function CollapsibleLayout({
  id,
  field,
  childrenIds,
}: CollapsibleLayoutProps) {
  const { label } = field;
  const variant = field.ui?.variant ?? "bordered";
  const spacing = field.ui?.spacing ?? "md";
  const defaultCollapsed = field.collapsed ?? false;

  // Read collapsed state from store; initialize from field default on first encounter
  const isCollapsed = useBuilderStore(
    (s) => s.collapsedNodes[id] ?? defaultCollapsed,
  );
  const toggleCollapsed = useBuilderStore((s) => s.toggleCollapsed);
  const setCollapsed = useBuilderStore((s) => s.setCollapsed);

  // Sync initial field default into store on first mount
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (defaultCollapsed) {
        setCollapsed(id, true);
      }
    }
  }, [id, defaultCollapsed, setCollapsed]);

  const indicatorIndex = useDropIndicatorIndex(id);

  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-dropzone`,
    data: { type: "collapsible", parentId: id, parentSlot: null },
  });

  const isEmpty = childrenIds.length === 0;

  const renderDropZone = () => (
    <div
      ref={setNodeRef}
      data-container-padding
      className={cn("min-h-16 transition-colors", isOver && "bg-primary/5")}
    >
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
            Drop fields here
          </span>
        </div>
      ) : (
        <SortableContext
          items={childrenIds}
          strategy={verticalListSortingStrategy}
        >
          <div className={cn(spacingMap[spacing ?? "md"])}>
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

  const renderHeaderContent = () => (
    <div className="flex-1 min-w-0 flex items-center gap-2">
      <HugeiconsIcon
        icon={ArrowShrink02Icon}
        size={16}
        strokeWidth={1.5}
        className="text-muted-foreground shrink-0"
      />
      <span
        className={cn(
          "text-sm truncate",
          variant === "card" ? "font-semibold" : "font-medium",
        )}
      >
        {label || "Collapsible"}
      </span>
      {!isEmpty && (
        <span className="text-xs text-muted-foreground">
          ({childrenIds.length} {childrenIds.length === 1 ? "field" : "fields"})
        </span>
      )}
    </div>
  );

  const renderChevron = (size: number = 16) => (
    <HugeiconsIcon
      icon={ArrowDown01Icon}
      size={size}
      strokeWidth={1.5}
      className={cn(
        "text-muted-foreground transition-transform duration-200 shrink-0",
        isCollapsed && "-rotate-90",
      )}
    />
  );

  // === GHOST VARIANT ===
  if (variant === "ghost") {
    return (
      <Collapsible open={!isCollapsed} onOpenChange={() => toggleCollapsed(id)}>
        <div className="w-full">
          <CollapsibleTrigger className="w-full px-2 py-2 rounded-md flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer">
            {renderHeaderContent()}
            {renderChevron(14)}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-3 pl-2">{renderDropZone()}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // === BORDERED VARIANT (DEFAULT) ===
  if (variant === "bordered" || variant === "flat") {
    return (
      <Collapsible open={!isCollapsed} onOpenChange={() => toggleCollapsed(id)}>
        <div className="w-full border border-dashed border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer">
            {renderHeaderContent()}
            {renderChevron(14)}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pt-2 pb-4">{renderDropZone()}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // === CARD VARIANT ===
  return (
    <Collapsible open={!isCollapsed} onOpenChange={() => toggleCollapsed(id)}>
      <Card className="w-full py-0 gap-0">
        <CardHeader className="p-0 border-b-0">
          <CollapsibleTrigger
            className={cn(
              "w-full px-4 py-3 flex flex-row items-center justify-between",
              "hover:bg-muted/75 bg-muted/50 transition-colors select-none cursor-pointer",
              !isCollapsed && "border-b",
            )}
          >
            {renderHeaderContent()}
            {renderChevron()}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-4">{renderDropZone()}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function DropLine() {
  return <div className="h-1 bg-primary rounded-full my-1" />;
}
