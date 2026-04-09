---
"@buildnbuzz/form-react": patch
---

- Implemented global module augmentation for `@buildnbuzz/form-core` to natively support `ReactNode` in schema labels and descriptions.
- Re-exported core schema utilities (`defineSchema`, `InferType`), types, and common helpers to provide a seamless single-import DX.
- Updated `useResolvedFieldText` and `useDataField` hooks to safely handle and render `ReactNode` elements.
- Fixed an infinite recursion bug in `resolveDynamicPaths` when encountering React elements or internal objects.
- Moved `@buildnbuzz/form-core` and `@tanstack` dependencies to direct `dependencies` for a "one-line install" experience.
