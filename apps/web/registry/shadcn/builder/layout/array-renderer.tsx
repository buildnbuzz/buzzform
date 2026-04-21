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
import { Badge } from "@/components/ui/badge";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  DEFAULT_SLOT,
  useBuilderStore,
  type BuilderNodeRendererProps,
} from "@buildnbuzz/form-builder-react";
import type { ArrayField } from "@buildnbuzz/form-core";

/**
 * Visual renderer for 'array' layout fields.
 * Wraps repeating items with min/max indicator limits securely resolving DnD sorting wrappers context.
 */
export const ArrayRenderer = ({
  id,
  field,
  childrenIds,
  renderSlot,
}: BuilderNodeRendererProps) => {
  const arrayField = field as ArrayField;
  const rawField = arrayField as unknown as Record<string, unknown>;
  const uiConfig = (arrayField.ui as Record<string, unknown> | undefined) ?? {};
  const defaultCollapsed = (uiConfig.collapsed as boolean | undefined) ?? false;
  const minItems = arrayField.minItems;
  const maxItems = arrayField.maxItems;

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
    data: { type: "array", parentId: id, parentSlot: DEFAULT_SLOT },
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
            Drop fields for each array item
          </span>
        </div>
      ) : (
        <div className="space-y-3">{renderSlot(DEFAULT_SLOT)}</div>
      )}
    </div>
  );

  return (
    <Collapsible open={!isCollapsed} onOpenChange={() => toggleCollapsed(id)}>
      <Card className="w-full py-0 gap-0 border-dashed">
        <CardHeader className="p-0 border-b-0">
          <CollapsibleTrigger
            className={cn(
              "w-full px-4 py-3 flex flex-row items-center justify-between",
              "hover:bg-muted/75 bg-muted/50 transition-colors select-none cursor-pointer",
              !isCollapsed && "border-b",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <IconPlaceholder
                lucide="Menu"
                hugeicons="Menu01Icon"
                size={16}
                className="text-muted-foreground shrink-0"
              />
              <span className="text-sm font-semibold truncate">
                {(rawField.label as string) || "Array"}
              </span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {childrenIds.length}{" "}
                {childrenIds.length === 1 ? "field" : "fields"}
              </Badge>
              {typeof minItems === "number" && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground"
                >
                  min {minItems}
                </Badge>
              )}
              {typeof maxItems === "number" && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground"
                >
                  max {maxItems}
                </Badge>
              )}
            </div>

            <IconPlaceholder
              lucide="ChevronDown"
              hugeicons="ArrowDown01Icon"
              size={16}
              className={cn(
                "text-muted-foreground transition-transform duration-200 shrink-0",
                isCollapsed && "-rotate-90",
              )}
            />
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-4">
            {!!rawField.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {rawField.description as string}
              </p>
            )}
            {renderDropZone()}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
