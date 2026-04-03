---
"@buildnbuzz/form-core": patch
"@buildnbuzz/form-react": patch
---

### @buildnbuzz/form-core

- Changed default `derivedRun` to `submit` in validation logic to postpone automatic checks (like `required`) until form submission.

### @buildnbuzz/form-react

- Added global `derivedValidationMode` support to `FormProvider` and renamed `RegistryContext` to `FormConfigContext`.
- Updated `useForm` and `RenderFields` to automatically respect global validation configuration.
- Refined internal `buildValidator` to skip checks for pristine (unmodified) fields unless the form is currently submitting, preventing premature validation errors.
