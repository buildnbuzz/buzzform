export type {
  Node,
  Viewport,
  BuilderMode,
  DropLocation,
  SaveStatus,
  FieldDefinition,
} from "./types";

export { isDataField } from "./types";

export { DEFAULT_SLOT, getTabSlotKeys, getNodeChildren, getSlotKeys, getChildList, ensureChildList } from "./node-children";

export { nodesToFields, nodeToField, getAllFieldNames } from "./schema-builder";

export { CURRENT_SCHEMA_VERSION, BUILDER_VERSION } from "./persistence";
export { BuilderDocumentMigrationError, migrateBuilderDocument } from "./persistence/migrations";
export type { FormSummary, BuilderStorageProvider } from "./persistence/provider";
export { FormSchemaValidationError, parseFormSchemaJson, serializeFormSchema, normalizeFormSchema, validateFormSchemaShape } from "./persistence/document";
export { parseImportedFormJson } from "./import-export";
export type { ImportPayloadFormat, ParsedImportPayload, ParseImportedFormJsonOptions } from "./import-export";

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

export { getDropLocation, canDrop, isDescendant, toSafeFileName } from "./utils/dnd";
