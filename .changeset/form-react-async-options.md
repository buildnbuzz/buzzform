---
"@buildnbuzz/form-react": patch
---

Add support for async field options and cascading dropdowns.

- Enhance `useFieldOptions` hook with async loading state and error handling.
- Implement automatic value clearing when field dependencies change or options become invalid.
- Add `optionResolvers` support to `Form`, `Field`, and `FieldRenderer` components.
- Implement request deduplication for concurrent option fetches.
