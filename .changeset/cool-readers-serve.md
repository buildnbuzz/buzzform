---
"@buildnbuzz/buzzform": patch
---

- Resolved React hooks order violation in `useForm` by ensuring validation logic occurs after all hooks are initialized.
- Refactored GitHub release workflow to use `gh` CLI and added a reliable npm publication check to ensure releases are created accurately.
