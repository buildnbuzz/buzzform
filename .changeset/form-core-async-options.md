---
"@buildnbuzz/form-core": patch
---

Introduce async option resolvers and enhanced dependency tracking.

- Add `OptionResolverRegistry` and `OptionResolver` types for async data fetching.
- Implement `defineOptionResolvers` helper for type-safe resolver registration.
- Update `resolveOptions` to support dynamic option sources.
