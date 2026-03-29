# Validation Rules

- Derived checks (required, min/max, pattern, etc.) run on `derivedValidationMode` (default: `"blur"`).
- Unknown validator types are skipped with a warning; register customs via `defineValidators`.
- Validator `message` is static text; dynamic values only work in `args`.
- Use `debounceMs` for async checks to avoid excessive calls.

**Custom validator registration**
```ts
import { defineValidators } from "@buildnbuzz/form-core";

const customValidators = defineValidators({
  minChars: (value: unknown, args?: { min?: number }) => {
    if (typeof value !== "string") return false;
    return value.length >= (args?.min ?? 0);
  },
});
```

**Validation triggers**
- `onChange`
- `onBlur`
- `onSubmit`
