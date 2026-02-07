/**
 * Schema builders for all field types.
 * Re-exports all builders from individual files.
 */

// Text-based fields
export {
  createTextFieldSchema,
  createEmailFieldSchema,
  createPasswordFieldSchema,
} from "./text";

// Number fields
export { createNumberFieldSchema } from "./number";

// Date fields
export { createDateFieldSchema } from "./date";

// Selection fields
export {
  createSelectFieldSchema,
  createRadioFieldSchema,
  createCheckboxGroupFieldSchema,
} from "./select";

// Boolean fields
export { createCheckboxFieldSchema, createSwitchFieldSchema } from "./boolean";

// Upload fields
export { createUploadFieldSchema } from "./upload";

// Tags fields
export { createTagsFieldSchema } from "./tags";

// Composite fields (need fieldsToZodSchema passed in)
export { createArrayFieldSchema, createGroupFieldSchema } from "./composite";
