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
import { useBuilderContext } from "../context/builder-context";
import { 
  getDropLocation, 
  canDrop, 
  isDescendant,
  getChildList
} from "@buildnbuzz/form-builder-core";
import { isContainerType } from "@buildnbuzz/form-core";
import { isInsideContainerPadding } from "../utils";

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
    const overRawId = over.id as string;
    const isDropZone = overRawId.endsWith("-dropzone");
    const overId = overRawId.replace("-dropzone", "");
    
    // Simple heuristic: if it's a target area, use vertical half to decide position.
    const overRect = over.rect;
    const activeRect = active.rect.current.translated;
    const pointerY = activeRect
      ? activeRect.top + activeRect.height / 2
      : event.activatorEvent instanceof MouseEvent 
        ? event.activatorEvent.clientY 
        : 0;
      
    const middle = overRect.top + overRect.height / 2;
    let position: "before" | "after" | "inside" = pointerY < middle ? "before" : "after";

    if (overId === "root") {
      position = "inside";
    } else if (isDropZone) {
      position = "inside";
    } else {
      const overNode = nodes[overId];
      if (overNode && isContainerType(overNode.field.type)) {
        // Container padding detection
        if (isInsideContainerPadding(event.activatorEvent as MouseEvent | TouchEvent, overId)) {
          position = "inside";
        }
      }
    }

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

    // Empty tab guard
    if (parentType === "tabs" && parentNode) {
      // @ts-expect-error - field type checking
      const tabCount = parentNode.field.tabs?.length ?? 0;
      if (tabCount === 0) {
        setDropIndicator(null);
        return;
      }
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
    const { nodes, rootIds, dropIndicator, createNode, moveNode, setDropIndicator } = store.getState();

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
      const node = nodes[activeId];
      if (node) {
        const sameParent =
          node.parentId === dropIndicator.parentId &&
          node.parentSlot === dropIndicator.parentSlot;

        if (sameParent) {
          const siblings = getChildList(
            nodes,
            rootIds,
            node.parentId,
            node.parentSlot
          );
          const oldIndex = siblings.indexOf(activeId);
          const adjustedIndex =
            dropIndicator.index > oldIndex
              ? dropIndicator.index - 1
              : dropIndicator.index;

          if (adjustedIndex === oldIndex) {
            cleanup();
            return;
          }
        }

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
