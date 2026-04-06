---
"@buildnbuzz/form-react": patch
---

- Added support for `PrimitiveArrayField` in the form renderer.
- Allowed array items without a `name` property to support direct mapping of primitive values.
- Refactored `joinPointer` helper to be shared from `@buildnbuzz/form-core`.
- Updated field text resolution and error counting hooks to handle primitive array structures.
