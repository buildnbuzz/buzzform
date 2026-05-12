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
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  DEFAULT_SLOT,
  useBuilderStore,
  type BuilderNodeRendererProps,
} from "@buildnbuzz/form-builder-react";

const spacingMap = {
  sm: "space-y-2",
  md: "space-y-3",
  lg: "space-y-4",
};

/**
 * Visual renderer for 'collapsible' container fields.
 * Includes multiple UI variants natively integrated with builder store state tracking.
 */
export const CollapsibleRenderer = ({
  id,
  field,
  childrenIds,
  renderSlot,
}: BuilderNodeRendererProps) => {
  const rawField = field as unknown as Record<string, unknown>;
  const uiConfig = (rawField.ui as Record<string, unknown> | undefined) ?? {};

  const label = rawField.label as string | undefined;
  const variant =
    (uiConfig.variant as "ghost" | "bordered" | "card" | "flat" | undefined) ??
    "bordered";
  const spacingConfig = uiConfig.spacing as string | undefined;
  const spacingExtracted =
    spacingConfig && spacingConfig in spacingMap
      ? (spacingConfig as keyof typeof spacingMap)
      : "md";

  const defaultCollapsed = (rawField.collapsed as boolean | undefined) ?? false;

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
    data: { type: "collapsible", parentId: id, parentSlot: DEFAULT_SLOT },
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
        <div className={cn(spacingMap[spacingExtracted])}>
          {renderSlot(DEFAULT_SLOT)}
        </div>
      )}
    </div>
  );

  const renderHeaderContent = () => (
    <div className="flex-1 min-w-0 flex items-center gap-2">
      <IconPlaceholder
        lucide="FoldVertical"
        hugeicons="ArrowShrink02Icon"
        size={16}
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
    <IconPlaceholder
      lucide="ChevronDown"
      hugeicons="ArrowDown01Icon"
      size={size}
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
};
