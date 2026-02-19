"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "../lib/store";
import { builderFieldRegistry } from "../lib/registry";
import { NodeActionsToolbar } from "./node-actions-toolbar";
import { isContainerType, isDataField } from "../lib/types";
import { FieldRenderer } from "@/registry/base/fields/render";
import { useFormContext } from "./builder-form-context";
import type { Field } from "@buildnbuzz/buzzform";
import { Badge } from "@/components/ui/badge";

// EditableNode: Edit mode wrapper with DnD, selection, and toolbar
export const EditableNode = React.memo(function EditableNode({
  id,
}: {
  id: string;
}) {
  const node = useBuilderStore((s) => s.nodes[id]);
  const { form } = useFormContext();
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const selectNode = useBuilderStore((s) => s.selectNode);
  const removeNode = useBuilderStore((s) => s.removeNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);
  const isSelected = useBuilderStore((s) => s.selectedId === id);

  if (!node) return null;

  const isHidden = isDataField(node.field) && node.field.hidden === true;

  const fieldStyle = "style" in node.field ? node.field.style : undefined;
  const fieldWidth = fieldStyle?.width;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isHidden && {
      backgroundImage:
        "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.05) 10px, rgba(128,128,128,0.05) 20px)",
    }),
    ...(fieldWidth && fieldWidth !== "auto"
      ? { width: fieldWidth, flex: "0 0 auto" }
      : { flex: "1 1 0%", minWidth: 0 }),
  };

  const fieldType = node.field.type;
  const isContainer = isContainerType(fieldType);
  const entry = builderFieldRegistry[fieldType];

  const path = "name" in node.field ? node.field.name : id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(id);
  };

  // Layout containers (WYSIWYG)
  const renderLayoutContent = () => {
    if (entry?.renderer) {
      const Renderer = entry.renderer;
      const fieldOverrides = isDataField(node.field) ? { hidden: false } : {};
      return (
        <Renderer
          id={id}
          field={{ ...node.field, ...fieldOverrides }}
          childrenIds={node.children}
        />
      );
    }
    return null;
  };

  // Data fields (disabled preview)
  const renderFieldContent = () => {
    // Override width to 100% so field fills the wrapper (width is applied to wrapper)
    const styleOverride = fieldStyle
      ? { ...fieldStyle, width: "100%" }
      : { width: "100%" };

    const fieldWithOverrides = isDataField(node.field)
      ? {
          ...node.field,
          disabled: true,
          readOnly: true,
          hidden: false,
          style: styleOverride,
        }
      : { ...node.field, disabled: true, readOnly: true, style: styleOverride };

    return (
      <FieldRenderer
        field={fieldWithOverrides as Field}
        path={path}
        form={form}
      />
    );
  };

  const actionToolbar = (
    <div
      className={cn(
        "absolute right-2 top-2 z-20",
        "transition-all duration-200",
        isSelected || isHovered
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <NodeActionsToolbar
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </div>
  );

  const wrapperClasses = cn(
    "relative mb-2 touch-none rounded-lg border transition-all",
    "hover:p-2",
    isSelected
      ? "border-primary/50 ring-2 ring-primary/10 p-2 bg-primary/5"
      : "border-transparent",
    !isSelected && "hover:border-border/40",
    isHidden && "opacity-60 grayscale border-dashed border-muted-foreground/30",
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-id={id}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={wrapperClasses}
    >
      {actionToolbar}

      {/* Content - disabled pointer events for non-containers */}
      <div
        className={cn("relative w-full", !isContainer && "pointer-events-none")}
      >
        {isHidden && (
          <Badge
            className="absolute bottom-1.5 right-2 z-10 select-none bg-background/80 backdrop-blur-sm"
            variant="outline"
          >
            Hidden
          </Badge>
        )}

        {isContainer ? renderLayoutContent() : renderFieldContent()}
      </div>
    </div>
  );
});
