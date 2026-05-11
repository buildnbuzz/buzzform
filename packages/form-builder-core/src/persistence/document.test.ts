import { describe, it, expect } from "vitest";

import {
  FormSchemaValidationError,
  parseFormSchemaJson,
  serializeFormSchema,
  normalizeFormSchema,
  validateFormSchemaShape,
} from "./document";

// ---------------------------------------------------------------------------
// parseFormSchemaJson
// ---------------------------------------------------------------------------

describe("parseFormSchemaJson", () => {
  it("parses a valid FormSchema JSON", () => {
    const json = JSON.stringify({
      fields: [{ type: "text", name: "email" }],
      title: "Contact",
    });

    const result = parseFormSchemaJson(json);
    expect(result.fields).toEqual([{ type: "text", name: "email" }]);
    expect(result.title).toBe("Contact");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseFormSchemaJson("not json")).toThrow(
      FormSchemaValidationError,
    );
  });

  it("throws on unrecognised format", () => {
    expect(() => parseFormSchemaJson(JSON.stringify({ fields: "not-array" }))).toThrow(
      BuilderDocumentMigrationError,
    );
  });

  it("migrates a legacy backup into FormSchema shape", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      formId: "abc",
      formName: "Old Form",
      nodes: {},
      rootIds: [],
    });

    const result = parseFormSchemaJson(json);
    expect(result.title).toBe("Old Form");
    expect(result.id).toBe("abc");
    expect(result.fields).toEqual([]);
  });
});

import { BuilderDocumentMigrationError } from "./migrations";

// ---------------------------------------------------------------------------
// serializeFormSchema
// ---------------------------------------------------------------------------

describe("serializeFormSchema", () => {
  it("serialises a FormSchema to JSON", () => {
    const schema = {
      fields: [{ type: "text" as const, name: "name" }],
      title: "Test",
    };

    const json = serializeFormSchema(schema);
    const parsed = JSON.parse(json);
    expect(parsed.title).toBe("Test");
    expect(parsed.fields).toEqual([{ type: "text", name: "name" }]);
  });
});

// ---------------------------------------------------------------------------
// normalizeFormSchema
// ---------------------------------------------------------------------------

describe("normalizeFormSchema", () => {
  it("passes through a modern FormSchema", () => {
    const input = {
      fields: [{ type: "email", name: "email" }],
      title: "My Form",
    };

    const result = normalizeFormSchema(input);
    expect(result.fields).toEqual([{ type: "email", name: "email" }]);
    expect(result.title).toBe("My Form");
  });

  it("migrates a legacy backup with nodes", () => {
    const input = {
      schemaVersion: 1,
      formName: "Legacy",
      nodes: {},
      rootIds: [],
    };

    const result = normalizeFormSchema(input);
    expect(result.title).toBe("Legacy");
  });

  it("throws on unrecognised format", () => {
    expect(() => normalizeFormSchema(42)).toThrow(
      BuilderDocumentMigrationError,
    );
  });
});

// ---------------------------------------------------------------------------
// validateFormSchemaShape
// ---------------------------------------------------------------------------

describe("validateFormSchemaShape", () => {
  it("passes a valid schema shape", () => {
    expect(() =>
      validateFormSchemaShape({ fields: [] }),
    ).not.toThrow();
  });

  it("rejects a schema without fields", () => {
    expect(() => validateFormSchemaShape({})).toThrow(
      FormSchemaValidationError,
    );
  });

  it("rejects when fields is not an array", () => {
    expect(() =>
      validateFormSchemaShape({ fields: "not-array" }),
    ).toThrow(FormSchemaValidationError);
  });
});
