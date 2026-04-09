---
"@buildnbuzz/form-core": patch
---

- Introduced `FrameworkOverrides` interface to support global module augmentation for UI-specific text types.
- Updated `label` and `description` in `BaseField`, `FieldOption`, and `Tab` to use `DynamicText` (supports framework-specific overrides like `ReactNode`).
- Transitioned all field and tab collections (`fields`, `tabs`) to `readonly` to enforce schema immutability.
- Broadened `walkFields`, `extractDependenciesFromFields`, and `getVisibleFields` to handle `readonly` arrays and generic field shapes.
