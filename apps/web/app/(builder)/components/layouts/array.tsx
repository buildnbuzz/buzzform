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
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { ArrayField } from "@buildnbuzz/buzzform";
import { useDropIndicatorIndex } from "../../hooks/use-drop-indicator-index";
import { useBuilderStore } from "../../lib/store";

interface ArrayLayoutProps {
  id: string;
  field: ArrayField;
  childrenIds: string[];
}

export function ArrayLayout({ id, field, childrenIds }: ArrayLayoutProps) {
  const defaultCollapsed = field.ui?.collapsed ?? false;

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

  const indicatorIndex = useDropIndicatorIndex(id);

  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-dropzone`,
    data: { type: "array", parentId: id, parentSlot: null },
  });

  const isEmpty = childrenIds.length === 0;
  const addLabel = field.ui?.addLabel ?? "Add Item";

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
        <SortableContext
          items={childrenIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
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
              <HugeiconsIcon
                icon={Menu01Icon}
                size={16}
                strokeWidth={1.5}
                className="text-muted-foreground shrink-0"
              />
              <span className="text-sm font-semibold truncate">
                {field.label || "Array"}
              </span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {childrenIds.length}{" "}
                {childrenIds.length === 1 ? "field" : "fields"}
              </Badge>
              {typeof field.minRows === "number" && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground"
                >
                  min {field.minRows}
                </Badge>
              )}
              {typeof field.maxRows === "number" && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-muted-foreground"
                >
                  max {field.maxRows}
                </Badge>
              )}
            </div>

            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              strokeWidth={1.5}
              className={cn(
                "text-muted-foreground transition-transform duration-200 shrink-0",
                isCollapsed && "-rotate-90",
              )}
            />
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-4">
            {field.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {field.description}
              </p>
            )}
            {renderDropZone()}
            <p className="text-xs text-muted-foreground mt-3">
              Add button label: <span className="font-medium">{addLabel}</span>
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function DropLine() {
  return <div className="h-1 bg-primary rounded-full my-1" />;
}
