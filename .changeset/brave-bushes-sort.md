---
"@buildnbuzz/buzzform": patch
---

**Features**
- Added **Output Configuration** support to transform form data into flat path-delimited keys (e.g., `person.address.street`).
- Introduced `output` configuration to `FormProvider` and `useForm` for global or per-form control of submission data shape.

**Internal Changes**
- Implemented `transformFormOutput` utility for flattening nested form objects into delimited path keys.
- Updated `useForm` to automatically apply output transformation to `getValues()`, `watch()`, and `onSubmit` data.

**Types**
- Exported new `OutputConfig`, `OutputType`, and `PathDelimiter` types.
