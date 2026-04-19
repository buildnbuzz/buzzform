"use client";

import React from "react";
import { useBuilderStore, SortableNode } from "@buildnbuzz/form-builder-react";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Node } from "@buildnbuzz/form-builder-core";

interface NodeWrapperProps {
  node: Node;
  children: React.ReactNode;
}

/**
 * Visual frame for canvas nodes.
 * Provides selection states, drag handling, and a contextual toolbar.
 */
export const NodeWrapper = ({ node, children }: NodeWrapperProps) => {
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectNode = useBuilderStore((s) => s.selectNode);
  const removeNode = useBuilderStore((s) => s.removeNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);

  const isSelected = selectedId === node.id;

  return (
    <SortableNode
      id={node.id}
      render={({ setNodeRef, attributes, listeners, style, isDragging }) => (
        <div
          ref={setNodeRef}
          style={style}
          onClick={(e) => {
            e.stopPropagation();
            selectNode(node.id);
          }}
          className={cn(
            "relative group/node my-2 rounded-xl border-2 border-transparent transition-all duration-200",
            isSelected && "border-primary bg-primary/2 shadow-sm",
            !isSelected && "hover:border-primary/20",
            isDragging && "opacity-30",
          )}
        >
          {/* Node Toolbar - visible on hover or selection */}
          <div
            className={cn(
              "absolute -top-4 right-2 z-30 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md transition-opacity duration-200",
              isSelected
                ? "opacity-100"
                : "opacity-0 group-hover/node:opacity-100",
            )}
          >
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-foreground"
            >
              <IconPlaceholder
                lucide="GripVertical"
                hugeicons="Menu01Icon"
                size={14}
              />
            </div>

            <div className="h-4 w-px bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                duplicateNode(node.id);
              }}
            >
              <IconPlaceholder lucide="Copy" hugeicons="Copy01Icon" size={14} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeNode(node.id);
              }}
            >
              <IconPlaceholder
                lucide="Trash2"
                hugeicons="Delete02Icon"
                size={14}
              />
            </Button>
          </div>

          {/* Node Content */}
          <div
            className={cn(
              "p-1 transition-all duration-200",
              isSelected ? "p-3" : "p-1",
            )}
          >
            {children}
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute -left-0.5 top-0 bottom-0 w-1 rounded-l-full bg-primary" />
          )}
        </div>
      )}
    />
  );
};
