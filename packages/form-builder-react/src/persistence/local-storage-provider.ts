import {
  FormSchemaValidationError,
  parseFormSchemaJson,
} from "@buildnbuzz/form-builder-core";
import type {
  BuilderStorageProvider,
  FormSummary,
} from "@buildnbuzz/form-builder-core";
import type { FormSchema } from "@buildnbuzz/form-core";
import { z } from "zod";

const DEFAULT_NAMESPACE = "buzzform-builder:forms";
const INDEX_KEY_SUFFIX = "index";
const DOCUMENT_KEY_PREFIX = "document:";

export class LocalStorageProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalStorageProviderError";
  }
}

export class LocalStorageProviderNotFoundError extends LocalStorageProviderError {
  constructor(formId: string) {
    super(`Form "${formId}" was not found in local storage.`);
    this.name = "LocalStorageProviderNotFoundError";
  }
}

export interface LocalStorageProviderOptions {
  storage?: Storage;
  namespace?: string;
}

const FormSummarySchema = z.object({
  formId: z.string(),
  formName: z.string(),
  updatedAt: z.number(),
});

export class LocalStorageProvider implements BuilderStorageProvider {
  private readonly storage: Storage;
  private readonly namespace: string;

  constructor(options: LocalStorageProviderOptions = {}) {
    this.storage = resolveStorage(options.storage);
    this.namespace = normalizeNamespace(options.namespace) ?? DEFAULT_NAMESPACE;
  }

  async list(): Promise<FormSummary[]> {
    const index = this.readIndex();
    let didMutateIndex = false;

    for (const formId of Object.keys(index)) {
      if (!this.storage.getItem(this.documentKey(formId))) {
        delete index[formId];
        didMutateIndex = true;
      }
    }

    if (didMutateIndex) {
      this.writeIndex(index);
    }

    return Object.values(index).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async load(formId: string): Promise<FormSchema | null> {
    const normalizedId = normalizeFormId(formId);
    const raw = this.storage.getItem(this.documentKey(normalizedId));

    if (!raw) {
      return null;
    }

    try {
      const document = parseFormSchemaJson(raw);
      this.updateIndex(document, normalizedId);
      return document;
    } catch (error) {
      throw new LocalStorageProviderError(
        toStorageErrorMessage("Failed to load local document", error),
      );
    }
  }

  async save(formId: string, schema: FormSchema): Promise<void> {
    const normalizedId = normalizeFormId(formId);

    try {
      this.storage.setItem(
        this.documentKey(normalizedId),
        JSON.stringify(schema),
      );
      this.updateIndex(schema, normalizedId);
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new LocalStorageProviderError("Local storage quota exceeded.");
      }
      throw new LocalStorageProviderError(
        toStorageErrorMessage("Failed to save local document", error),
      );
    }
  }

  async remove(formId: string): Promise<void> {
    const normalizedId = normalizeFormId(formId);

    this.storage.removeItem(this.documentKey(normalizedId));

    const index = this.readIndex();
    if (index[normalizedId]) {
      delete index[normalizedId];
      this.writeIndex(index);
    }
  }

  private updateIndex(document: FormSchema, formId: string) {
    const index = this.readIndex();
    const now = Date.now();
    index[formId] = {
      formId,
      formName: document.title || "Untitled Form",
      updatedAt: index[formId]?.updatedAt ?? now,
    };
    this.writeIndex(index);
  }

  private readIndex(): Record<string, FormSummary> {
    const raw = this.storage.getItem(this.indexKey());
    if (!raw) {
      return {};
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }

    if (!isRecord(parsed)) {
      return {};
    }

    const output: Record<string, FormSummary> = {};

    for (const [formId, value] of Object.entries(parsed)) {
      if (!isRecord(value)) {
        continue;
      }

      const summary = FormSummarySchema.safeParse(value);
      if (!summary.success) {
        continue;
      }

      const normalizedId = normalizeFormId(formId);
      if (summary.data.formId !== normalizedId) {
        continue;
      }

      output[normalizedId] = summary.data;
    }

    return output;
  }

  private writeIndex(index: Record<string, FormSummary>) {
    try {
      this.storage.setItem(this.indexKey(), JSON.stringify(index));
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new LocalStorageProviderError(
          "Local storage quota exceeded while updating index.",
        );
      }
    }
  }

  private indexKey(): string {
    return `${this.namespace}:${INDEX_KEY_SUFFIX}`;
  }

  private documentKey(formId: string): string {
    return `${this.namespace}:${DOCUMENT_KEY_PREFIX}${formId}`;
  }
}

let browserLocalStorageProvider: LocalStorageProvider | null = null;

export function getBrowserLocalStorageProvider(): LocalStorageProvider {
  if (!browserLocalStorageProvider) {
    browserLocalStorageProvider = new LocalStorageProvider();
  }
  return browserLocalStorageProvider;
}

function resolveStorage(storage?: Storage): Storage {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  throw new LocalStorageProviderError(
    "window.localStorage is unavailable in this environment.",
  );
}

function normalizeNamespace(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeFormId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new LocalStorageProviderError("formId must be a non-empty string.");
  }
  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toStorageErrorMessage(prefix: string, error: unknown): string {
  if (error instanceof FormSchemaValidationError) {
    return `${prefix}: ${error.message}`;
  }
  if (error instanceof Error) {
    return `${prefix}: ${error.message}`;
  }
  return `${prefix}.`;
}
