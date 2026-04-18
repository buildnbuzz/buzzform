---
"@buildnbuzz/form-react": patch
---

Implement dynamic validation message resolution and enhanced expression support in hooks and components.

- Update `Field` and `LayoutField` components to use `resolveBooleanExpr` for robust evaluation of visibility and state properties (`condition`, `hidden`, `disabled`, etc.).
- Enhance `useResolvedFieldText` to support `$fn` registry calls in dynamic labels, placeholders, and descriptions.
- Support dynamic `defaultValue` resolution in `useForm` during initialization.
- Improve registry merging logic to ensure consistent access to custom validators and functions across all resolution contexts.
