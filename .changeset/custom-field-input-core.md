---
"@buildnbuzz/form-core": patch
---

Support custom field input definitions across helper and schema APIs.

- Widen container field schema definitions to accept FieldInput instead of built-in Field types.
- Update traverse, defaults, visibility, and validation APIs to be compatible with custom fields.
- Update type guards isDataField and isLayoutField to handle FieldInput parameter.
