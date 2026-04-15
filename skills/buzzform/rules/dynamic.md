# Dynamic Behavior Rules

## Path Format: JSON Pointer (RFC 6901)

All `$data` and `$context` paths use JSON Pointer format. BuzzForm chose JSON Pointer over dot notation because it handles edge cases like keys containing dots or slashes (common in form field names) without ambiguity:
- Start with `/`: `/employmentStatus`, `/address/city`
- Array indices are numeric: `/items/0/name`
- **No dot notation** — use `/user/name` not `user.name`

`$data` also supports **relative paths** inside groups/arrays — they're automatically resolved to absolute paths by the React adapter.

## `$data` vs `$context`

| | `$data` | `$context` |
|---|---|---|
| **Source** | Form data (what the user entered) | External context data (passed via `contextData` prop) |
| **Mental model** | "What did they pick?" | "Who is filling this out?" |
| **Example** | Show company field when `department === "sales"` | Show salary field only for admin users |
| **Reactivity** | Reacts to form changes | Static for the form's lifetime |

## Conditional Visibility

The distinction between `condition` and `hidden` is important for data integrity:

```ts
// condition → unmounts field (removed from data + validation)
// Use when the field is irrelevant — its value shouldn't be in the submitted data.
// Example: company name shouldn't exist in data when the user is unemployed.
{ type: "text", name: "company",
  condition: { $data: "/employmentStatus", eq: "employed" } }

// hidden → keeps field in data + validation but hides UI
// Use when you need the value to persist even when not visible.
// Example: an internal ID that the user shouldn't see but the API needs.
{ type: "text", name: "internalId",
  hidden: { $context: "/userRole", neq: "admin" } }
```

## Dynamic `required`, `disabled`, `readOnly`

These accept `Condition` — same syntax as `condition`/`hidden`.

## Advanced Logic ($text, $when, $fn)

Unified expressions (`Expr<T>`) support complex logic directly in the schema:

```ts
// $text: String interpolation
{ type: "text", name: "field", label: { $text: "Total: $${/price}" } }

// $when: Conditional branching (Ternary)
{ type: "text", name: "field", 
  label: { $when: { $data: "/isNew" }, $then: "Welcome!", $else: "Welcome back!" } }

// $fn: Call custom logic from fns registry
{ type: "number", name: "total",
  defaultValue: { $fn: "calculateTax", args: { subtotal: { $data: "/subtotal" } } } }
```

## Inline Function Escape Hatch

When schemas aren't JSON-serialized, use standard JS functions. These receive `ExprContext` (`data`, `context`):

```ts
{ type: "text", name: "field",
  condition: ({ data, context }) => data.role === "admin" && context.isInternal }
```

## Comparison Operators

| Operator | Description |
|---|---|
| `eq` | Equals |
| `neq` | Not equals |
| `gt`, `gte`, `lt`, `lte` | Numeric comparisons |
| `contains` | String contains |
| `startsWith` | String starts with |
| `endsWith` | String ends with |
| `not: true` | Negate the condition |

## Combining Conditions

```ts
// Explicit AND
condition: { $and: [
  { $data: "/status", eq: "active" },
  { $data: "/age", gte: 18 },
]}

// Explicit OR
condition: { $or: [
  { $data: "/workLocation", eq: "office" },
  { $data: "/workLocation", eq: "hybrid" },
]}

// Implicit AND (array of conditions)
condition: [
  { $data: "/status", eq: "active" },
  { $data: "/role", neq: "guest" },
]
```

## Using Context Data

```tsx
<Form
  schema={schema}
  contextData={{
    userRole: "admin",
    companyDomains: ["acme.com", "acme.io"],
  }}
  onSubmit={handleSubmit}
/>
```

## Dynamic Values in Field Props

`$data` and `$context` work in field props beyond conditions:

```ts
// Dynamic label
{ type: "text", name: "field", label: { $data: "/customLabel" } }

// Dynamic placeholder from context
{ type: "text", name: "email", placeholder: { $context: "/emailHint" } }

// Dynamic validator args
{ validate: { onBlur: { checks: [{
  type: "companyEmail",
  args: { allowedDomains: { $context: "/companyDomains" } },
  message: "Use a company email.",
}]}}}
```

**Not supported in:** `message` strings (messages are static text only). This is because messages go directly to the UI as-is — they don't go through the dynamic value resolver. If you need a dynamic error message, construct it inside a custom validator that has access to the resolved args.
