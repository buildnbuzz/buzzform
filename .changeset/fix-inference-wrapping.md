---
"@buildnbuzz/form-core": patch
---

Correct primitive array type inference for named child fields.

- Ensure that child fields with explicitly defined names are correctly inferred as wrapped objects (`{ name: value }[]`) rather than flat values.
