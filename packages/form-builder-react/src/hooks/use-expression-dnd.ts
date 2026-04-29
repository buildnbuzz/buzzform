import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { StoreApi } from "zustand";
import {
  findContainer,
  isGroupNode,
  findNode,
  isExpressionDescendant,
} from "@buildnbuzz/form-builder-core";
import type { ExpressionStoreState } from "../state/expression-store";

export interface UseExpressionDndReturn {
  /** Pre-configured dnd-kit sensors (PointerSensor + KeyboardSensor). */
  sensors: SensorDescriptor<SensorOptions>[];
  /** Handler for `DndContext.onDragOver` — performs cross-container moves. */
  handleDragOver: (event: DragOverEvent) => void;
  /** Handler for `DndContext.onDragEnd` — performs same-container reorders. */
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Provides DnD event handlers and sensors for the Expression Builder.
 *
 * Handles:
 * - Cross-container moves (`onDragOver`) via `store.getState().moveNode`
 * - Same-container reorders (`onDragEnd`) via `store.getState().reorderNode`
 *
 * Guards against moving a node into one of its own descendants.
 *
 * @param store - The scoped expression builder store instance.
 */
export function useExpressionDnd(
  store: StoreApi<ExpressionStoreState>
): UseExpressionDndReturn {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const currentRoot = store.getState().rootGroup;

    const activeContainer = findContainer(activeId, currentRoot);
    const overContainer =
      findContainer(overId, currentRoot) ||
      (isGroupNode(overId, currentRoot) ? overId : null);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer ||
      activeId === overContainer ||
      isExpressionDescendant(activeId, overContainer, currentRoot)
    ) {
      return;
    }

    const overContainerNode = findNode(overContainer, currentRoot);
    if (!overContainerNode || overContainerNode.type !== "group") return;

    const overIndex = overContainerNode.children.findIndex(
      (c) => c.id === overId
    );
    const newIndex =
      overIndex >= 0 ? overIndex : overContainerNode.children.length;

    store.getState().moveNode(activeId, overContainer, newIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const currentRoot = store.getState().rootGroup;

    const activeContainer = findContainer(activeId, currentRoot);
    const overContainer =
      findContainer(overId, currentRoot) ||
      (isGroupNode(overId, currentRoot) ? overId : null);

    if (
      activeContainer &&
      overContainer &&
      activeContainer === overContainer &&
      activeId !== overId
    ) {
      store.getState().reorderNode(activeContainer, activeId, overId);
    }
  };

  return { sensors, handleDragOver, handleDragEnd };
}
