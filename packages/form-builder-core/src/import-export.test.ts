import { describe, it, expect } from "vitest";

import { parseImportedFormJson } from "./import-export";

// ---------------------------------------------------------------------------
// parseImportedFormJson
// ---------------------------------------------------------------------------

describe("parseImportedFormJson", () => {
  it("detects a modern FormSchema format", () => {
    const json = JSON.stringify({
      fields: [{ type: "text", name: "name" }],
      title: "Contact",
    });

    const result = parseImportedFormJson(json);
    expect(result.format).toBe("buzzform-schema");
    expect(result.state.fields).toEqual([{ type: "text", name: "name" }]);
    expect(result.state.formName).toBe("Contact");
  });

  it("detects a legacy builder backup format", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      formName: "Old Backup",
      nodes: {},
      rootIds: [],
    });

    const result = parseImportedFormJson(json);
    expect(result.format).toBe("builder-backup");
    expect(result.state.formName).toBe("Old Backup");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseImportedFormJson("not json")).toThrow("Invalid JSON");
  });

  it("throws on unrecognised format", () => {
    expect(() => parseImportedFormJson(JSON.stringify({ x: 1 }))).toThrow(
      "Unrecognised document format",
    );
  });

  it("uses formNameHint when the input lacks a name", () => {
    const json = JSON.stringify({
      fields: [{ type: "switch", name: "active" }],
    });

    const result = parseImportedFormJson(json, { formNameHint: "My Hint" });
    expect(result.state.formName).toBe("My Hint");
  });

  it("falls back to default name when nothing provides one", () => {
    const json = JSON.stringify({ fields: [] });

    const result = parseImportedFormJson(json);
    expect(result.state.formName).toBe("Imported Form");
  });

  it("generates a formId when none is present", () => {
    const json = JSON.stringify({ fields: [] });

    const result = parseImportedFormJson(json);
    expect(result.state.formId).toBeTruthy();
    expect(typeof result.state.formId).toBe("string");
  });

  it("preserves an existing formId from the input", () => {
    const json = JSON.stringify({
      fields: [],
      id: "existing-id",
    });

    const result = parseImportedFormJson(json);
    expect(result.state.formId).toBe("existing-id");
  });
});
