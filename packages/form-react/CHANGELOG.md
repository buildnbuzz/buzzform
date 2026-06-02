# @buildnbuzz/form-react

## 0.1.12

### Patch Changes

- [#153](https://github.com/buildnbuzz/buzzform/pull/153) [`05dde69`](https://github.com/buildnbuzz/buzzform/commit/05dde690ad85159a253f73f1449c0fa6df3c5486) Thanks [@ladparth](https://github.com/ladparth)! - Add support for rendering UI layout fields and exporting new layout types.
  - Export `UiField`, `FormSchemaInput`, `FieldInput`, and `CustomFieldInput` from `packages/form-react`.
  - Include `"ui"` layout type in nested error count collections.
  - Export `defineField`, `defineFields` for programmatic field generation.

- Updated dependencies [[`05dde69`](https://github.com/buildnbuzz/buzzform/commit/05dde690ad85159a253f73f1449c0fa6df3c5486)]:
  - @buildnbuzz/form-core@0.1.10

## 0.1.11

### Patch Changes

- [#145](https://github.com/buildnbuzz/buzzform/pull/145) [`d8b17f1`](https://github.com/buildnbuzz/buzzform/commit/d8b17f155e775b57c6da9a6e4b8d1e0251f18344) Thanks [@ladparth](https://github.com/ladparth)! - Introduce React adapter support for the upload field type.
  - Provide React bindings and hook integrations for upload fields in `@buildnbuzz/form-react`.

- Updated dependencies [[`d8b17f1`](https://github.com/buildnbuzz/buzzform/commit/d8b17f155e775b57c6da9a6e4b8d1e0251f18344)]:
  - @buildnbuzz/form-core@0.1.9

## 0.1.10

### Patch Changes

- [#143](https://github.com/buildnbuzz/buzzform/pull/143) [`7b5ef55`](https://github.com/buildnbuzz/buzzform/commit/7b5ef55ae3ef2608a13c02f701343296765eaa2e) Thanks [@ladparth](https://github.com/ladparth)! - Upgrade TanStack Form dependencies to the latest version.
  - Update `@tanstack/form-core` to `^1.32.0`.
  - Update `@tanstack/react-form` to `^1.32.0`.

## 0.1.9

### Patch Changes

- [#134](https://github.com/buildnbuzz/buzzform/pull/134) [`646afd7`](https://github.com/buildnbuzz/buzzform/commit/646afd75404d6e3103f0adc889bc4f738d225b4e) Thanks [@ladparth](https://github.com/ladparth)! - Add useWatch hook and polymorphic `as` prop to Form component.
  - Implement `useWatch` hook for accessing form state.
  - Add polymorphic `as` prop to `Form` component for custom rendering.

## 0.1.8

### Patch Changes

- [#132](https://github.com/buildnbuzz/buzzform/pull/132) [`d0e37c2`](https://github.com/buildnbuzz/buzzform/commit/d0e37c285059bda239b9f6c80303081a8335a922) Thanks [@ladparth](https://github.com/ladparth)! - Implement dynamic validation message resolution and enhanced expression support in hooks and components.
  - Update `Field` and `LayoutField` components to use `resolveBooleanExpr` for robust evaluation of visibility and state properties (`condition`, `hidden`, `disabled`, etc.).
  - Enhance `useResolvedFieldText` to support `$fn` registry calls in dynamic labels, placeholders, and descriptions.
  - Support dynamic `defaultValue` resolution in `useForm` during initialization.
  - Improve registry merging logic to ensure consistent access to custom validators and functions across all resolution contexts.

- Updated dependencies [[`d0e37c2`](https://github.com/buildnbuzz/buzzform/commit/d0e37c285059bda239b9f6c80303081a8335a922)]:
  - @buildnbuzz/form-core@0.1.7

## 0.1.7

### Patch Changes

- [#130](https://github.com/buildnbuzz/buzzform/pull/130) [`dc9fd2e`](https://github.com/buildnbuzz/buzzform/commit/dc9fd2e0e65cc8028fd15db71baad12509176236) Thanks [@ladparth](https://github.com/ladparth)! - Resolve dynamic expression values (inline functions and AST objects) for field display text.
  - Updated `useResolvedFieldText` to support `label`, `placeholder`, and `description` as dynamic `Expr` values.
  - Added unit tests for dynamic text resolution in React components.
  - Updated documentation examples to showcase dynamic display text.

## 0.1.6

### Patch Changes

- [#127](https://github.com/buildnbuzz/buzzform/pull/127) [`d4302d9`](https://github.com/buildnbuzz/buzzform/commit/d4302d99280100cf3a2dcf64bd332cd850f9f3dc) Thanks [@ladparth](https://github.com/ladparth)! - Unify runtime registries under FormRegistries and migrate to Expr<T>.
  - Introduce `FormRegistries` container for fields, validators, resolvers, and fns.
  - Add `registries` prop to `FormProvider`, `Form`, and `useForm`.
  - Deprecate `registry`, `customValidators`, and `optionResolvers` top-level props in favor of the unified `registries` object.
  - Update `Field` and `LayoutField` to use unified expression evaluator.
  - Support inline functions as expressions for all dynamic field properties.
  - Update documentation and canonical examples to modern expression syntax.

- Updated dependencies [[`d4302d9`](https://github.com/buildnbuzz/buzzform/commit/d4302d99280100cf3a2dcf64bd332cd850f9f3dc)]:
  - @buildnbuzz/form-core@0.1.6

## 0.1.5

### Patch Changes

- [#124](https://github.com/buildnbuzz/buzzform/pull/124) [`0c2937c`](https://github.com/buildnbuzz/buzzform/commit/0c2937ca5a1357920b20a90b28f2056621f08a14) Thanks [@ladparth](https://github.com/ladparth)! - Implement cascading validation logic for derived checks.
  - Updated derived validation to be cumulative: `"blur"` mode now includes `"submit"` checks, and `"change"` mode includes both `"blur"` and `"submit"` checks.
  - Synchronized default `derivedValidationMode` to `"submit"` to match documentation and planned behavior.

- Updated dependencies [[`0c2937c`](https://github.com/buildnbuzz/buzzform/commit/0c2937ca5a1357920b20a90b28f2056621f08a14)]:
  - @buildnbuzz/form-core@0.1.5

## 0.1.4

### Patch Changes

- [#121](https://github.com/buildnbuzz/buzzform/pull/121) [`fdbaf50`](https://github.com/buildnbuzz/buzzform/commit/fdbaf50c1909ab2011f9cf814a3b564fb1430a5f) Thanks [@ladparth](https://github.com/ladparth)! - Add support for async field options and cascading dropdowns.
  - Enhance `useFieldOptions` hook with async loading state and error handling.
  - Implement automatic value clearing when field dependencies change or options become invalid.
  - Add `optionResolvers` support to `Form`, `Field`, and `FieldRenderer` components.
  - Implement request deduplication for concurrent option fetches.

- Updated dependencies [[`fdbaf50`](https://github.com/buildnbuzz/buzzform/commit/fdbaf50c1909ab2011f9cf814a3b564fb1430a5f)]:
  - @buildnbuzz/form-core@0.1.4

## 0.1.3

### Patch Changes

- [#118](https://github.com/buildnbuzz/buzzform/pull/118) [`bdcbbd8`](https://github.com/buildnbuzz/buzzform/commit/bdcbbd80ed39a0b8b09f115f6dc22daf607a0402) Thanks [@ladparth](https://github.com/ladparth)! - - Implemented global module augmentation for `@buildnbuzz/form-core` to natively support `ReactNode` in schema labels and descriptions.
  - Re-exported core schema utilities (`defineSchema`, `InferType`), types, and common helpers to provide a seamless single-import DX.
  - Updated `useResolvedFieldText` and `useDataField` hooks to safely handle and render `ReactNode` elements.
  - Fixed an infinite recursion bug in `resolveDynamicPaths` when encountering React elements or internal objects.
  - Moved `@buildnbuzz/form-core` and `@tanstack` dependencies to direct `dependencies` for a "one-line install" experience.
- Updated dependencies [[`bdcbbd8`](https://github.com/buildnbuzz/buzzform/commit/bdcbbd80ed39a0b8b09f115f6dc22daf607a0402)]:
  - @buildnbuzz/form-core@0.1.3

## 0.1.2

### Patch Changes

- [#113](https://github.com/buildnbuzz/buzzform/pull/113) [`2dd53b5`](https://github.com/buildnbuzz/buzzform/commit/2dd53b5f33a164d32c109e0f71eba65522f599dc) Thanks [@ladparth](https://github.com/ladparth)! - - Added support for `PrimitiveArrayField` in the form renderer.
  - Allowed array items without a `name` property to support direct mapping of primitive values.
  - Refactored `joinPointer` helper to be shared from `@buildnbuzz/form-core`.
  - Updated field text resolution and error counting hooks to handle primitive array structures.
- Updated dependencies [[`2dd53b5`](https://github.com/buildnbuzz/buzzform/commit/2dd53b5f33a164d32c109e0f71eba65522f599dc)]:
  - @buildnbuzz/form-core@0.1.2

## 0.1.1

### Patch Changes

- [#106](https://github.com/buildnbuzz/buzzform/pull/106) [`2d46033`](https://github.com/buildnbuzz/buzzform/commit/2d4603389252f571190c3f32acdd50e51c4d3e7b) Thanks [@ladparth](https://github.com/ladparth)! - ### @buildnbuzz/form-core
  - Changed default `derivedRun` to `submit` in validation logic to postpone automatic checks (like `required`) until form submission.

  ### @buildnbuzz/form-react
  - Added global `derivedValidationMode` support to `FormProvider` and renamed `RegistryContext` to `FormConfigContext`.
  - Updated `useForm` and `RenderFields` to automatically respect global validation configuration.
  - Refined internal `buildValidator` to skip checks for pristine (unmodified) fields unless the form is currently submitting, preventing premature validation errors.

- Updated dependencies [[`2d46033`](https://github.com/buildnbuzz/buzzform/commit/2d4603389252f571190c3f32acdd50e51c4d3e7b)]:
  - @buildnbuzz/form-core@0.1.1

## 0.1.0

- Initial public release.
