"use client";

import React, { ReactNode } from "react";
import { useDraggable, type DraggableAttributes } from "@dnd-kit/core";

export type DraggableListeners = Record<string, (event: { nativeEvent: unknown }) => void> | undefined;

export interface DraggableSidebarItemProps {
  /** The type of field this item represents. */
  type: string;
  /** Custom data to pass to dnd-kit. */
  data?: Record<string, unknown>;
  /** 
   * Render prop that receives dnd-kit draggable props.
   */
  render: (props: {
    /** Attributes to apply to the draggable element. */
    attributes: DraggableAttributes;
    /** Listeners to apply to the draggable element. */
    listeners: DraggableListeners;
    /** Ref setter for the draggable element. */
    setNodeRef: (el: HTMLElement | null) => void;
    /** Whether the item is currently being dragged. */
    isDragging: boolean;
  }) => ReactNode;
  /** Whether dragging is disabled. */
  disabled?: boolean;
}

/**
 * Headless wrapper for sidebar items to make them draggable into the canvas.
 */
export const DraggableSidebarItem = ({ 
  type, 
  data, 
  render, 
  disabled 
}: DraggableSidebarItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { 
      from: "sidebar", 
      type, 
      ...data 
    },
    disabled,
  });

  return <>{render({ 
    attributes, 
    listeners: listeners as DraggableListeners, 
    setNodeRef, 
    isDragging 
  })}</>;
};
