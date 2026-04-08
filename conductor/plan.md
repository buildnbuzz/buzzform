# Implementation Plan: React Schema Overrides via Module Augmentation

## Background & Motivation
The goal is to allow UI-specific values (like `ReactNode`) in schema fields (e.g., `label`, `description`) when using `@buildnbuzz/form-react` for rich DX and i18n support (`<Trans>Name</Trans>`), while keeping `@buildnbuzz/form-core` entirely framework-agnostic.

Starting from a **clean slate** (all previous attempts have been discarded), we need a robust solution that doesn't duplicate the type hierarchy or break strict TypeScript inferences (like `InferType` and core utility type constraints).

## Scope & Impact
*   **`@buildnbuzz/form-core`**: Widen the base text types (`DynamicText`) to accept global interface augmentations for `label` and `description`. `placeholder` will remain `DynamicString`. No runtime logic changes.
*   **`@buildnbuzz/form-react`**: Augment the core interface with `ReactNode`.
*   **`@buildnbuzz/form-react` utilities**: Update utilities (like `useResolvedFieldText`) to safely handle and render the augmented text types (e.g., returning `ReactNode` directly if valid).
*   **Web App/Registry**: Ensure components using `label` and `description` expect `React.ReactNode`.

## Proposed Solution: Global Module Augmentation
We will introduce an empty `FrameworkOverrides` interface in `form-core` that allows consumers (like `form-react`) to inject framework-specific types (e.g., `ReactNode`) into the core types globally.

This is a well-established pattern in the TypeScript ecosystem (e.g., `@tanstack/react-table` meta types, `@tanstack/react-router` route types) that completely eliminates type duplication and generic prop drilling.

### Mechanics
1.  **Core Def:** `interface FrameworkOverrides {}`
2.  **Core Type:** `type FrameworkText = keyof FrameworkOverrides extends never ? never : FrameworkOverrides[keyof FrameworkOverrides];`
3.  **Core Usage:** `type DynamicText = DynamicValue<string | FrameworkText>;` (Replaces `DynamicString` for `label` and `description`).
4.  **React Augmentation:**
    ```typescript
    declare module "@buildnbuzz/form-core" {
      interface FrameworkOverrides { react: ReactNode; }
    }
    ```

## Alternatives Considered
*   **Generic Viral Passing (`BaseField<TLabel>`)**: Rejected due to enormous complexity. Every core utility (`walkFields`, `InferType`) would require generic drilling.
*   **Parallel Type Trees (`DeepReplaceAtKeys`)**: Explored and rejected. Caused array assignability errors (`readonly ReactField[]` not assignable to `readonly Field[]`) and broke the strict `InferType` evaluation map, leading to "Type Rifts".

## Implementation Steps & Workflow

*Note: All work will be done on a dedicated GitButler virtual branch. Each phase acts as a checkpoint.*

### Preparation
1.  **GitButler:** Use `$but branch new <branch-name>` to create a new branch (e.g., `feat/react-schema-module-augmentation`).

### Phase 1: Establish Module Augmentation in `form-core`
1.  In `packages/form-core/src/types.ts`, define the `FrameworkOverrides` interface and the union `FrameworkText`.
2.  Define `DynamicText` as `DynamicValue<string | FrameworkText>`.
3.  Update `BaseField`, `FieldOption`, and `Tab` to use `DynamicText` instead of `DynamicString` for properties like `label` and `description`. **(Note: `placeholder` remains `DynamicString`)**.
4.  Update `packages/form-core/src/utils/dependencies.ts` (if needed) to ensure it handles `FrameworkText` gracefully (ignoring non-object/non-string values when extracting `$data` dependencies).
5.  *Architectural Cleanup:* Update the core schema types (`GroupField.fields`, `FormSchema.fields`, etc.) to use `readonly Field[]` to enforce schema immutability.
6.  **Phase 1 Checkpoint:**
    *   Run `pnpm --filter @buildnbuzz/form-core run check-types`
    *   Run `pnpm --filter @buildnbuzz/form-core test`
    *   Run `pnpm --filter @buildnbuzz/form-core build`
    *   Commit changes: `but commit <branch> -c -m "feat(form-core): implement module augmentation for UI text overrides" --changes <ids> --json --status-after`

### Phase 2: Implement Augmentation in `form-react`
1.  In `packages/form-react/src/types.ts` (or `index.ts`), add the `declare module "@buildnbuzz/form-core"` block to augment `FrameworkOverrides` with `react: ReactNode`.
2.  Update React utilities (`useResolvedFieldText`, `useLayoutField` in `packages/form-react/src/contexts/hooks/`) to handle resolving `DynamicText`. The resolver should check if the value is a valid React element (using `isValidElement`) and return it directly, bypassing standard string processing.
3.  **Phase 2 Checkpoint:**
    *   Run `pnpm --filter @buildnbuzz/form-react run check-types`
    *   Run `pnpm --filter @buildnbuzz/form-react test`
    *   Run `pnpm --filter @buildnbuzz/form-react build`
    *   Commit changes: `but commit <branch> -c -m "feat(form-react): augment form-core with ReactNode and update resolvers" --changes <ids> --json --status-after`

### Phase 3: Update Registry Components & Web App
1.  Update the Shadcn registry templates (e.g., `apps/web/registry/shadcn/fields/collapsible.tsx`, `password.tsx`, etc.) to ensure that destructured props like `label` and `description` are typed as `React.ReactNode` where appropriate.
2.  Fix any `aria-label` or string-only template literals that might break if `label` is passed as an object (e.g., fallback to a static string if `typeof label !== "string"`).
3.  **Phase 3 Checkpoint:**
    *   Run `pnpm --filter web build`
    *   Commit changes: `but commit <branch> -c -m "refactor(registry): support ReactNode labels in UI components" --changes <ids> --json --status-after`

## Verification
*   All tests, type checks, and builds across the workspace must pass successfully before concluding the track.