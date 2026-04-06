# @buildnbuzz/form-core

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
