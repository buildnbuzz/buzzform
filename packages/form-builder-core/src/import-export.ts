import { nanoid } from "nanoid";

import { migrateBuilderDocument } from "./persistence/migrations";

export type ImportPayloadFormat = "builder-backup" | "buzzform-schema";

export interface ParsedImportPayload {
  /** Which format was detected in the input. */
  format: ImportPayloadFormat;
  /** Normalised `FormSchema`-compatible data ready for import. */
  state: {
    fields: unknown[];
    formId: string;
    formName: string;
    outputConfig?: unknown;
  };
}

export interface ParseImportedFormJsonOptions {
  /** Hint for the form name when the input doesn't include one. */
  formNameHint?: string;
}

/**
 * Detects the format of a pasted JSON string and returns a normalised
 * payload ready for import.
 *
 * Supports:
 * - **builder-backup** — legacy flat Node tree (`nodes` + `rootIds`)
 * - **buzzform-schema** — modern `FormSchema` shape (`fields` array)
 *
 * @throws {Error} When the JSON is malformed or the format is unrecognised.
 */
export function parseImportedFormJson(
  json: string,
  options: ParseImportedFormJsonOptions = {},
): ParsedImportPayload {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON document.");
  }

  const migrated = migrateBuilderDocument(parsed);

  const format = isBuilderBackup(parsed)
    ? "builder-backup"
    : "buzzform-schema";

  const formName =
    normalizeFormName(migrated.formName) ??
    normalizeFormName(options.formNameHint) ??
    "Imported Form";

  return {
    format,
    state: {
      ...migrated,
      formName,
      formId: migrated.formId || nanoid(),
    },
  };
}

function isBuilderBackup(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    "nodes" in value
  );
}

function normalizeFormName(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
