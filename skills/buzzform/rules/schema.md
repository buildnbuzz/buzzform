# Schema Rules

- Use `defineSchema` from `@buildnbuzz/form-core` (not `createSchema`).
- Tabs/row/collapsible are layout-only; use `group` for nested data.
- `InferType` treats conditionally required fields as optional in TS.
- `pattern` expects a string pattern, not a `RegExp` object.
- Multi-select (`hasMany: true`) infers `string[]`.
- `extractDefaults` does not create array items; set form-level `defaultValues` for arrays (two-level defaults).

**Example: nested data via group**
```ts
const schema = defineSchema({
  fields: [
    {
      type: "group",
      name: "address",
      fields: [{ type: "text", name: "city" }],
    },
  ],
});
```
