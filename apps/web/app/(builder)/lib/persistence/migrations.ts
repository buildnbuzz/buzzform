export const CURRENT_BUILDER_DOCUMENT_SCHEMA_VERSION = 1;
export const CURRENT_BUILDER_VERSION = "buzzform-builder@dev";

export class BuilderDocumentMigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuilderDocumentMigrationError";
  }
}

type Migration = (document: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, Migration> = {
  0: migrateFromV0ToV1,
};

export function migrateBuilderDocument(
  input: unknown,
  targetVersion = CURRENT_BUILDER_DOCUMENT_SCHEMA_VERSION,
): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new BuilderDocumentMigrationError("Document must be an object.");
  }

  let current = cloneRecord(input);
  let currentVersion = getSchemaVersion(current);

  if (currentVersion > targetVersion) {
    throw new BuilderDocumentMigrationError(
      `Unsupported schemaVersion ${currentVersion}. Target is ${targetVersion}.`,
    );
  }

  while (currentVersion < targetVersion) {
    const migration = MIGRATIONS[currentVersion];
    if (!migration) {
      throw new BuilderDocumentMigrationError(
        `No migration path from schemaVersion ${currentVersion} to ${targetVersion}.`,
      );
    }

    const next = migration(current);
    const nextVersion = getSchemaVersion(next);

    if (nextVersion <= currentVersion) {
      throw new BuilderDocumentMigrationError(
        `Migration from schemaVersion ${currentVersion} did not advance version.`,
      );
    }

    current = next;
    currentVersion = nextVersion;
  }

  return current;
}

function migrateFromV0ToV1(
  document: Record<string, unknown>,
): Record<string, unknown> {
  const now = Date.now();
  const createdAt = toFiniteNumber(document.createdAt) ?? now;
  const updatedAt = toFiniteNumber(document.updatedAt) ?? createdAt;

  return {
    ...document,
    schemaVersion: 1,
    builderVersion: asNonEmptyString(document.builderVersion) ?? CURRENT_BUILDER_VERSION,
    formId: asNonEmptyString(document.formId) ?? createFallbackFormId(),
    formName: asNonEmptyString(document.formName) ?? "Untitled form",
    nodes: isRecord(document.nodes) ? cloneRecord(document.nodes) : {},
    rootIds: toStringArray(document.rootIds),
    createdAt,
    updatedAt,
  };
}

function getSchemaVersion(document: Record<string, unknown>): number {
  const value = document.schemaVersion;

  if (value === undefined) {
    return 0;
  }

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    !Number.isFinite(value)
  ) {
    throw new BuilderDocumentMigrationError(
      "schemaVersion must be a non-negative integer.",
    );
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneRecord(record: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    output[key] = value;
  }
  return output;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}

function createFallbackFormId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `form-${Date.now().toString(36)}-${random}`;
}
