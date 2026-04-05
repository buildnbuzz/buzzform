import { describe, it, expect } from "vitest";

import { generateComponentCode } from "./code-generator";

import type { Node } from "./types";

function createNode(
  id: string,
  field: Node["field"],
  parentId: string | null = null,
  parentSlot: string | null = null,
  children: Record<string, string[]> = { __default__: [] },
): Node {
  return {
    id,
    field,
    parentId,
    parentSlot,
    children,
  };
}

// ---------------------------------------------------------------------------
// toComponentName
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// generateComponentCode
// ---------------------------------------------------------------------------

describe("generateComponentCode", () => {
  it("generates a component with a simple text field", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "text" as const, name: "name" }, null, null, {
        __default__: [],
      }),
    };
    const code = generateComponentCode(nodes, ["a"], "Contact");
    expect(code).toContain(`"use client"`);
    expect(code).toContain(`import { defineSchema, type InferType } from "@buildnbuzz/form-core"`);
    expect(code).toContain(`import { Form } from "@buildnbuzz/form-react"`);
    expect(code).toContain(`export default function ContactForm()`);
    expect(code).toContain(`"name"`);
  });

  it("includes output config when provided", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "text" as const, name: "email" }, null, null, {
        __default__: [],
      }),
    };
    const code = generateComponentCode(nodes, ["a"], "Test", {
      type: "path",
      delimiter: "_",
    });
    expect(code).toContain(`type: "path"`);
    expect(code).toContain(`delimiter: "_"`);
  });

  it("does not include output delimiter when it is the default dot", () => {
    const nodes: Record<string, Node> = {
      a: createNode("a", { type: "text" as const, name: "email" }, null, null, {
        __default__: [],
      }),
    };
    const code = generateComponentCode(nodes, ["a"], "Test", {
      type: "path",
      delimiter: ".",
    });
    expect(code).not.toContain(`delimiter:`);
  });

  it("generates nested field structure", () => {
    const nodes: Record<string, Node> = {
      root: createNode("root", { type: "group" as const, name: "user", fields: [] }, null, null, {
        __default__: ["c"],
      }),
      c: createNode("c", { type: "text" as const, name: "email" }, "root", null, {
        __default__: [],
      }),
    };
    const code = generateComponentCode(nodes, ["root"], "Nested");
    expect(code).toContain(`export default function NestedForm()`);
    expect(code).toContain(`"group"`);
    expect(code).toContain(`"fields"`);
  });
});
