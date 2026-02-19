import type { ZodError } from "zod";
import type { Node } from "../types";
import {
  CURRENT_BUILDER_DOCUMENT_SCHEMA_VERSION,
  CURRENT_BUILDER_VERSION,
  migrateBuilderDocument,
} from "./migrations";
import {
  BuilderDocumentSchema,
  type BuilderDocument,
  type BuilderDocumentNode,
} from "./schemas";

export interface BuilderDocumentState {
  nodes: Record<string, Node>;
  rootIds: string[];
  formId: string;
  formName: string;
}

export interface CreateBuilderDocumentOptions {
  createdAt?: number;
  updatedAt?: number;
  builderVersion?: string;
}

export class BuilderDocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuilderDocumentValidationError";
  }
}
export { BuilderDocumentSchema } from "./schemas";

export function toBuilderDocument(
  state: BuilderDocumentState,
  options: CreateBuilderDocumentOptions = {},
): BuilderDocument {
  const now = Date.now();
  const createdAt = normalizeFiniteNumber(options.createdAt) ?? now;
  const updatedAt = normalizeFiniteNumber(options.updatedAt) ?? now;

  return {
    schemaVersion: CURRENT_BUILDER_DOCUMENT_SCHEMA_VERSION,
    builderVersion: normalizeString(options.builderVersion) ?? CURRENT_BUILDER_VERSION,
    formId: state.formId,
    formName: state.formName,
    nodes: toDocumentNodes(state.nodes),
    rootIds: [...state.rootIds],
    createdAt,
    updatedAt,
  };
}

export function fromBuilderDocument(
  document: BuilderDocument,
): BuilderDocumentState {
  const validated = validateBuilderDocument(document);

  return {
    formId: validated.formId,
    formName: validated.formName,
    nodes: toStateNodes(validated.nodes),
    rootIds: [...validated.rootIds],
  };
}

export function parseBuilderDocumentJson(json: string): BuilderDocument {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new BuilderDocumentValidationError("Invalid JSON document.");
  }

  return normalizeBuilderDocument(parsed);
}

export function normalizeBuilderDocument(input: unknown): BuilderDocument {
  const migrated = migrateBuilderDocument(input);
  return validateBuilderDocument(migrated);
}

export function validateBuilderDocument(input: unknown): BuilderDocument {
  const parsed = BuilderDocumentSchema.safeParse(input);
  if (!parsed.success) {
    throw new BuilderDocumentValidationError(formatZodError(parsed.error));
  }

  const document = toBuilderDocumentType(parsed.data);

  validateNodeTopology(document);

  return document;
}

function validateNodeTopology(document: BuilderDocument) {
  for (const rootId of document.rootIds) {
    if (!document.nodes[rootId]) {
      throw new BuilderDocumentValidationError(
        `rootIds contains unknown node "${rootId}".`,
      );
    }
  }

  for (const [nodeId, node] of Object.entries(document.nodes)) {
    if (node.parentId !== null && !document.nodes[node.parentId]) {
      throw new BuilderDocumentValidationError(
        `nodes.${nodeId}.parentId references unknown node "${node.parentId}".`,
      );
    }

    for (const childId of node.children) {
      if (!document.nodes[childId]) {
        throw new BuilderDocumentValidationError(
          `nodes.${nodeId}.children references unknown node "${childId}".`,
        );
      }
    }

    if (!node.tabChildren) {
      continue;
    }

    for (const [slot, childIds] of Object.entries(node.tabChildren)) {
      for (const childId of childIds) {
        if (!document.nodes[childId]) {
          throw new BuilderDocumentValidationError(
            `nodes.${nodeId}.tabChildren.${slot} references unknown node "${childId}".`,
          );
        }
      }
    }
  }
}

function toDocumentNodes(
  nodes: Record<string, Node>,
): Record<string, BuilderDocumentNode> {
  const output: Record<string, BuilderDocumentNode> = {};

  for (const [nodeId, node] of Object.entries(nodes)) {
    output[nodeId] = {
      id: node.id,
      field: deepClone(node.field) as unknown as BuilderDocumentNode["field"],
      parentId: node.parentId,
      parentSlot: node.parentSlot,
      children: [...node.children],
      ...(node.tabChildren ? { tabChildren: cloneTabChildren(node.tabChildren) } : {}),
    };
  }

  return output;
}

function toStateNodes(
  nodes: Record<string, BuilderDocumentNode>,
): Record<string, Node> {
  const output: Record<string, Node> = {};

  for (const [nodeId, node] of Object.entries(nodes)) {
    output[nodeId] = {
      id: normalizeString(node.id) ?? nodeId,
      field: deepClone(node.field) as unknown as Node["field"],
      parentId: node.parentId,
      parentSlot: node.parentSlot,
      children: [...node.children],
      ...(node.tabChildren ? { tabChildren: cloneTabChildren(node.tabChildren) } : {}),
    };
  }

  return output;
}

function cloneTabChildren(
  tabChildren: Record<string, string[]>,
): Record<string, string[]> {
  const output: Record<string, string[]> = {};

  for (const [slot, children] of Object.entries(tabChildren)) {
    output[slot] = [...children];
  }

  return output;
}

function toBuilderDocumentType(parsed: ParsedBuilderDocument): BuilderDocument {
  const nodes: Record<string, BuilderDocumentNode> = {};

  for (const [nodeId, node] of Object.entries(parsed.nodes)) {
    nodes[nodeId] = {
      id: normalizeString(node.id) ?? nodeId,
      field: deepClone(node.field),
      parentId: node.parentId,
      parentSlot: node.parentSlot,
      children: [...node.children],
      ...(node.tabChildren ? { tabChildren: cloneTabChildren(node.tabChildren) } : {}),
    };
  }

  return {
    schemaVersion: parsed.schemaVersion,
    builderVersion: parsed.builderVersion,
    formId: parsed.formId,
    formName: parsed.formName,
    nodes,
    rootIds: [...parsed.rootIds],
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
  };
}

type ParsedBuilderDocument = BuilderDocument;

function formatZodError(error: ZodError): string {
  if (error.issues.length === 0) {
    return "Document validation failed.";
  }

  const issue = error.issues[0];
  const path = issue.path.map(String).join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}

function deepClone<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    try {
      return globalThis.structuredClone(value);
    } catch {
      // Fall through to JSON clone.
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
}
