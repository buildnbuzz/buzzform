export type {
  Node,
  Viewport,
  BuilderMode,
  DropLocation,
  SaveStatus,
  FieldDefinition,
  FieldRegistry,
  FieldRegistryItem,
  FieldRegistrySidebar,
  IconMetadata,
} from "./types";

export { isDataField } from "./types";

export {
  DEFAULT_SLOT,
  getTabSlotKeys,
  getNodeChildren,
  getSlotKeys,
  getChildList,
  ensureChildList,
} from "./node-children";

export type { TreeState } from "./tree";
export {
  insertNode,
  moveNode,
  removeNodeTree as removeNode,
  duplicateNode,
  updateNode,
} from "./tree";

export { nodesToFields, nodeToField, getAllFieldNames } from "./schema-builder";

export { CURRENT_SCHEMA_VERSION, BUILDER_VERSION } from "./persistence";
export {
  BuilderDocumentMigrationError,
  migrateBuilderDocument,
} from "./persistence/migrations";
export type {
  FormSummary,
  BuilderStorageProvider,
} from "./persistence/provider";
export {
  FormSchemaValidationError,
  parseFormSchemaJson,
  serializeFormSchema,
  normalizeFormSchema,
  validateFormSchemaShape,
} from "./persistence/document";
export { parseImportedFormJson, fieldsToBuilderState } from "./import-export";
export type {
  ParsedImportPayload,
  ParseImportedFormJsonOptions,
} from "./import-export";

export {
  deepClone,
  extractPropertyEditorDefaults,
  sanitizeFieldConstraints,
  sanitizeFieldDefaults,
  flattenFieldToFormValues,
  collectNestedPaths,
  unflattenFormValues,
  generateSchemaKey,
  getNestedValue,
} from "./properties";

export {
  textFieldProperties,
  emailFieldProperties,
  passwordFieldProperties,
  textareaFieldProperties,
  numberFieldProperties,
  dateFieldProperties,
  selectFieldProperties,
  checkboxGroupFieldProperties,
  checkboxFieldProperties,
  switchFieldProperties,
  radioFieldProperties,
  tagsFieldProperties,
  groupFieldProperties,
  arrayFieldProperties,
  rowFieldProperties,
  tabsFieldProperties,
  collapsibleFieldProperties,
  formSettingsProperties,
} from "./field-properties";

export {
  getDropLocation,
  canDrop,
  isDescendant,
  toSafeFileName,
} from "./utils/dnd";
export * from "./utils/objects";
export * from "./utils/expressions";
export { syncRuntimeForm, computeSchemaSignature } from "./sync";
export * from "./registry";
export * from "./field-properties/base";
export * from "./field-properties/text";
export * from "./field-properties/email";
export * from "./field-properties/password";
export * from "./field-properties/textarea";
export * from "./field-properties/number";
export * from "./field-properties/checkbox";
export * from "./field-properties/switch";
export * from "./field-properties/select";
export * from "./field-properties/radio";
export * from "./field-properties/date";
export * from "./field-properties/tags";
export * from "./field-properties/group";
export * from "./field-properties/array";
export * from "./field-properties/row";
export * from "./field-properties/tabs";
export * from "./field-properties/collapsible";
export { generateComponentCode } from "./code-generator";

export { createBuilderStore, setupBuilderAutoSave } from "./store";
export type { Store, BuilderStoreOptions } from "./store";
