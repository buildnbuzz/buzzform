"use client";

import { useDroppable } from "@dnd-kit/core";
import { horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  DEFAULT_SLOT,
  type BuilderNodeRendererProps,
} from "@buildnbuzz/form-builder-react";

/**
 * Visual renderer for 'row' layout fields.
 * Displays children in a horizontal grid.
 */
export const RowRenderer = ({
  id,
  renderSlot,
  childrenIds,
}: BuilderNodeRendererProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-dropzone`,
    data: { type: "row", parentId: id, parentSlot: DEFAULT_SLOT },
  });

  const isEmpty = childrenIds.length === 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        <IconPlaceholder lucide="Columns" hugeicons="InsertRowDownIcon" size={14} />
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
          renderSlot(DEFAULT_SLOT, horizontalListSortingStrategy)
        )}
      </div>
    </div>
  );
};
