---
"@buildnbuzz/form-core": patch
---

Unify dynamic expression APIs and logic under Expr<T>.

- Introduce `Expr<T>` unified expression system replacing DynamicValue and VisibilityCondition.
- Add `$text` node for string interpolation.
- Add `$when` node for conditional branching (ternary).
- Add `$fn` node for calling custom registry functions.
- Introduce `ExprContext` with `data` and `context` properties.
- Fix `InferType` for empty-name primitive arrays to produce flat arrays.
- Deprecate `evaluateVisibility`, `resolveDynamicValue`, and old context types.
