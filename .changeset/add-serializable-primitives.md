---
"@buildnbuzz/form-core": patch
---

feat(form-core): add serializable schema primitives, validator, and metadata

- Add `SerializableFormSchema` types for headless serialization
- Implement `validateSchema` with structure and identity checks
- Implement `autoFixSchema` for common schema errors
- Add `FIELD_TYPE_META` for field capability discovery
- Export serialization utilities: `isSerializable`, `toSerializable`, `serializeSchema`
