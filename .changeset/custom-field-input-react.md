---
"@buildnbuzz/form-react": patch
---

Support custom field input definitions in React renderer and context hooks.

- Update FieldRenderer and RenderFields to support rendering and nested traversal of custom fields.
- Widen FieldRegistry to support component type indexing for arbitrary custom field type strings.
- Align useNestedErrorCount hooks to accept FieldInput components and correctly count nested custom fields errors.
