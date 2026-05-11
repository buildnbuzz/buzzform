import type { Field, FieldType, OutputConfig } from "@buildnbuzz/form-core";
import type { 
  FieldRegistry, 
  FieldRegistryItem, 
  FieldRegistrySidebar,
  IconMetadata,
  Node,
  Viewport,
  BuilderMode,
  DropLocation,
  SaveStatus,
} from "@buildnbuzz/form-builder-core";
import type { ComponentType } from "react";

export type { 
  FieldRegistry, 
  FieldRegistryItem, 
  FieldRegistrySidebar,
  IconMetadata,
  Node,
  Viewport,
  BuilderMode,
  DropLocation,
  SaveStatus,
};

// ---------------------------------------------------------------------------
// Registry Types — React-specific extensions
// ---------------------------------------------------------------------------

/** Props passed to a custom builder node renderer. */
export interface BuilderNodeRendererProps {
  /** Unique node ID. */
  id: string;
  /** The field configuration. */
  field: Field;
  /** Flattened child node IDs (computed from all slots). */
  childrenIds: string[];
  /** Helper to render a specific slot's children natively integrating DnD sorting contexts. */
  renderSlot: (slotKey: string, strategy?: import("@dnd-kit/sortable").SortingStrategy) => React.ReactNode;
}

/**
 * A React-specific entry in the field registry.
 * Maps Core metadata to React components.
 */
export type BuilderFieldRegistryItem = FieldRegistryItem<
  IconMetadata,
  ComponentType<BuilderNodeRendererProps>
>;

/** The complete registry of available field types in the builder. */
export type BuilderFieldRegistry = FieldRegistry<
  IconMetadata,
  ComponentType<BuilderNodeRendererProps>
>;

/** Normalized sidebar item for rendering. */
export interface SidebarItem {
  type: string;
  label: string;
  icon?: IconMetadata;
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
  /** Timestamp of the last successful save. */
  lastSavedAt: number | null;
  /** Unique ID of the form being built. */
  formId: string;
  /** Name of the form being built. */
  formName: string;
  /** Output configuration for the form. */
  outputConfig?: OutputConfig;

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
  /** Updates form-level settings. */
  updateFormSettings: (updates: Partial<{ outputConfig: OutputConfig }>) => void;
  /** Clears the builder state. */
  clearState: () => void;
  /** Loads an existing form document into the builder. */
  loadDocumentState: (state: {
    nodes: Record<string, Node>;
    rootIds: string[];
    formId: string;
    formName: string;
    outputConfig?: OutputConfig;
  }) => void;
  /** Sets the save status manually. */
  setSaveStatus: (status: SaveStatus, timestamp?: number) => void;
  /** Updates the form name. */
  setFormName: (name: string) => void;
  /** Updates the form ID. */
  setFormId: (id: string) => void;

  /** Access to temporal (undo/redo) state. Only available if using the default store. */
  temporal?: unknown;
}

export interface BuilderStoreOptions {
  registry: BuilderFieldRegistry;
  name?: string;
  storage?: Storage;
}
