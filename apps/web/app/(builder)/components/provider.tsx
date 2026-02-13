"use client";

import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  CollisionDetection,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import { useBuilderStore } from "../lib/store";
import {
  canDrop,
  getDropLocation,
  isDescendant,
  isInsideContainerPadding,
} from "../lib/utils";
import { getChildList } from "../lib/node-children";
import { builderFieldRegistry } from "../lib/registry";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Move01Icon, TextIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { isContainerType } from "../lib/types";

function customCollisionDetection(args: Parameters<CollisionDetection>[0]) {
  // First: prefer items directly under pointer
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // Fallback: intersecting rectangles
  return rectIntersection(args);
}

export function BuilderDndProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const setDropIndicator = useBuilderStore((s) => s.setDropIndicator);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragMove(event: DragMoveEvent) {
    const { over, activatorEvent, active } = event;

    const isSidebarDrag = Boolean(active.data.current?.from === "sidebar");
    const store = useBuilderStore.getState();

    if (!over) {
      if (store.dropIndicator !== null) {
        setDropIndicator(null);
      }
      return;
    }

    const { nodes, rootIds } = store;

    const activeId = active.id as string;

    // Sidebar items don't exist in nodes yet
    const activeType =
      active.data.current?.type ?? nodes[activeId]?.field?.type;

    // -----------------------------
    // Clean ID for DropZone
    // -----------------------------
    const overRawId = over.id as string;
    const overData = (over.data.current ?? {}) as {
      parentId?: string | null;
      parentSlot?: string | null;
    };
    const isDropZone = overRawId.endsWith("-dropzone");
    const overId = isDropZone
      ? overData.parentId === null
        ? "root"
        : (overData.parentId ?? overRawId.replace("-dropzone", ""))
      : overRawId;

    // -----------------------------
    // 1️⃣ Measure real DOM geometry
    // -----------------------------
    const overElement =
      overId === "root"
        ? document.querySelector(`[data-id="root"]`)
        : document.querySelector(`[data-id="${overId}"]`);

    if (!overElement) return;

    const rect = overElement.getBoundingClientRect();

    // Use the center of the dragged element as the pointer position for better accuracy
    // active.rect.current.translated reflects the current position on screen
    const activeRect = active.rect.current.translated;
    const pointerY = activeRect
      ? activeRect.top + activeRect.height / 2
      : (activatorEvent as MouseEvent).clientY;

    const middle = rect.top + rect.height / 2;

    let position: "before" | "after" | "inside";

    if (pointerY < middle) {
      position = "before";
    } else {
      position = "after";
    }

    // -----------------------------
    // 2️⃣ Allow INSIDE only for containers
    // -----------------------------
    if (overId === "root") {
      position = "inside";
    } else if (isDropZone) {
      // Force inside if we dropped on the inner zone
      position = "inside";
    } else {
      const overNode = nodes[overId];
      const overType = overNode?.field?.type;

      if (overType && isContainerType(overType)) {
        const paddingEl = overElement.querySelector(
          "[data-container-padding]",
        ) as HTMLElement | null;

        if (paddingEl && isInsideContainerPadding(paddingEl, pointerY)) {
          position = "inside";
        }
      }
    }

    // -----------------------------
    // 3️⃣ Translate to tree location
    // -----------------------------
    const location =
      isDropZone && typeof overData.parentId !== "undefined"
        ? (() => {
            const parentId = overData.parentId ?? null;
            const parentSlot = overData.parentSlot ?? null;
            const siblings = getChildList(nodes, rootIds, parentId, parentSlot);

            return {
              parentId,
              parentSlot,
              index: siblings.length,
            };
          })()
        : getDropLocation(nodes, rootIds, overId, position);

    if (!location) {
      setDropIndicator(null);
      return;
    }

    const { parentId } = location;
    const parentType = parentId ? (nodes[parentId]?.field?.type ?? null) : null;
    if (parentType === "tabs" && parentId) {
      const tabCount = nodes[parentId]?.field.type === "tabs" ? nodes[parentId].field.tabs.length : 0;
      if (tabCount === 0) {
        setDropIndicator(null);
        return;
      }
    }

    // -----------------------------
    // 4️⃣ Drop rules (canDrop)
    // -----------------------------
    if (!canDrop(parentType, activeType)) {
      setDropIndicator(null);
      return;
    }

    // -----------------------------
    // 5️⃣ Prevent self-nesting
    // -----------------------------
    if (
      !isSidebarDrag &&
      parentId &&
      activeId &&
      isDescendant(nodes, activeId, parentId)
    ) {
      setDropIndicator(null);
      return;
    }

    const currentIndicator = store.dropIndicator;
    if (
      currentIndicator?.parentId === location.parentId &&
      currentIndicator?.parentSlot === location.parentSlot &&
      currentIndicator?.index === location.index
    ) {
      return;
    }

    // -----------------------------
    // 6️⃣ Valid drop → show indicator
    // -----------------------------
    setDropIndicator(location);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active } = event;

    const store = useBuilderStore.getState();
    const { nodes, rootIds, dropIndicator } = store;
    const clearDragState = () => {
      store.setDropIndicator(null);
      setActiveId(null);
    };

    if (!dropIndicator) {
      clearDragState();
      return;
    }

    const { parentId, parentSlot, index } = dropIndicator;
    const activeId = active.id as string;

    const isSidebarDrag = Boolean(active.data.current?.from === "sidebar");

    // --------------------------------------------------
    // 1️⃣ NO-OP MOVE GUARD (only for existing nodes)
    // --------------------------------------------------
    if (!isSidebarDrag) {
      const node = nodes[activeId];
      if (!node) {
        store.setDropIndicator(null);
        return;
      }

      const oldParentId = node.parentId;
      const oldParentSlot = node.parentSlot ?? null;
      const oldSiblings = getChildList(
        nodes,
        rootIds,
        oldParentId,
        oldParentSlot,
      );

      const oldIndex = oldSiblings.indexOf(activeId);
      const adjustedIndex =
        oldParentId === parentId &&
        oldParentSlot === parentSlot &&
        oldIndex !== -1 &&
        oldIndex < index
          ? index - 1
          : index;

      // If nothing actually changed, do nothing
      if (
        oldParentId === parentId &&
        oldParentSlot === parentSlot &&
        oldIndex === adjustedIndex
      ) {
        clearDragState();
        return;
      }
    }

    // --------------------------------------------------
    // 2️⃣ COMMIT THE MOVE
    // --------------------------------------------------
    if (isSidebarDrag) {
      store.createNode(active?.data?.current?.type, parentId, index, parentSlot);
    } else {
      store.moveNode(activeId, parentId, index, parentSlot);
    }

    // --------------------------------------------------
    // 3️⃣ CLEANUP
    // --------------------------------------------------
    clearDragState();
  }

  return (
    <DndContext
      id="buzzform-builder-dnd"
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setDropIndicator(null);
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeId ? <DragOverlayItem id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DragOverlayItem({ id }: { id: string }) {
  const store = useBuilderStore();
  const node = store.nodes[id];

  // Determine if this is a sidebar drag (new field) or canvas drag (existing field)
  const isFromSidebar = id.startsWith("sidebar-");
  const type = isFromSidebar ? id.replace("sidebar-", "") : node?.field?.type;
  const entry = type
    ? builderFieldRegistry[type as keyof typeof builderFieldRegistry]
    : null;

  const icon = entry?.sidebar?.icon ?? TextIcon;
  const label = entry?.sidebar?.label ?? type ?? "Field";

  // Get field name for existing fields
  let fieldName: string | undefined;
  if (!isFromSidebar && node && "name" in node.field) {
    fieldName = node.field.name;
  }

  return (
    <div
      className={cn(
        "bg-card/95 backdrop-blur-md border-2 shadow-2xl rounded-xl p-3 min-w-80",
        "cursor-grabbing animate-in fade-in-0 zoom-in-95 duration-150",
        isFromSidebar
          ? "border-primary/50 shadow-primary/10"
          : "border-border shadow-black/10",
      )}
      style={{ minWidth: 320 }}
    >
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div
          className={cn(
            "p-2.5 rounded-lg",
            isFromSidebar
              ? "bg-primary/15 text-primary"
              : "bg-muted text-foreground",
          )}
        >
          <HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {isFromSidebar ? `New ${label}` : (fieldName ?? label)}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
            <HugeiconsIcon
              icon={isFromSidebar ? Add01Icon : Move01Icon}
              size={10}
              strokeWidth={2}
            />
            <span>
              {isFromSidebar
                ? (
                    <>
                      Adding new field, press
                      <kbd className="ml-1 inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground/80">
                        Esc
                      </kbd>
                      <span className="ml-1">to cancel</span>
                    </>
                  )
                : "Moving field"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
