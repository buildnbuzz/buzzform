import type { FormSchema } from "@buildnbuzz/form-core";

/**
 * Summary information about a stored form.
 * Used by the provider's `list()` method.
 */
export interface FormSummary {
  /** Unique form identifier. */
  formId: string;
  /** Human-readable form name. */
  formName: string;
  /** Timestamp (ms) when the form was last saved. */
  updatedAt: number;
}

/**
 * Abstract storage interface for persisting `FormSchema` documents.
 *
 * Consumers implement this to integrate the builder with their preferred
 * backend (localStorage, IndexedDB, Supabase, filesystem, etc.).
 */
export interface BuilderStorageProvider {
  /** Lists all stored forms with metadata. */
  list(): Promise<FormSummary[]>;

  /** Loads a form by ID. Returns `null` when not found. */
  load(formId: string): Promise<FormSchema | null>;

  /** Saves a form. Creates or replaces the document. */
  save(formId: string, schema: FormSchema): Promise<void>;

  /** Permanently removes a form. No-op when not found. */
  remove(formId: string): Promise<void>;
}
