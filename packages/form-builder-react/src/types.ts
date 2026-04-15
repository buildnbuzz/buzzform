import type { Field, FieldType } from "@buildnbuzz/form-core";
import type {
  Node,
  Viewport,
  BuilderMode,
  DropLocation,
  SaveStatus,
} from "@buildnbuzz/form-builder-core";
import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Registry Types — React-specific extensions
// ---------------------------------------------------------------------------

/** Category for grouping fields in the sidebar palette. */
export type SidebarCategory = "inputs" | "selection" | "layout" | (string & {});

/** Sidebar visual data for a field type. */
export interface BuilderFieldSidebar {
  /** Human-readable label (e.g. "Text Input"). */
  label: string;
  /** Icon component (e.g. from HugeIcons or Lucide). */
  icon: ComponentType<{ className?: string }>;
  /** Category for structural grouping. */
  category: SidebarCategory;
  /** Whether this field is currently unavailable in the builder. */
  disabled?: boolean;
}

/** Props passed to a custom builder node renderer. */
export interface BuilderNodeRendererProps {
  /** Unique node ID. */
  id: string;
  /** The field configuration. */
  field: Field;
  /** Flattened child node IDs (computed from all slots). */
  childrenIds: string[];
}

/**
 * A React-specific definition of a field type for the builder.
 *
 * Extends the framework-agnostic `FieldDefinition` with UI metadata.
 */
export interface BuilderFieldRegistryEntry<TField extends Field = Field> {
  /** Whether this is a 'data' field (has a name) or 'layout' field. */
  kind: "data" | "layout";
  /** Sidebar palette configuration. */
  sidebar: BuilderFieldSidebar;
  /** Default property values for new nodes. */
  defaultProps: Omit<TField, "name"> & { name?: string };
  /** Optional custom renderer for container layouts. */
  renderer?: ComponentType<BuilderNodeRendererProps>;
  /** Property editor configuration (array of BuzzForm fields). */
  properties?: Field[];
  /** Accepted child field types (if a container). */
  accepts?: FieldType[];
}

/** The complete registry of available field types in the builder. */
export type BuilderFieldRegistry = Partial<{
  [K in FieldType]: BuilderFieldRegistryEntry<Extract<Field, { type: K }>>;
}>;

/** Normalized sidebar item for rendering. */
export interface SidebarItem {
  type: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Store Interface — The contract between the UI and state management
// ---------------------------------------------------------------------------

/**
 * Interface that any state management solution (Zustand, Redux, etc.) must 
 * satisfy to work with the `@buildnbuzz/form-builder-react` components.
 */
export interface BuilderStoreInterface {
  // --- State ---
  /** Flat adjacency list of all nodes. */
  nodes: Record<string, Node>;
  /** Top-level node IDs. */
  rootIds: string[];
  /** ID of the currently selected node for editing. */
  selectedId: string | null;
  /** Active tab slot for each tabs node. */
  activeTabs: Record<string, string>;
  /** Whether a node is collapsed in the tree/canvas. */
  collapsedNodes: Record<string, boolean>;
  /** Preview mode state. */
  mode: BuilderMode;
  /** Viewport preset (mobile/tablet/desktop). */
  viewport: Viewport;
  /** Canvas zoom level (0.1 to 2.0). */
  zoom: number;
  /** Current drag-and-drop indicator position. */
  dropIndicator: DropLocation | null;
  /** Persistence status. */
  saveStatus: SaveStatus;

  // --- Actions ---
  /** Selects a node by ID. */
  selectNode: (id: string | null) => void;
  /** Updates the field configuration of a node. */
  updateNode: (id: string, updates: Partial<Field>) => void;
  /** Creates a new node. */
  createNode: (type: FieldType, parentId: string | null, index?: number, parentSlot?: string | null) => void;
  /** Moves an existing node. */
  moveNode: (id: string, newParentId: string | null, index: number, newParentSlot?: string | null) => void;
  /** Removes a node and its children. */
  removeNode: (id: string) => void;
  /** Clones a node and its tree. */
  duplicateNode: (id: string) => void;
  /** Sets the active tab for a container. */
  setActiveTab: (nodeId: string, slot: string) => void;
  /** Toggles the collapsed state of a node. */
  toggleCollapsed: (nodeId: string) => void;
  /** Explicitly sets the collapsed state of a node. */
  setCollapsed: (nodeId: string, collapsed: boolean) => void;
  /** Positions the visual drop indicator. */
  setDropIndicator: (value: DropLocation | null) => void;
  /** Updates the preview mode. */
  setMode: (mode: BuilderMode) => void;
  /** Updates the viewport. */
  setViewport: (viewport: Viewport) => void;
  /** Updates the zoom level. */
  setZoom: (zoom: number) => void;

  /** Access to temporal (undo/redo) state. Only available if using the default store. */
  temporal?: unknown;
}
