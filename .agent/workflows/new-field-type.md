---
description: How to implement a new BuzzForm field type
---

# New Field Type Implementation Workflow

Follow these steps when implementing a new field type for BuzzForm:

## 1. Analyze Field Interface

Check the field type interface in the core package:

```
packages/buzzform/src/types/field.ts
```

Look for:

- The specific field interface (e.g., `PasswordField`, `SelectField`)
- Properties that extend `BaseField` (label, description, disabled, readOnly, etc.)
- Field-specific properties (e.g., `criteria` for password, `options` for select)
- UI options in the `ui` property

## 2. Check UI Component Availability

Verify the shadcn UI component exists:

```
apps/web/components/ui/
```

If missing, add it via `pnpm shadcn add <component>`.

## 3. Create Field Component

Create the field component at:

```
apps/web/registry/base/fields/<field-type>.tsx
```

Ensure the component:

- Exports `<FieldType>Field` (e.g., `PasswordField`)
- Exports `<FieldType>FieldSkeleton` (e.g., `PasswordFieldSkeleton`)
- Implements ALL properties from the field interface
- Handles `BaseField` properties:
  - `label`, `description`, `placeholder`
  - `required`, `disabled`, `readOnly`
  - `style.className`, `style.width`
  - `autoComplete`
  - Error display
  - `autoFocus`
- Supports conditional disabled/readOnly (function or boolean)
- **Icons:** Use `IconPlaceholder` from `@/components/icon-placeholder` for any icons.
  - Do NOT import from `lucide-react` or other icon libraries directly.
  - Provide mappings for all supported libraries (Lucide, Hugeicons, Tabler, Phosphor).
- **Clean Code:** Keep components free from unnecessary comments (matches shadcn style).

## 4. Register in Field Registry

Update `apps/web/registry/base/fields/render.tsx`:

1. Import the new field and skeleton components
2. Add entry to `defaultFieldRegistry`

```tsx
import {
  PasswordField,
  PasswordFieldSkeleton,
} from "@/components/buzzform/fields/password";

// In defaultFieldRegistry:
password: {
  kind: "data",
  renderer: PasswordField as ComponentType<FieldRendererComponentProps>,
  skeleton: PasswordFieldSkeleton as ComponentType<{ field: Field }>,
},
```

## 5. Add to Registry JSON

Update `apps/web/registry.json`:

```json
{
  "name": "password",
  "type": "registry:ui",
  "title": "PasswordField",
  "description": "...",
  "dependencies": ["@buildnbuzz/buzzform"],
  "registryDependencies": [
    "@buzzform/init",
    "input",
    "field"
    // ... other dependencies
  ],
  "files": [
    {
      "path": "registry/base/fields/password.tsx",
      "type": "registry:component",
      "target": "components/buzzform/fields/password.tsx"
    }
  ]
}
```

## 6. Build Icons and Registry

If you added new icons using `IconPlaceholder`, run:

// turbo

```powershell
pnpm icons:build
```

Then build the registry:

// turbo

```powershell
pnpm registry:build
```

## 7. Verify

// turbo

```powershell
pnpm tsc --noEmit -p apps/web/tsconfig.json
```

Check that:

- No TypeScript errors related to the new field
- Registry builds successfully
- Examples render correctly
