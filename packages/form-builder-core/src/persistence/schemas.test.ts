import { describe, it, expect } from "vitest";

import { SerializableFieldSchema, LegacyBackupSchema, FormSchemaShapeSchema } from "./schemas";

// ---------------------------------------------------------------------------
// SerializableFieldSchema
// ---------------------------------------------------------------------------

describe("SerializableFieldSchema", () => {
  it("accepts a simple text field", () => {
    const result = SerializableFieldSchema.safeParse({
      type: "text",
      name: "email",
      label: "Email",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a group with nested fields", () => {
    const result = SerializableFieldSchema.safeParse({
      type: "group",
      name: "address",
      fields: [{ type: "text", name: "street" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a tabs layout with nested fields", () => {
    const result = SerializableFieldSchema.safeParse({
      type: "tabs",
      tabs: [
        { name: "info", label: "Info", fields: [{ type: "text", name: "name" }] },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a field without a type", () => {
    const result = SerializableFieldSchema.safeParse({ name: "email" });
    expect(result.success).toBe(false);
  });

  it("rejects a field without a name (for named types)", () => {
    const result = SerializableFieldSchema.safeParse({ type: "text" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// LegacyBackupSchema
// ---------------------------------------------------------------------------

describe("LegacyBackupSchema", () => {
  it("accepts a minimal legacy backup", () => {
    const result = LegacyBackupSchema.safeParse({
      nodes: {},
      rootIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a backup with nodes", () => {
    const result = LegacyBackupSchema.safeParse({
      schemaVersion: 1,
      formId: "abc",
      formName: "Test",
      nodes: { a: { field: { type: "text", name: "x" } } },
      rootIds: ["a"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects when rootIds is missing", () => {
    const result = LegacyBackupSchema.safeParse({ nodes: {} });
    expect(result.success).toBe(false);
  });

  it("rejects when nodes is missing", () => {
    const result = LegacyBackupSchema.safeParse({ rootIds: [] });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// FormSchemaShapeSchema
// ---------------------------------------------------------------------------

describe("FormSchemaShapeSchema", () => {
  it("accepts a minimal FormSchema", () => {
    const result = FormSchemaShapeSchema.safeParse({ fields: [] });
    expect(result.success).toBe(true);
  });

  it("accepts a schema with metadata", () => {
    const result = FormSchemaShapeSchema.safeParse({
      id: "form-1",
      title: "Contact",
      description: "Contact form",
      fields: [{ type: "text", name: "name" }],
      meta: { category: "contact" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects when fields is not an array", () => {
    const result = FormSchemaShapeSchema.safeParse({ fields: "not-array" });
    expect(result.success).toBe(false);
  });

  it("rejects when fields is missing", () => {
    const result = FormSchemaShapeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
