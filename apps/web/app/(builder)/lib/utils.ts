import type { Node, FieldType } from "./types";
import { isContainerType } from "./types";
import { getChildList, getNodeChildren, getTabSlotKeys } from "./node-children";

export type DropLocation = {
    parentId: string | null;
    parentSlot: string | null;
    index: number;
};

export function getDropLocation(
    nodes: Record<string, Node>,
    rootIds: string[],
    overId: string,
    position: "before" | "after" | "inside"
): DropLocation | null {
    if (overId === "root") {
        return {
            parentId: null,
            parentSlot: null,
            index: rootIds.length,
        };
    }

    const overNode = nodes[overId];
    if (!overNode) return null;

    if (position === "inside" && isContainerType(overNode.field.type)) {
        const parentSlot =
            overNode.field.type === "tabs"
                ? (getTabSlotKeys(overNode.field.tabs)[0] ?? "__tab_0")
                : null;
        const insideSiblings = getChildList(
            nodes,
            rootIds,
            overId,
            parentSlot,
        );

        return {
            parentId: overId,
            parentSlot,
            index: insideSiblings.length,
        };
    }

    const parentId = overNode.parentId;
    const parentSlot = overNode.parentSlot ?? null;
    const siblings = getChildList(nodes, rootIds, parentId, parentSlot);

    const overIndex = siblings.indexOf(overId);

    return {
        parentId,
        parentSlot,
        index: position === "before" ? overIndex : overIndex + 1,
    };
}

export function canDrop(
    parentType: FieldType | null,
    childType: FieldType | undefined
) {
    if (!childType) return false;

    if (parentType === null) return true;

    if (parentType === "row") {
        return !isContainerType(childType);
    }

    if (parentType === "group" || parentType === "collapsible") {
        return true;
    }

    if (parentType === "tabs") {
        return true;
    }

    return false;
}

export function isDescendant(
    nodes: Record<string, Node>,
    parentId: string,
    childId: string
): boolean {
    const parent = nodes[parentId];
    if (!parent) return false;

    const children = getNodeChildren(parent);

    if (children.includes(childId)) return true;

    return children.some(id =>
        isDescendant(nodes, id, childId)
    );
}

export function isInsideContainerPadding(
    containerEl: HTMLElement,
    pointerY: number
) {
    const rect = containerEl.getBoundingClientRect();

    return pointerY >= rect.top && pointerY <= rect.bottom;
}
