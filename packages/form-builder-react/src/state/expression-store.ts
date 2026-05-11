import { createStore, type StoreApi } from "zustand/vanilla";
import { nanoid } from "nanoid";
import type { ExpressionGroup, ExpressionRule } from "@buildnbuzz/form-builder-core";
import { deepClone } from "@buildnbuzz/form-builder-core";
import { arrayMove } from "@dnd-kit/sortable";

export interface ExpressionStoreState {
  rootGroup: ExpressionGroup;
  addRule: (groupId: string) => void;
  addGroup: (groupId: string) => void;
  removeNode: (parentId: string, nodeId: string) => void;
  updateRule: (parentId: string, ruleId: string, updates: Partial<ExpressionRule>) => void;
  updateGroupOperator: (groupId: string, op: "AND" | "OR") => void;
  duplicateRule: (parentId: string, ruleId: string) => void;
  duplicateGroup: (parentId: string, groupId: string) => void;
  reorderNode: (containerId: string, activeId: string, overId: string) => void;
  moveNode: (activeId: string, targetContainerId: string, index: number) => void;
}

const createDefaultRule = (): ExpressionRule => ({
  id: nanoid(8),
  type: "rule",
  fieldId: "",
  operator: "equals",
  value: "",
});

const createDefaultGroup = (): ExpressionGroup => ({
  id: nanoid(8),
  type: "group",
  logicalOperator: "AND",
  children: [createDefaultRule()],
});

const regenerateIds = (node: ExpressionGroup | ExpressionRule): ExpressionGroup | ExpressionRule => {
  if (node.type === "rule") {
    return { ...node, id: nanoid(8) };
  }
  return {
    ...node,
    id: nanoid(8),
    children: node.children.map(regenerateIds),
  };
};

const ensureIds = (node: ExpressionGroup | ExpressionRule): ExpressionGroup | ExpressionRule => {
  if (node.type === "rule") {
    return { ...node, id: node.id || nanoid(8) };
  }
  return {
    ...node,
    id: node.id || "root",
    children: (node.children || []).map(ensureIds),
  };
};

export const createExpressionStore = (
  initial?: ExpressionGroup
): StoreApi<ExpressionStoreState> => {
  return createStore<ExpressionStoreState>((set) => {
    const traverseAndUpdate = (
      group: ExpressionGroup,
      updater: (g: ExpressionGroup) => ExpressionGroup | null
    ): ExpressionGroup => {
      const updated = updater(group);
      if (updated !== null) return updated;

      return {
        ...group,
        children: group.children.map((child: ExpressionGroup | ExpressionRule) => {
          if (child.type === "group") {
            return traverseAndUpdate(child, updater);
          }
          return child;
        }),
      };
    };

    return {
      rootGroup: initial ? ensureIds(deepClone(initial)) as ExpressionGroup : {
        id: "root",
        type: "group",
        logicalOperator: "AND",
        children: [],
      },

      addRule: (groupId) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === groupId) {
              return { ...g, children: [...g.children, createDefaultRule()] };
            }
            return null;
          }),
        })),

      addGroup: (groupId) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === groupId) {
              return { ...g, children: [...g.children, createDefaultGroup()] };
            }
            return null;
          }),
        })),

      removeNode: (parentId, nodeId) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === parentId) {
              return {
                ...g,
                children: g.children.filter((c: ExpressionGroup | ExpressionRule) => c.id !== nodeId),
              };
            }
            return null;
          }),
        })),

      updateRule: (parentId, ruleId, updates) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === parentId) {
              return {
                ...g,
                children: g.children.map((c: ExpressionGroup | ExpressionRule) => {
                  if (c.type === "rule" && c.id === ruleId) {
                    return { ...c, ...updates };
                  }
                  return c;
                }),
              };
            }
            return null;
          }),
        })),

      updateGroupOperator: (groupId, op) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === groupId) {
              return { ...g, logicalOperator: op };
            }
            return null;
          }),
        })),

      duplicateRule: (parentId, ruleId) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === parentId) {
              const idx = g.children.findIndex((c: ExpressionGroup | ExpressionRule) => c.id === ruleId);
              if (idx === -1) return g;
              const rule = g.children[idx];
              if (!rule || rule.type !== "rule") return g;
              
              const newRule = { ...rule, id: nanoid(8) };
              const newChildren = [...g.children];
              newChildren.splice(idx + 1, 0, newRule as ExpressionRule);
              return { ...g, children: newChildren };
            }
            return null;
          }),
        })),

      duplicateGroup: (parentId, groupId) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === parentId) {
              const idx = g.children.findIndex((c: ExpressionGroup | ExpressionRule) => c.id === groupId);
              if (idx === -1) return g;
              const group = g.children[idx];
              if (!group || group.type !== "group") return g;
              
              const newGroup = regenerateIds(deepClone(group)) as ExpressionGroup;
              const newChildren = [...g.children];
              newChildren.splice(idx + 1, 0, newGroup as ExpressionGroup);
              return { ...g, children: newChildren };
            }
            return null;
          }),
        })),

      reorderNode: (containerId, activeId, overId) =>
        set((state) => ({
          rootGroup: traverseAndUpdate(state.rootGroup, (g) => {
            if (g.id === containerId) {
              const oldIndex = g.children.findIndex((c: ExpressionGroup | ExpressionRule) => c.id === activeId);
              const newIndex = g.children.findIndex((c: ExpressionGroup | ExpressionRule) => c.id === overId);
              if (oldIndex !== -1 && newIndex !== -1) {
                return {
                  ...g,
                  children: arrayMove(g.children, oldIndex, newIndex),
                };
              }
            }
            return null;
          }),
        })),

      moveNode: (activeId, targetContainerId, index) =>
        set((state) => {
          let nodeToMove: ExpressionRule | ExpressionGroup | null = null;
          
          // First, remove it from old parent
          const stateAfterRemove = traverseAndUpdate(state.rootGroup, (g) => {
            const idx = g.children.findIndex((c: ExpressionGroup | ExpressionRule) => c.id === activeId);
            if (idx !== -1) {
              nodeToMove = g.children[idx] || null;
              return {
                ...g,
                children: g.children.filter((c: ExpressionGroup | ExpressionRule) => c.id !== activeId),
              };
            }
            return null;
          });

          if (!nodeToMove) return state; // Node not found

          // Then, add it to new parent
          const finalState = traverseAndUpdate(stateAfterRemove, (g) => {
            if (g.id === targetContainerId && nodeToMove) {
              const newChildren = [...g.children];
              newChildren.splice(index, 0, nodeToMove);
              return { ...g, children: newChildren };
            }
            return null;
          });

          return { rootGroup: finalState };
        }),
    };
  });
};
