"use client";

import React, { ReactNode } from "react";
import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { type DraggableAttributes } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// dnd-kit SyntheticListenerMap type fallback
export type SortableListeners = Record<string, (event: { nativeEvent: unknown }) => void> | undefined;

export interface SortableNodeProps {
  /** The unique ID of the node (matches store ID). */
  id: string;
  /** Data to pass to dnd-kit (e.g. type, parentId). */
  data?: Record<string, unknown>;
  /** 
   * Render prop that receives dnd-kit sortable props.
   */
  render: (props: {
    /** Attributes to apply to the draggable handle or container. */
    attributes: DraggableAttributes;
    /** Listeners to apply to the draggable handle. */
    listeners: SortableListeners;
    /** Ref setter for the draggable element. */
    setNodeRef: (el: HTMLElement | null) => void;
    /** Transform styles for smooth dragging. */
    style: React.CSSProperties;
    /** Whether the node is currently being dragged. */
    isDragging: boolean;
    /** Whether the node is the current drop target (if used with indicators). */
    isSorting: boolean;
  }) => ReactNode;
  /** Whether dragging is disabled for this specific node. */
  disabled?: boolean;
}

/**
 * Headless wrapper that makes a node sortable using @dnd-kit/sortable.
 */
export const SortableNode = ({ 
  id, 
  data, 
  render, 
  disabled 
}: SortableNodeProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id,
    data,
    disabled,
    animateLayoutChanges: (args) => 
      args.isSorting || args.wasDragging ? defaultAnimateLayoutChanges(args) : true,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return <>{render({ 
    attributes, 
    listeners: listeners as SortableListeners, 
    setNodeRef, 
    style, 
    isDragging, 
    isSorting 
  })}</>;
};
