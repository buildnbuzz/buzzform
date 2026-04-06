---
"@buildnbuzz/form-core": patch
---

- Added `PrimitiveArrayField` to support flat value arrays (e.g., `tags: string[]`).
- Introduced `ArrayFieldDef` union for discriminated array variants.
- Added `isContainerType`, `isLayoutField`, and `isDataField` type guards.
- Enhanced `InferType` to support primitive arrays with optional child names.
- Updated validation logic to handle primitive array structures.
