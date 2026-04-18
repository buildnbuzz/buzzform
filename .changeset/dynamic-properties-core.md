---
"@buildnbuzz/form-core": patch
---

Add support for dynamic validation messages, validator arguments ($args), and dynamic layout properties.

- Change validation `message` type from `string` to `ExprText` to enable dynamic error messages via `$text`, `$when`, and other expressions.
- Add `$args` expression node and `${/args/...}` template support for referencing resolved validator arguments (e.g., `min`, `max`).
- Enhance built-in `required` validator to support an optional `isRequired` argument for dynamic toggling.
- Introduce `resolveBooleanExpr` for optimized evaluation of boolean conditions like `$and` and `$or`.
- Add resolution helpers for layout fields (`tabs`, `collapsible`) to support dynamic labels and visibility states.
- Support dynamic `defaultValue` resolution in `extractDefaults`.
