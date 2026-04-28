import { describe, it, expect, vi } from "vitest";
import { parseImportedFormJson, fieldsToBuilderState } from "./import-export";
import type { Field, DataField, GroupField, TabsField } from "@buildnbuzz/form-core";

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "mock-id")
}));

import { nanoid } from "nanoid";

describe("parseImportedFormJson", () => {
  it("parses modern buzzform-schema", () => {
    const json = JSON.stringify({
      fields: [{ type: "text", name: "name" }],
      id: "f1",
      title: "My Form",
    });

    const result = parseImportedFormJson(json);
    expect(result.state.formId).toBe("f1");
    expect(result.state.formName).toBe("My Form");
    expect(Object.keys(result.state.nodes)).toHaveLength(1);
    expect(result.state.rootIds).toEqual(["mock-id"]);
    expect(result.state.nodes["mock-id"]!.field.type).toBe("text");
  });

  it("throws on builder-backup payload", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      nodes: {},
      rootIds: []
    });

    expect(() => parseImportedFormJson(json)).toThrowError("Unrecognised document format");
  });

  it("throws on invalid json", () => {
    expect(() => parseImportedFormJson("not json")).toThrowError("Invalid JSON document");
  });

  it("migrates legacy schema during parsing and collects warnings", () => {
    vi.mocked(nanoid)
      .mockReturnValueOnce("id-d1")
      .mockReturnValueOnce("id-t1");

    const json = JSON.stringify({
      title: "Legacy Form",
      fields: [
        { type: "datetime", name: "d1" },
        { type: "text", name: "t1", component: "Input" }
      ]
    });

    const result = parseImportedFormJson(json);
    expect(result.state.formName).toBe("Legacy Form");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings?.[0]).toContain("Stripped");
    
    const nodes = Object.values(result.state.nodes);
    const dateNode = nodes.find((n) => (n.field as unknown as Record<string, unknown>).name === "d1")!;
    const textNode = nodes.find((n) => (n.field as unknown as Record<string, unknown>).name === "t1")!;
    
    expect(dateNode.field.type).toBe("date");
    expect((dateNode.field as unknown as Record<string, unknown>).withTime).toBe(true);
    expect((textNode.field as unknown as Record<string, unknown>).component).toBeUndefined();
  });
});

describe("fieldsToBuilderState", () => {
  it("flattens a simple field array", () => {
    const fields: Field[] = [
      { type: "text", name: "a" } as Field,
      { type: "text", name: "b" } as Field
    ];

    vi.mocked(nanoid)
      .mockReturnValueOnce("id-1")
      .mockReturnValueOnce("id-2");

    const { nodes, rootIds } = fieldsToBuilderState(fields);

    expect(rootIds).toEqual(["id-1", "id-2"]);
    expect(nodes["id-1"]!.parentId).toBeNull();
    expect((nodes["id-1"]!.field as DataField).name).toBe("a");
    expect((nodes["id-2"]!.field as DataField).name).toBe("b");
  });

  it("recursively flattens nested groups", () => {
    const fields: Field[] = [
      {
        type: "group",
        name: "g",
        fields: [{ type: "text", name: "nested" } as Field]
      } as Field
    ];

    vi.mocked(nanoid)
      .mockReturnValueOnce("id-group")
      .mockReturnValueOnce("id-nested");

    const { nodes, rootIds } = fieldsToBuilderState(fields);

    expect(rootIds).toEqual(["id-group"]);
    
    const groupNode = nodes["id-group"]!;
    expect(groupNode.children["__default__"]).toEqual(["id-nested"]);
    expect((groupNode.field as GroupField).fields).toBeUndefined(); // Nested fields stripped

    const nestedNode = nodes["id-nested"]!;
    expect(nestedNode.parentId).toBe("id-group");
    expect(nestedNode.parentSlot).toBe("__default__");
    expect((nestedNode.field as DataField).name).toBe("nested");
  });

  it("recursively flattens tabs", () => {
    const fields: Field[] = [
      {
        type: "tabs",
        tabs: [
          { label: "Tab 1", fields: [{ type: "text", name: "t1" } as Field] },
          { label: "Tab 2", fields: [{ type: "text", name: "t2" } as Field] }
        ]
      } as unknown as Field
    ];

    vi.mocked(nanoid)
      .mockReturnValueOnce("id-tabs")
      .mockReturnValueOnce("id-t1")
      .mockReturnValueOnce("id-t2");

    const { nodes, rootIds } = fieldsToBuilderState(fields);

    expect(rootIds).toEqual(["id-tabs"]);
    
    const tabsNode = nodes["id-tabs"]!;
    expect(tabsNode.children["__tab_0"]).toEqual(["id-t1"]);
    expect(tabsNode.children["__tab_1"]).toEqual(["id-t2"]);

    const tab1 = (tabsNode.field as TabsField).tabs?.[0];
    expect(tab1?.fields).toBeUndefined(); // Stripped from payload
    expect(tab1?.label).toBe("Tab 1");

    expect(nodes["id-t1"]!.parentSlot).toBe("__tab_0");
    expect(nodes["id-t2"]!.parentSlot).toBe("__tab_1");
  });
});
