# @buildnbuzz/form-react

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
