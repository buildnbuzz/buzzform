# Dynamic Behavior Rules

- Use absolute JSON Pointer paths in `$data`/`$context` (e.g., `"/profile/email"`).
- `condition` unmounts fields; `hidden` keeps them in data/validation.
- Always pass `contextData` when using `$context`.
- Dynamic values are allowed in field props and validator `args`, not in `message`.
- Combine conditions with `$and`, `$or`, or an array (implicit AND).

**Example: conditional field**
```ts
{
  type: "text",
  name: "company",
  condition: { $data: "/employmentStatus", eq: "employed" },
}
```
