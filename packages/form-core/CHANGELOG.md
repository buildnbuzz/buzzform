# @buildnbuzz/form-core

## 0.1.11

### Patch Changes

- [#155](https://github.com/buildnbuzz/buzzform/pull/155) [`bfe3121`](https://github.com/buildnbuzz/buzzform/commit/bfe31217c93f71a1cfc49e0d205357a4bf1fd0fa) Thanks [@ladparth](https://github.com/ladparth)! - Fix default value extraction for upload fields.
  - Correct `extractDefaults` to return `[]` when `hasMany: true` is configured.
  - Correct `extractDefaults` to return `null` for single file uploads instead of an empty string `""`.

## 0.1.10

### Patch Changes

- [#153](https://github.com/buildnbuzz/buzzform/pull/153) [`05dde69`](https://github.com/buildnbuzz/buzzform/commit/05dde690ad85159a253f73f1449c0fa6df3c5486) Thanks [@ladparth](https://github.com/ladparth)! - Add support for the new UI field layout type and unregistered custom field types.
  - Add `UiField` layout field type for rendering inline dynamic HTML or React markup.
  - Allow defining custom, unregistered field types inside `defineSchema` with automatic typings.
  - Downgrade the unrecognized field type check from an error to a warning in the schema validator.
  - Add `defineField` and `defineFields` helper functions for programmatic field generation.

## 0.1.9

### Patch Changes

- [#145](https://github.com/buildnbuzz/buzzform/pull/145) [`d8b17f1`](https://github.com/buildnbuzz/buzzform/commit/d8b17f155e775b57c6da9a6e4b8d1e0251f18344) Thanks [@ladparth](https://github.com/ladparth)! - Introduce core support for the upload field type.
  - Add upload field type definition and core validation rules (maxSize, minSelected, maxSelected) in `@buildnbuzz/form-core`.

## 0.1.8

### Patch Changes

- [#141](https://github.com/buildnbuzz/buzzform/pull/141) [`61c3841`](https://github.com/buildnbuzz/buzzform/commit/61c38413eb3ea54ae0e4532d7b69ac34c036ebd1) Thanks [@ladparth](https://github.com/ladparth)! - feat(form-core): add serializable schema primitives, validator, and metadata
  - Add `SerializableFormSchema` types for headless serialization
  - Implement `validateSchema` with structure and identity checks
  - Implement `autoFixSchema` for common schema errors
  - Add `FIELD_TYPE_META` for field capability discovery
  - Export serialization utilities: `isSerializable`, `toSerializable`, `serializeSchema`

## 0.1.7

### Patch Changes

- [#132](https://github.com/buildnbuzz/buzzform/pull/132) [`d0e37c2`](https://github.com/buildnbuzz/buzzform/commit/d0e37c285059bda239b9f6c80303081a8335a922) Thanks [@ladparth](https://github.com/ladparth)! - Add support for dynamic validation messages, validator arguments ($args), and dynamic layout properties.
  - Change validation `message` type from `string` to `ExprText` to enable dynamic error messages via `$text`, `$when`, and other expressions.
  - Add `$args` expression node and `${/args/...}` template support for referencing resolved validator arguments (e.g., `min`, `max`).
  - Enhance built-in `required` validator to support an optional `isRequired` argument for dynamic toggling.
  - Introduce `resolveBooleanExpr` for optimized evaluation of boolean conditions like `$and` and `$or`.
  - Add resolution helpers for layout fields (`tabs`, `collapsible`) to support dynamic labels and visibility states.
  - Support dynamic `defaultValue` resolution in `extractDefaults`.

## 0.1.6

### Patch Changes

- [#127](https://github.com/buildnbuzz/buzzform/pull/127) [`d4302d9`](https://github.com/buildnbuzz/buzzform/commit/d4302d99280100cf3a2dcf64bd332cd850f9f3dc) Thanks [@ladparth](https://github.com/ladparth)! - Unify dynamic expression APIs and logic under Expr<T>.
  - Introduce `Expr<T>` unified expression system replacing DynamicValue and VisibilityCondition.
  - Add `$text` node for string interpolation.
  - Add `$when` node for conditional branching (ternary).
  - Add `$fn` node for calling custom registry functions.
  - Introduce `ExprContext` with `data` and `context` properties.
  - Fix `InferType` for empty-name primitive arrays to produce flat arrays.
  - Deprecate `evaluateVisibility`, `resolveDynamicValue`, and old context types.

## 0.1.5

### Patch Changes

- [#124](https://github.com/buildnbuzz/buzzform/pull/124) [`0c2937c`](https://github.com/buildnbuzz/buzzform/commit/0c2937ca5a1357920b20a90b28f2056621f08a14) Thanks [@ladparth](https://github.com/ladparth)! - Correct primitive array type inference for named child fields.
  - Ensure that child fields with explicitly defined names are correctly inferred as wrapped objects (`{ name: value }[]`) rather than flat values.

## 0.1.4

### Patch Changes

- [#121](https://github.com/buildnbuzz/buzzform/pull/121) [`fdbaf50`](https://github.com/buildnbuzz/buzzform/commit/fdbaf50c1909ab2011f9cf814a3b564fb1430a5f) Thanks [@ladparth](https://github.com/ladparth)! - Introduce async option resolvers and enhanced dependency tracking.
  - Add `OptionResolverRegistry` and `OptionResolver` types for async data fetching.
  - Implement `defineOptionResolvers` helper for type-safe resolver registration.
  - Update `resolveOptions` to support dynamic option sources.

## 0.1.3

### Patch Changes

- [#118](https://github.com/buildnbuzz/buzzform/pull/118) [`bdcbbd8`](https://github.com/buildnbuzz/buzzform/commit/bdcbbd80ed39a0b8b09f115f6dc22daf607a0402) Thanks [@ladparth](https://github.com/ladparth)! - - Introduced `FrameworkOverrides` interface to support global module augmentation for UI-specific text types.
  - Updated `label` and `description` in `BaseField`, `FieldOption`, and `Tab` to use `DynamicText` (supports framework-specific overrides like `ReactNode`).
  - Transitioned all field and tab collections (`fields`, `tabs`) to `readonly` to enforce schema immutability.
  - Broadened `walkFields`, `extractDependenciesFromFields`, and `getVisibleFields` to handle `readonly` arrays and generic field shapes.

## 0.1.2

### Patch Changes

- [#113](https://github.com/buildnbuzz/buzzform/pull/113) [`2dd53b5`](https://github.com/buildnbuzz/buzzform/commit/2dd53b5f33a164d32c109e0f71eba65522f599dc) Thanks [@ladparth](https://github.com/ladparth)! - - Added `PrimitiveArrayField` to support flat value arrays (e.g., `tags: string[]`).
  - Introduced `ArrayFieldDef` union for discriminated array variants.
  - Added `isContainerType`, `isLayoutField`, and `isDataField` type guards.
  - Enhanced `InferType` to support primitive arrays with optional child names.
  - Updated validation logic to handle primitive array structures.

## 0.1.1

### Patch Changes

- [#106](https://github.com/buildnbuzz/buzzform/pull/106) [`2d46033`](https://github.com/buildnbuzz/buzzform/commit/2d4603389252f571190c3f32acdd50e51c4d3e7b) Thanks [@ladparth](https://github.com/ladparth)! - ### @buildnbuzz/form-core
  - Changed default `derivedRun` to `submit` in validation logic to postpone automatic checks (like `required`) until form submission.

  ### @buildnbuzz/form-react
  - Added global `derivedValidationMode` support to `FormProvider` and renamed `RegistryContext` to `FormConfigContext`.
  - Updated `useForm` and `RenderFields` to automatically respect global validation configuration.
  - Refined internal `buildValidator` to skip checks for pristine (unmodified) fields unless the form is currently submitting, preventing premature validation errors.

## 0.1.0

- Initial public release.
