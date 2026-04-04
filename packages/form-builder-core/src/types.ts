import type {
  DataField,
  Field,
  FieldType,
  UnknownData,
} from "@buildnbuzz/form-core";

// ---------------------------------------------------------------------------
// Node — the fundamental building block of the builder document
// ---------------------------------------------------------------------------

/**
 * A builder node wraps a `Field` from `@buildnbuzz/form-core` with tree
 * metadata (parent, slot-based children) for manipulation in the builder.
 *
 * Nodes are stored as a flat adjacency list: `Record<string, Node>` where
 * keys are node IDs and `rootIds` defines the entry points.
 */
export interface Node {
  /** Unique identifier for this node. */
  id: string;
  /** The form-core field that this node wraps. */
  field: Field;
  /** ID of the parent node, or `null` for root-level nodes. */
  parentId: string | null;
  /** Named slot within the parent (e.g. `"__tab_0"` for tabs, `null` for simple parents). */
  parentSlot: string | null;
  /**
   * Child node IDs organized by named slot.
   *
   * - Simple containers use a single `"__default__"` slot: `{ "__default__": ["a", "b"] }`
   * - Containers with named areas (tabs, split panels, modals, etc.) use descriptive keys.
   */
  children: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// UI state types (pure data, no DOM deps)
// ---------------------------------------------------------------------------

/** Viewport preset for the builder canvas preview. */
export type Viewport = "desktop" | "tablet" | "mobile";

/** Operating mode of the builder. */
export type BuilderMode = "edit" | "preview";

/** Computed drop location during a drag-and-drop operation. */
export interface DropLocation {
  /** Target parent node ID, or `null` for root-level drop. */
  parentId: string | null;
  /** Named slot within the target parent, or `null`. */
  parentSlot: string | null;
  /** Insertion index among the target parent's children. */
  index: number;
}

/** Persistence status indicator for auto-save. */
export type SaveStatus = "idle" | "saving" | "saved";

// ---------------------------------------------------------------------------
// Pure registry entry (no React / icon dependencies)
// ---------------------------------------------------------------------------

/**
 * A framework-agnostic definition of a field type for the builder.
 *
 * The React adapter extends this with `sidebar` (label + icon),
 * `renderer` (ComponentType), and other UI-specific metadata.
 */
export interface FieldDefinition {
  /**
   * Default property values for new instances of this field type.
   *
   * Used when a user drops a new field onto the canvas. The builder merges
   * generated values (e.g. `name`, `label`) into these defaults before
   * creating the `Node`.
   */
  defaultProps: UnknownData;
  /**
   * Field types that are allowed to be dropped inside this container.
   *
   * Only relevant when the field type is a container (`isContainerType`
   * returns `true`). An absent or empty array means "accept any field type."
   */
  accepts?: FieldType[];
  /**
   * Property editor configuration as a `Field[]` form for editing.
   *
   * When a node is selected, the builder renders a form from this `Field[]`
   * config in the properties panel. Each field in the array describes one
   * editable property (e.g. a text field for `label`, a checkbox for
   * `required`, a select for `output type`). The builder uses the form
   * values to patch the node's `field` object.
   */
  properties?: Field[];
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/**
 * Narrows a `Field` to a `DataField` by checking for a `name` property.
 */
export function isDataField(field: Field): field is DataField {
  return "name" in field && typeof field.name === "string";
}

// ---------------------------------------------------------------------------
