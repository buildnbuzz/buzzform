"use client";

import React, { useState } from "react";
import { useBuilderStore, SortableNode } from "@buildnbuzz/form-builder-react";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Node } from "@buildnbuzz/form-builder-core";
import { isDataField, isContainerType } from "@buildnbuzz/form-core";

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

  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedId === node.id;
  const isHidden = isDataField(node.field) && node.field.hidden === true;

  const fieldStyle = "style" in node.field ? node.field.style : undefined;
  const fieldWidth = (fieldStyle as React.CSSProperties | undefined)?.width;

  return (
    <SortableNode
      id={node.id}
      render={({ setNodeRef, attributes, listeners, style, isDragging }) => (
        <div
          ref={setNodeRef}
          style={{
            ...style,
            ...(isHidden && {
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.05) 10px, rgba(128,128,128,0.05) 20px)",
            }),
            ...(fieldWidth && fieldWidth !== "auto"
              ? { width: fieldWidth, flex: "0 0 auto" }
              : { flex: "1 1 0%", minWidth: 0 }),
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectNode(node.id);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...attributes}
          {...listeners}
          className={cn(
            "relative group/node my-2 rounded-xl transition-all duration-200 cursor-default",
            "hover:p-2",
            isSelected
              ? "border-primary/50 ring-2 ring-primary/10 p-2 bg-primary/5"
              : "border-transparent",
            !isSelected && "border hover:border-border/40",
            isDragging && "opacity-30",
            isHidden &&
              "opacity-60 grayscale border-dashed border-muted-foreground/30",
          )}
        >
          {/* Node Toolbar - visible on hover or selection */}
          <TooltipProvider>
            <div
              className={cn(
                "absolute -top-9 right-0 z-50 flex items-center gap-0.5 rounded-lg border border-border/50 bg-card/75 p-1 shadow-lg shadow-black/10 backdrop-blur-md transition-opacity duration-200",
                isSelected || isHovered
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none",
              )}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateNode(node.id);
                      }}
                    />
                  }
                >
                  <IconPlaceholder
                    lucide="Copy"
                    hugeicons="Copy01Icon"
                    tabler="IconCopy"
                    phosphor="Copy"
                    remixicon="RiFileCopyLine"
                    size={14}
                  />
                </TooltipTrigger>
                <TooltipContent>Duplicate field</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNode(node.id);
                      }}
                    />
                  }
                >
                  <IconPlaceholder
                    lucide="Trash2"
                    hugeicons="Delete02Icon"
                    tabler="IconTrash"
                    phosphor="Trash"
                    remixicon="RiDeleteBinLine"
                    size={14}
                  />
                </TooltipTrigger>
                <TooltipContent>Remove field</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Node Content */}
          <div
            className={cn(
              "relative w-full transition-all duration-200",
              !isContainerType(node.field.type) && "pointer-events-none",
            )}
          >
            {isHidden && (
              <Badge
                className="absolute bottom-1.5 right-2 z-10 select-none bg-background/80 backdrop-blur-sm pointer-events-auto"
                variant="outline"
              >
                Hidden
              </Badge>
            )}
            {children}
          </div>
        </div>
      )}
    />
  );
};
