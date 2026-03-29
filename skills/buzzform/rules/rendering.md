# Rendering Rules

- Registry must include all field types used in schemas.
- Layout fields (`row`, `tabs`, `collapsible`) use `useLayoutField`, not `useDataField`.
- `ui` is opaque; cast in renderer to a local UI type.
- Tabs/arrays render nested fields internally; avoid double-rendering.
- Use `handleChange`/`handleBlur` from `useDataField`.
- For text-like inputs, pass `fieldApi.state.value ?? ""` to avoid uncontrolled/controlled warnings.
- `RenderFields` expects `basePath` in dot notation (e.g., `"profile"`).

**Example: registry completeness**
```ts
const registry = { text: TextField, email: EmailField, select: SelectField };
```
