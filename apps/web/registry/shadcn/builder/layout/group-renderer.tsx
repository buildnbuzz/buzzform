"use client";

import { useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import { FolderIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { DEFAULT_SLOT, useBuilderStore, type BuilderNodeRendererProps } from "@buildnbuzz/form-builder-react";
import type { GroupField } from "@buildnbuzz/form-core";

const spacingMap = {
  sm: "space-y-2",
  md: "space-y-3",
  lg: "space-y-4",
} as const;

/**
 * Visual renderer for 'group' container fields.
 */
export const GroupRenderer = ({ id, field, renderSlot, childrenIds }: BuilderNodeRendererProps) => {
  const groupField = field as GroupField;
  const { label } = groupField;
  const variant = groupField.ui?.variant ?? "card";
  const spacing = (groupField.ui?.spacing as keyof typeof spacingMap) ?? "md";
  const defaultCollapsed = groupField.ui?.collapsed ?? false;

  const isCollapsed = useBuilderStore(
    (s) => s.collapsedNodes[id] ?? defaultCollapsed,
  );
  const toggleCollapsed = useBuilderStore((s) => s.toggleCollapsed);
  const setCollapsed = useBuilderStore((s) => s.setCollapsed);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (defaultCollapsed) {
        setCollapsed(id, true);
      }
    }
  }, [id, defaultCollapsed, setCollapsed]);

  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-dropzone`,
    data: { type: "group", parentId: id, parentSlot: DEFAULT_SLOT },
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
        <div className={cn(spacingMap[spacing])}>
          {renderSlot(DEFAULT_SLOT)}
        </div>
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
            <span className="font-medium text-sm text-foreground">{label as string}</span>
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
            <span className="font-medium text-sm text-foreground">{label as string}</span>
          </div>
        )}
        {renderDropZone()}
      </div>
    );
  }

  // === BORDERED VARIANT ===
  if (variant === "bordered") {
    return (
      <Collapsible open={!isCollapsed} onOpenChange={() => toggleCollapsed(id)}>
        <div className="w-full border border-dashed border-border rounded-lg overflow-hidden">
          {label && (
            <CollapsibleTrigger className="w-full px-4 py-2 flex flex-row items-center justify-between hover:bg-muted/50 transition-colors select-none cursor-pointer">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FolderIcon}
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <span className="font-medium text-muted-foreground text-sm">
                  {label as string}
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
    <Collapsible open={!isCollapsed} onOpenChange={() => toggleCollapsed(id)}>
      <Card className="w-full py-0 gap-0">
        {label && (
          <CardHeader className="p-0 border-b-0">
            <CollapsibleTrigger
              className={cn(
                "w-full px-4 py-3 flex flex-row items-center justify-between",
                "hover:bg-muted/75 bg-muted/50 transition-colors select-none cursor-pointer",
                !isCollapsed && "border-b",
              )}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FolderIcon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <span className="text-sm font-semibold">{label as string}</span>
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
};
