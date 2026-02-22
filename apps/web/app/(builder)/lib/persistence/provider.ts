import type { BuilderDocument, FormSummary } from "./schemas";

export interface BuilderStorageProvider {
  list(): Promise<FormSummary[]>;
  load(formId: string): Promise<BuilderDocument>;
  save(formId: string, document: BuilderDocument): Promise<void>;
  remove(formId: string): Promise<void>;
}
