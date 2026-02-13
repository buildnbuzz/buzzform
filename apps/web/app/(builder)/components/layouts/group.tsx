"use client";

import { useState } from "react";
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
import { FolderIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { GroupField } from "@buildnbuzz/buzzform";
import { useDropIndicatorIndex } from "../../hooks/use-drop-indicator-index";

interface GroupLayoutProps {
  id: string;
  field: GroupField;
  childrenIds: string[];
}

const spacingMap = {
  sm: "space-y-2",
  md: "space-y-3",
  lg: "space-y-4",
} as const;

export function GroupLayout({ id, field, childrenIds }: GroupLayoutProps) {
  const { label } = field;
  const variant = field.ui?.variant ?? "card";
  const spacing = field.ui?.spacing ?? "md";
  const defaultCollapsed = field.ui?.collapsed ?? false;
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const indicatorIndex = useDropIndicatorIndex(id);

  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-dropzone`,
    data: { type: "group", parentId: id, parentSlot: null },
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

  // === FLAT VARIANT ===
  if (variant === "flat") {
    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center gap-2 mb-2">
            <HugeiconsIcon
              icon={FolderIcon}
              size={14}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <span className="font-medium text-sm text-foreground">{label}</span>
          </div>
        )}
        <div className="pl-1">{renderDropZone()}</div>
      </div>
    );
  }

  // === GHOST VARIANT ===
  if (variant === "ghost") {
    return (
      <div className="w-full border border-border/50 rounded-lg p-4">
        {label && (
          <div className="flex items-center gap-2 mb-3">
            <HugeiconsIcon
              icon={FolderIcon}
              size={14}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <span className="font-medium text-sm text-foreground">{label}</span>
          </div>
        )}
        {renderDropZone()}
      </div>
    );
  }

  // === BORDERED VARIANT ===
  if (variant === "bordered") {
    return (
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
      >
        <div className="w-full border border-dashed border-border rounded-lg overflow-hidden">
          {label && (
            <CollapsibleTrigger
              className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FolderIcon}
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <span className="font-medium text-muted-foreground text-sm">
                  {label}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "text-muted-foreground transition-transform duration-200",
                  isCollapsed && "-rotate-90",
                )}
              />
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <div className="px-4 pt-2 pb-4">{renderDropZone()}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // === CARD VARIANT (DEFAULT) ===
  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(open) => setIsCollapsed(!open)}
    >
      <Card className="w-full py-0 gap-0">
        {label && (
          <CardHeader className="p-0 border-b-0">
            <CollapsibleTrigger
              className={cn(
                "w-full px-4 py-3 flex flex-row items-center justify-between",
                "hover:bg-muted/75 bg-muted/50 transition-colors select-none cursor-pointer",
                !isCollapsed && "border-b",
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FolderIcon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={16}
                strokeWidth={1.5}
                className={cn(
                  "text-muted-foreground transition-transform duration-200",
                  isCollapsed && "-rotate-90",
                )}
              />
            </CollapsibleTrigger>
          </CardHeader>
        )}
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
