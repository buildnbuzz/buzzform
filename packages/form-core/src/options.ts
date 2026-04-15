import type {
  FieldOption,
  OptionResolverRegistry,
  OptionsConfig,
  FnRegistry,
} from "./types";
import { resolveExpr } from "./expr";

/** Preserve resolver map literal types. */
export function defineOptionResolvers<const T extends OptionResolverRegistry>(
  resolvers: T,
): T {
  return resolvers;
}

/**
 * A normalized, fully-resolved option ready for rendering.
 * All dynamic values have been resolved to their concrete types.
 */
export interface NormalizedOption {
  /** Option display label. */
  label: string;
  /** Option value as a string. */
  value: string;
  /** Whether the option is disabled. */
  disabled: boolean;
  /** UI-specific metadata (e.g. description, icon). */
  // TODO: make ui generic <TUi = Record<string, unknown>> to avoid cast at call sites
  ui?: Record<string, unknown>;
}

/**
 * Normalize a raw FieldOption or string into a plain object.
 * Does not resolve dynamic values — use `resolveOption` for that.
 *
 * @param option - A FieldOption object or a plain string shorthand.
 */
export function normalizeSelectOption(option: FieldOption | string): FieldOption {
  if (typeof option === "string") {
    return { value: option, label: option };
  }
  return option;
}

/**
 * Get the string value from a FieldOption or string shorthand.
 *
 * @param option - A FieldOption object or a plain string shorthand.
 */
export function getSelectOptionValue(option: FieldOption | string): string {
  if (typeof option === "string") return option;
  return String(option.value);
}

/**
 * Get the display label from a FieldOption or string shorthand.
 *
 * @param option - A FieldOption object or a plain string shorthand.
 */
export function getSelectOptionLabel(option: FieldOption | string): string {
  if (typeof option === "string") return option;
  if (typeof option.label === "string") return option.label;
  // DynamicString — caller should resolve before display; fall back to value
  return String(option.value);
}

/**
 * Resolve a single FieldOption or string into a NormalizedOption.
 * Resolves DynamicBoolean on `disabled` using form and context data.
 *
 * @param option - A FieldOption object or a plain string shorthand.
 * @param formData - Current form data for resolving dynamic values.
 * @param contextData - External context data for resolving dynamic values.
 */
export function resolveOption(
  option: FieldOption | string,
  formData: Record<string, unknown>,
  contextData?: Record<string, unknown>,
  fns?: FnRegistry,
): NormalizedOption {
  if (typeof option === "string") {
    return { label: option, value: option, disabled: false };
  }
  return {
    label: getSelectOptionLabel(option),
    value: getSelectOptionValue(option),
    disabled:
      option.disabled === undefined
        ? false
        : resolveExpr<boolean>(
            option.disabled,
            { data: formData, context: contextData },
            fns,
          ) ?? false,
    ui: option.ui,
  };
}

/**
 * Resolve all options in an OptionsConfig array into NormalizedOption array.
 * Note: Only processes static arrays. For dynamic resolutions, use `useFieldOptions`.
 *
 * @param options - Static options array.
 * @param formData - Current form data for resolving dynamic values.
 * @param contextData - External context data for resolving dynamic values.
 */
export function resolveOptions(
  options: OptionsConfig,
  formData: Record<string, unknown>,
  contextData?: Record<string, unknown>,
  fns?: FnRegistry,
): NormalizedOption[] {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.map((opt) => resolveOption(opt, formData, contextData, fns));
}
