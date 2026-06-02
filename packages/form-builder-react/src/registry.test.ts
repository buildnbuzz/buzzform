/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { getRegistryEntry, getSidebarGroups, isContainer } from "./registry";
import type { BuilderFieldRegistry } from "./types";



const mockRegistry: BuilderFieldRegistry = {
  text: {
    kind: "data",
    sidebar: {
      label: "Text Input",
      icon: { lucide: "TextCursorInput" },
      category: "inputs",
    },
    defaultProps: {
      type: "text",
      label: "Text",
    },
  },
  group: {
    kind: "layout",
    sidebar: {
      label: "Group",
      icon: { lucide: "Layout" },
      category: "layout",
    },
    defaultProps: {
      type: "group",
      label: "Group",
      fields: [],
    },
  },
};

describe("Registry Helpers", () => {
  describe("getRegistryEntry", () => {
    it("returns correctly typed entry", () => {
      const entry = getRegistryEntry(mockRegistry, "text");
      expect(entry?.sidebar.label).toBe("Text Input");
      expect(entry?.kind).toBe("data");
    });

    it("returns undefined for missing entry", () => {
      const entry = getRegistryEntry(mockRegistry, "not-a-field");
      expect(entry).toBeUndefined();
    });
  });

  describe("getSidebarGroups", () => {
    it("groups items by category", () => {
      const groups = getSidebarGroups(mockRegistry);
      const inputs = groups["inputs"];
      const layouts = groups["layout"];
      
      const firstInput = inputs?.[0];
      const firstLayout = layouts?.[0];

      if (!firstInput || !firstLayout) {
        throw new Error("Groups should be defined and non-empty");
      }
      
      expect(inputs).toHaveLength(1);
      expect(layouts).toHaveLength(1);
      expect(firstInput.type).toBe("text");
      expect(firstLayout.type).toBe("group");
    });

    it("returns empty object for empty registry", () => {
      const groups = getSidebarGroups({});
      expect(groups).toEqual({});
    });
  });

  describe("isContainer", () => {
    it("detects layout kind as container", () => {
      expect(isContainer(mockRegistry, "group")).toBe(true);
    });

    it("detects data kind as non-container", () => {
      expect(isContainer(mockRegistry, "text")).toBe(false);
    });

    it("falls back to form-core isContainerType for unregistered types", () => {
      // row is a container in form-core
      expect(isContainer(mockRegistry, "row")).toBe(true);
      // password is NOT a container in form-core
      expect(isContainer(mockRegistry, "password")).toBe(false);
    });
  });
});
