import { describe, it, expect } from "vitest";
import { getSidebarGroups, type SidebarItem } from "./registry";
import type { FieldRegistry } from "./types";

describe("registry utilities", () => {
  describe("getSidebarGroups", () => {
    it("groups items by category", () => {
      const registry: FieldRegistry<string, unknown> = {
        text: {
          kind: "data",
          sidebar: { label: "Text", icon: "icon-text", category: "inputs" },
          defaultProps: { type: "text" },
        },
        select: {
          kind: "data",
          sidebar: { label: "Select", icon: "icon-select", category: "selection" },
          defaultProps: { type: "select" },
        },
        group: {
          kind: "layout",
          sidebar: { label: "Group", icon: "icon-group", category: "layout" },
          defaultProps: { type: "group" },
        },
      };

      const groups = getSidebarGroups(registry);

      expect(Object.keys(groups)).toEqual(["inputs", "selection", "layout"]);
      const inputs = groups["inputs"];
      expect(inputs).toBeDefined();
      if (inputs && inputs.length > 0) {
        expect(inputs[0]).toMatchObject({ type: "text", label: "Text" });
      }
    });

    it("handles empty registry", () => {
      expect(getSidebarGroups({})).toEqual({});
    });

    it("handles multiple items in same category", () => {
        const registry: FieldRegistry<string, unknown> = {
          t1: { kind: "data", sidebar: { label: "T1", icon: "i1", category: "cat" }, defaultProps: { type: "text" } },
          t2: { kind: "data", sidebar: { label: "T2", icon: "i2", category: "cat" }, defaultProps: { type: "text" } },
        };
        const groups = getSidebarGroups(registry);
        const cat = groups["cat"] as SidebarItem<unknown>[];
        
        expect(cat).toBeDefined();
        expect(cat).toHaveLength(2);
        expect(cat![0]!.type).toBe("t1");
        expect(cat![1]!.type).toBe("t2");
    });
  });
});
