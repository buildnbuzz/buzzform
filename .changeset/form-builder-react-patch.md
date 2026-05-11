---
"@buildnbuzz/form-builder-react": patch
---

Add local storage persistence for the form builder React adapter.

- Persist form builder documents in local storage with a namespaced index.
- Load, list, and remove saved documents consistently from the browser storage provider.
- Normalize storage keys and keep index entries aligned with the saved documents.
