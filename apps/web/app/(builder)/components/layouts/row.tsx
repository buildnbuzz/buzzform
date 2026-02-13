"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { EditableNode } from "../editable-node";
import { HugeiconsIcon } from "@hugeicons/react";
import { RowInsertIcon } from "@hugeicons/core-free-icons";
import type { RowField } from "@buildnbuzz/buzzform";
import { useDropIndicatorIndex } from "../../hooks/use-drop-indicator-index";

interface RowLayoutProps {
  id: string;
  field: RowField;
  childrenIds: string[];
}

export function RowLayout({ id, childrenIds }: RowLayoutProps) {
  const indicatorIndex = useDropIndicatorIndex(id);

  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-dropzone`,
    data: { type: "row", parentId: id, parentSlot: null },
  });

  const isEmpty = childrenIds.length === 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        <HugeiconsIcon icon={RowInsertIcon} size={14} strokeWidth={1.5} />
        <span className="text-xs font-medium">Row</span>
      </div>

      {/* Drop zone container */}
      <div
        ref={setNodeRef}
        data-container-padding
        className={cn(
          "flex flex-row gap-3 p-3 min-h-16 rounded-lg border-2 border-dashed transition-colors",
          isEmpty ? "items-center justify-center" : "items-stretch",
          isOver
            ? "border-primary/50 bg-primary/5"
            : "border-muted-foreground/20 bg-muted/30 hover:border-muted-foreground/30",
        )}
      >
        {isEmpty ? (
          <div className="text-muted-foreground text-sm italic">
            Drop fields here
          </div>
        ) : (
          <SortableContext
            items={childrenIds}
            strategy={horizontalListSortingStrategy}
          >
            {childrenIds.map((childId, index) => (
              <>
                {indicatorIndex === index && (
                  <DropLineVertical key={`indicator-${index}`} />
                )}
                <EditableNode key={childId} id={childId} />
              </>
            ))}
            {indicatorIndex === childrenIds.length && <DropLineVertical />}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

function DropLineVertical() {
  return <div className="w-1 self-stretch bg-primary rounded-full shrink-0" />;
}
