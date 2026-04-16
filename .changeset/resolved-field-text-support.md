---
"@buildnbuzz/form-react": patch
---

Resolve dynamic expression values (inline functions and AST objects) for field display text.

- Updated `useResolvedFieldText` to support `label`, `placeholder`, and `description` as dynamic `Expr` values.
- Added unit tests for dynamic text resolution in React components.
- Updated documentation examples to showcase dynamic display text.
