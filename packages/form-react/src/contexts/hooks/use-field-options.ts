import type { OptionsConfig, NormalizedOption } from "@buildnbuzz/form-core";
import { resolveOptions } from "@buildnbuzz/form-core";
import { useFieldContext } from "../field-context";

/**
 * Result returned by `useFieldOptions`.
 */
export interface FieldOptionsState {
  /** Resolved, normalized options ready for rendering. */
  options: NormalizedOption[];
  /**
   * Whether options are currently loading.
   * Always false for static options — reserved for future async sources.
   * @internal
   */
  isLoading: false;
}

/**
 * Resolves static options for option-bearing fields (select, radio, checkbox group).
 *
 * Call this alongside `useDataField` in field components that render a list of options.
 * Do not compose this inside `useDataField` — most fields have no options.
 *
 * @remarks
 * Designed to absorb async/cascading option sources in the future without
 * changing call sites. When async sources land, `isLoading` will become `boolean`
 * and the hook will manage fetch state internally.
 *
 * @example
 * ```tsx
 * const field = useDataField<RadioFieldDef>();
 * const { options } = useFieldOptions(field.field.options);
 * ```
 */
export function useFieldOptions(rawOptions: OptionsConfig = []): FieldOptionsState {
  const { formData, contextData } = useFieldContext();

  return {
    options: resolveOptions(rawOptions, formData, contextData ?? {}),
    isLoading: false,
  };
}
