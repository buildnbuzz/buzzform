# @buildnbuzz/buzzform

## 0.1.7

### Patch Changes

- 68dfd8b: **Features**
  - Added **Output Configuration** support to transform form data into flat path-delimited keys (e.g., `person.address.street`).
  - Introduced `output` configuration to `FormProvider` and `useForm` for global or per-form control of submission data shape.

  **Internal Changes**
  - Implemented `transformFormOutput` utility for flattening nested form objects into delimited path keys.
  - Updated `useForm` to automatically apply output transformation to `getValues()`, `watch()`, and `onSubmit` data.

  **Types**
  - Exported new `OutputConfig`, `OutputType`, and `PathDelimiter` types.

## 0.1.6

### Patch Changes

- 48a2a15: **Fixes**
  - Defaulted boolean schema values for `checkbox` and `switch` to `false` when values are missing, preventing submit-time `Invalid value` errors for untouched fields.
  - Kept required boolean behavior intact by still requiring `true` when `required: true` is set.

  **Types**
  - Expanded `ui.columns` typing for `checkbox-group` and `radio` to `number | string | undefined`, enabling the builder's `Auto` (`""`) option for natural horizontal flow layouts.

## 0.1.5

### Patch Changes

- a8121c0: **Fixes**
  - Hardened `createArrayHelpers` to normalize non-array values before array mutations.
  - Fixed runtime failure (`current is not iterable`) when an array path resolves to a non-array value.
  - Improved `fields()` mapping for non-object items while preserving stable row IDs.

## 0.1.4

### Patch Changes

- f3437be: **Features**
  - Added `checkbox-group` as a first-class field type with schema + type support.
  - Added `minSelected` and `maxSelected` for multi-select `select` (`hasMany`) and `checkbox-group`.

  **Fixes**
  - Improved multi-select validation edge cases for `required` and `minSelected` combinations.
  - Standardized optional `checkbox-group` handling via shared optional schema helpers.

## 0.1.3

### Patch Changes

- 346aaab: - Resolved React hooks order violation in `useForm` by ensuring validation logic occurs after all hooks are initialized.
  - Refactored GitHub release workflow to use `gh` CLI and added a reliable npm publication check to ensure releases are created accurately.

## 0.1.2

### Patch Changes

- a991440: **Features**
  - Renamed `InferSchema` to `InferType` (backwards compatible)
  - Improved type inference for nested structures

  **Chores**
  - Excluded dev branch from CI workflow
  - Simplified release condition

  **Documentation**
  - Updated docs to use `InferType`
  - Fixed table formatting

## 0.1.1

### Patch Changes

- de34c0b: Implement validation logic and related internal changes:
  - Use Zod to parse/transform values and collect errors.
  - Run per-field validators (field.validate) separately so custom validators run even when schema validation fails.
  - Attach fields to schemas (schema.fields) and add strict field typings.
  - Adjusted exports and updated docs/README.

## 0.1.0

### Minor Changes

- Initial public release of BuzzForm core package
