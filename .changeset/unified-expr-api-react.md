---
"@buildnbuzz/form-react": patch
---

Unify runtime registries under FormRegistries and migrate to Expr<T>.

- Introduce `FormRegistries` container for fields, validators, resolvers, and fns.
- Add `registries` prop to `FormProvider`, `Form`, and `useForm`.
- Deprecate `registry`, `customValidators`, and `optionResolvers` top-level props in favor of the unified `registries` object.
- Update `Field` and `LayoutField` to use unified expression evaluator.
- Support inline functions as expressions for all dynamic field properties.
- Update documentation and canonical examples to modern expression syntax.
