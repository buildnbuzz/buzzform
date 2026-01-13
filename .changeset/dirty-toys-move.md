---
"@buildnbuzz/buzzform": patch
---

Implement validation logic and related internal changes:
- Use Zod to parse/transform values and collect errors.
- Run per-field validators (field.validate) separately so custom validators run even when schema validation fails.
- Attach fields to schemas (schema.fields) and add strict field typings.
- Adjusted exports and updated docs/README.
