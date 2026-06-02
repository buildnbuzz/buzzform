---
"@buildnbuzz/form-core": patch
---

Add support for the new UI field layout type and unregistered custom field types.

- Add `UiField` layout field type for rendering inline dynamic HTML or React markup.
- Allow defining custom, unregistered field types inside `defineSchema` with automatic typings.
- Downgrade the unrecognized field type check from an error to a warning in the schema validator.
- Add `defineField` and `defineFields` helper functions for programmatic field generation.
