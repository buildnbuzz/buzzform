"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconPlaceholder } from "@/components/icon-placeholder";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 relative group/item"
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity"
      >
        <IconPlaceholder
          lucide="GripVertical"
          hugeicons="DragDropVerticalIcon"
          tabler="IconGripVertical"
          phosphor="DotsSixVertical"
          remixicon="RiDragMove2Line"
          size={20}
        />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
