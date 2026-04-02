# Rendering Rules

## Shadcn Form Components

All imported from `@/components/buzzform/form`:

| Component | Description |
|---|---|
| `<Form>` | Context provider + form wrapper. Accepts `schema` or existing `form` instance |
| `<FormContent>` | Renders the `<form>` element. Supports `autoRender` prop |
| `<FormFields>` | Auto-renders all fields from schema |
| `<FormActions>` | Flex container for buttons with `align` prop (`"start"` \| `"center"` \| `"end"` \| `"between"`) |
| `<FormSubmit>` | Submit button — auto-disables during submission, shows `submittingText` |
| `<FormReset>` | Reset button — only enabled when form is dirty |
| `<FormMessage>` | Displays form-level errors |

### Zero Boilerplate Form

```tsx
<Form schema={schema} onSubmit={handleSubmit} />
// Renders fields + submit button automatically

// Customize auto-rendered actions:
<Form schema={schema} actions={{ submitLabel: "Save", showReset: true, align: "end" }} onSubmit={handleSubmit} />
```

### Composed Form (Recommended)

```tsx
<Form schema={schema} onSubmit={handleSubmit}>
  <FormContent>
    <FormFields />
    <FormMessage />
    <FormActions>
      <FormReset />
      <FormSubmit>Save</FormSubmit>
    </FormActions>
  </FormContent>
</Form>
```

### External Form Instance (`useForm`)

```tsx
import { useForm } from "@buildnbuzz/form-react";

const form = useForm({ schema, onSubmit: handleSubmit });

<Form form={form} schema={schema}>
  <FormContent><FormFields /><FormSubmit>Submit</FormSubmit></FormContent>
</Form>
```

Use for: controlled dialogs, multi-step wizards, external reset logic.

## Registry

The registry maps field types to React components:

```ts
import { registry } from "@/components/buzzform/registry";
// Contains: text, email, password, textarea, number, select, checkbox,
// switch, radio, group, array, date, tags, row, tabs, collapsible
```

The registry must include entries for all field types used in schemas.

## Custom Field Renderers

### Data Fields: `useDataField<T>()`

For fields that hold data (`text`, `email`, `select`, `group`, `array`, etc.):

```tsx
import { useDataField } from "@buildnbuzz/form-react";
import type { TextField as TextFieldDef } from "@buildnbuzz/form-core";

export function CustomTextField() {
  const {
    fieldApi,      // TanStack field API (state, name, getValue, etc.)
    field,         // Schema field definition
    isDisabled, isReadOnly, isRequired,
    label, placeholder, description,
    errors, isInvalid,
    descriptionId, errorId, ariaDescribedBy,
    handleChange,  // Use instead of fieldApi.handleChange (absorbs transforms)
    handleBlur,    // Use instead of fieldApi.handleBlur (applies trim if set)
  } = useDataField<TextFieldDef>();

  const value = (fieldApi.state.value as string) ?? "";
  const ui = field.ui as MyTextUi | undefined;

  return <input value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} />;
}
```

**Why `handleChange`/`handleBlur`?** The hook wraps TanStack's raw handlers to apply BuzzForm-specific transforms: `handleBlur` applies `trim` logic for text/textarea fields (stripping whitespace on blur), and `handleChange` is the extension point for future transforms like input masking or formatting. Using `fieldApi.handleChange` directly bypasses these, which can cause subtle bugs like untrimmed whitespace passing validation.

### Layout Fields: `useLayoutField<T>()`

For layout containers (`row`, `tabs`, `collapsible`):

```tsx
import { useLayoutField, RenderFields } from "@buildnbuzz/form-react";
import type { RowField as RowFieldDef } from "@buildnbuzz/form-core";

export function CustomRowField({ children }: { children: React.ReactNode }) {
  const { field } = useLayoutField<RowFieldDef>();
  const ui = field.ui as RowUi | undefined;
  return <div className="flex gap-4">{children}</div>;
}
```

### Additional Hooks

| Hook | Use Case |
|---|---|
| `useFieldOptions(options)` | Normalizes `["a", "b"]` → `[{ label: "a", value: "a" }, ...]` for select/radio/checkbox groups |
| `useNestedErrorCount(fields, basePath)` | Count errors in nested fields (for tabs/collapsible error badges) |
| `useFieldA11yIds(opts)` | Generate accessible `id`, `descriptionId`, `errorId` |
| `useResolvedFieldText(opts)` | Resolve dynamic `label`/`placeholder`/`description` from `$data`/`$context` |

## `ui` Property Is Opaque

`ui` is `UnknownData` in form-core. Cast to your own type in each renderer:

```ts
// Schema
{ type: "text", name: "field", ui: { variant: "ghost", copyable: true } }

// Renderer
interface TextUi { variant?: "default" | "ghost"; copyable?: boolean; }
const ui = field.ui as TextUi | undefined;
```

## Key Rules

- For text-like inputs, pass `fieldApi.state.value ?? ""` to avoid React's uncontrolled-to-controlled warning. TanStack Form may initialize values as `undefined`, but React inputs need a string.
- `RenderFields` expects `basePath` in **dot notation** (e.g., `"profile"`), not JSON Pointer. Internally it converts to JSON Pointer via `fromDotNotation()`. This matches TanStack Form's field naming convention, which uses dot notation for nested paths.
- Tabs and arrays handle their own nested rendering internally. Don't pass their children through `RenderFields` yourself — the framework calls `RenderFields` for each tab content and array row, which prevents fields from being registered twice.
