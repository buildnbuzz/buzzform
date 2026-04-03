# @buildnbuzz/form-core

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
