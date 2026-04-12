---
"@buildnbuzz/form-react": patch
---

Implement cascading validation logic for derived checks.

- Updated derived validation to be cumulative: `"blur"` mode now includes `"submit"` checks, and `"change"` mode includes both `"blur"` and `"submit"` checks.
- Synchronized default `derivedValidationMode` to `"submit"` to match documentation and planned behavior.
