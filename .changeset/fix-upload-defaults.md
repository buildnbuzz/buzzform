---
"@buildnbuzz/form-core": patch
---

Fix default value extraction for upload fields.

- Correct `extractDefaults` to return `[]` when `hasMany: true` is configured.
- Correct `extractDefaults` to return `null` for single file uploads instead of an empty string `""`.
