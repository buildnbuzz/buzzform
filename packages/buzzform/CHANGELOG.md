# @buildnbuzz/buzzform

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
