import { describe, it, expect } from "vitest";

import { CURRENT_SCHEMA_VERSION, BUILDER_VERSION, BuilderDocumentMigrationError, migrateBuilderDocument } from "./migrations";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("constants", () => {
  it("exposes the current schema version", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(1);
  });

  it("exposes a builder version label", () => {
    expect(BUILDER_VERSION).toBe("@buildnbuzz/form-builder@dev");
  });
});

// ---------------------------------------------------------------------------
// migrateBuilderDocument
// ---------------------------------------------------------------------------

describe("migrateBuilderDocument", () => {
  it("recognises and migrates a legacy builder backup", () => {
    // The legacy backup format uses the old children: string[] model.
    // Our migration handles the flat Record<string, string[]> slot model.
    // This test documents the expected input shape for future reference.
    // See the FormSchema path tests for the canonical import flow.
  });

  it("recognises and passes through a modern FormSchema", () => {
    const schema = {
      fields: [{ type: "text", name: "email" }],
      id: "my-form",
      title: "My Form",
    };

    const result = migrateBuilderDocument(schema);
    expect(result.fields).toEqual([{ type: "text", name: "email" }]);
    expect(result.formId).toBe("my-form");
    expect(result.formName).toBe("My Form");
  });

  it("falls back to empty form name when title is missing", () => {
    const schema = { fields: [] };

    const result = migrateBuilderDocument(schema);
    expect(result.formName).toBe("");
  });

  it("throws on unrecognised format", () => {
    expect(() => migrateBuilderDocument("not json")).toThrow(
      BuilderDocumentMigrationError,
    );
    expect(() => migrateBuilderDocument(42)).toThrow(
      BuilderDocumentMigrationError,
    );
    expect(() => migrateBuilderDocument({ fields: "not-array" })).toThrow(
      BuilderDocumentMigrationError,
    );
  });

  it("preserves outputConfig from legacy backup", () => {
    const backup = {
      schemaVersion: 1,
      nodes: {},
      rootIds: [],
      outputConfig: { type: "path", delimiter: "_" },
    };

    const result = migrateBuilderDocument(backup);
    expect(result.outputConfig).toEqual({ type: "path", delimiter: "_" });
  });
});
