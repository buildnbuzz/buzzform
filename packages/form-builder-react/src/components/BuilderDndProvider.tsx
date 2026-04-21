"use client";

import React, { useState, ReactNode } from "react";
import {
  DndContext,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import { useBuilderContext } from "../context/BuilderContext";
import { 
  getDropLocation, 
  canDrop, 
  isDescendant 
} from "@buildnbuzz/form-builder-core";

/**
 * Custom collision detection that prefers items directly under the pointer.
 */
const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return rectIntersection(args);
};

export interface BuilderDndProviderProps {
  children: ReactNode;
  /** 
   * Optional custom renderer for the drag overlay.
   * Receives the active ID and its data.
   */
  renderOverlay?: (props: { activeId: string; activeData: Record<string, unknown> }) => ReactNode;
}

/**
 * Orchestrates drag-and-drop operations for the form builder.
 * Integrates @dnd-kit with the builder store.
 */
export const BuilderDndProvider = ({ 
  children,
  renderOverlay 
}: BuilderDndProviderProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<Record<string, unknown> | null>(null);

  const { store } = useBuilderContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveData((event.active.data.current as Record<string, unknown>) || null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, active } = event;
    const { nodes, rootIds, setDropIndicator } = store.getState();

    if (!over) {
      setDropIndicator(null);
      return;
    }

    const activeId = active.id as string;
    const isSidebarDrag = active.data.current?.from === "sidebar";
    const activeType = active.data.current?.type ?? nodes[activeId]?.field?.type;

    // Resolve overId (handling potential dropzone suffixes if used by consumer)
    const overId = (over.id as string).replace("-dropzone", "");
    
    // Simple heuristic: if it's a target area, use vertical half to decide position.
    const overRect = over.rect;
    const activeRect = active.rect.current.translated;
    const pointerY = activeRect
      ? activeRect.top + activeRect.height / 2
      : event.activatorEvent instanceof MouseEvent 
        ? event.activatorEvent.clientY 
        : 0;
      
    const middle = overRect.top + overRect.height / 2;
    const position: "before" | "after" | "inside" = pointerY < middle ? "before" : "after";

    const location = getDropLocation(nodes, rootIds, overId, position);

    if (!location) {
      setDropIndicator(null);
      return;
    }

    // Validation
    const { parentId } = location;
    const parentNode = parentId ? nodes[parentId] : null;
    const parentType = parentNode?.field?.type ?? null;

    if (!canDrop(parentType, activeType)) {
      setDropIndicator(null);
      return;
    }

    // Circularity check
    if (!isSidebarDrag && parentId && isDescendant(nodes, activeId, parentId)) {
      setDropIndicator(null);
      return;
    }

    setDropIndicator(location);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    const { nodes, dropIndicator, createNode, moveNode, setDropIndicator } = store.getState();

    const cleanup = () => {
      setActiveId(null);
      setActiveData(null);
      setDropIndicator(null);
    };

    if (!dropIndicator) {
      cleanup();
      return;
    }

    const isSidebarDrag = active.data.current?.from === "sidebar";
    const activeId = active.id as string;

    if (isSidebarDrag) {
      createNode(
        active.data.current?.type,
        dropIndicator.parentId,
        dropIndicator.index,
        dropIndicator.parentSlot
      );
    } else {
      // Basic no-op guard: if the node is already there, do nothing.
      // A more robust check would involve comparing indices from getChildList.
      const node = nodes[activeId];
      if (node) {
        moveNode(
          activeId,
          dropIndicator.parentId,
          dropIndicator.index,
          dropIndicator.parentSlot
        );
      }
    }

    cleanup();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        const { setDropIndicator } = store.getState();
        setDropIndicator(null);
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeId && renderOverlay && activeData 
          ? renderOverlay({ activeId, activeData }) 
          : null}
      </DragOverlay>
    </DndContext>
  );
};
