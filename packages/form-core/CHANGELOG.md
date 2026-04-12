# @buildnbuzz/form-core

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
