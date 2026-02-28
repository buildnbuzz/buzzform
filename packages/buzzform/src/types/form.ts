import type { ZodSchema } from "zod";
import type { Field } from "./field";
import type { AdapterFactory, Resolver } from "./adapter";

// =============================================================================
// SCHEMA WITH FIELDS
// =============================================================================

/**
 * A Zod schema with field definitions attached.
 * Created by `createSchema([...])` for type inference and field rendering.
 */
export type BuzzFormSchema<
  TData = unknown,
  TFields extends readonly Field[] = Field[],
> = ZodSchema<TData> & { fields: TFields };

// =============================================================================
// FORM SETTINGS
// =============================================================================

/**
 * Form-level behavior settings.
 * These control how the form behaves during user interaction.
 */
export interface FormSettings {
  /**
   * Prevent submission when form has no changes.
   * When true, handleSubmit is a no-op if formState.isDirty is false.
   * @default false
   */
  submitOnlyWhenDirty?: boolean;

  /**
   * Auto-focus first visible, enabled field on mount.
   * Note: This is a hint to the renderer component.
   * @default false
   */
  autoFocus?: boolean;
}

// =============================================================================
// OUTPUT CONFIGURATION
// =============================================================================

/**
 * Output type for form submission data.
 * - 'path': Flat keys with full path using a delimiter (e.g., "person.contactDetails.address.street")
 *
 * When no output config is set, the default behavior is preserved
 * (hierarchical JSON matching the field tree structure).
 */
export type OutputType = "path";

/**
 * Delimiter character used for path output.
 * @default '.'
 */
export type PathDelimiter = "." | "-" | "_";

/**
 * Configuration for form submission output shape.
 * When omitted, the default hierarchical JSON output is used.
 *
 * @example
 * // Path output with dot: { 'person.name': 'John', 'person.address.street': 'Main St' }
 * output: { type: 'path' }
 *
 * @example
 * // Path output with underscore: { 'person_name': 'John', 'person_address_street': 'Main St' }
 * output: { type: 'path', delimiter: '_' }
 */
export interface OutputConfig {
  /**
   * Output mode.
   * Set to 'path' to flatten nested data into delimited path keys.
   */
  type: OutputType;

  /**
   * Delimiter for path keys.
   * @default '.'
   */
  delimiter?: PathDelimiter;
}

// =============================================================================
// GLOBAL FORM CONFIG (Provider Level)
// =============================================================================

/**
 * Global form configuration set at the provider level.
 * These defaults apply to all forms unless overridden.
 *
 * @example
 * <FormProvider
 *   adapter={useRhfAdapter}
 *   resolver={zodResolver}
 *   mode="onBlur"
 * >
 *   <App />
 * </FormProvider>
 */
export interface FormConfig {
  /**
   * Adapter factory function.
   * Determines which form library handles state management.
   *
   * @example
   * import { useRhfAdapter } from '@buildnbuzz/buzzform/rhf';
   * adapter: useRhfAdapter
   */
  adapter: AdapterFactory;

  /**
   * Validation resolver factory.
   * Converts a Zod schema into a form-compatible resolver.
   * @default zodResolver
   *
   * @example
   * import { zodResolver } from '@buildnbuzz/buzzform/resolvers/zod';
   * resolver: zodResolver
   */
  resolver?: <T>(schema: ZodSchema<T>) => Resolver<T>;

  /**
   * Default validation mode for all forms.
   * - 'onChange': Validate on every change (default)
   * - 'onBlur': Validate when fields lose focus
   * - 'onSubmit': Validate only on submit
   * @default 'onChange'
   */
  mode?: "onChange" | "onBlur" | "onSubmit";

  /**
   * When to re-validate after initial validation error.
   * - 'onChange': Re-validate on every change (default)
   * - 'onBlur': Re-validate when fields lose focus
   * - 'onSubmit': Re-validate only on submit
   * @default 'onChange'
   */
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";

  /**
   * Default output configuration for all forms.
   * Controls the shape of data passed to onSubmit.
   * Can be overridden per-form via UseFormOptions.
   * @default undefined (hierarchical JSON)
   */
  output?: OutputConfig;
}

// =============================================================================
// USE FORM OPTIONS (Per-Form Level)
// =============================================================================

/**
 * Options passed to useForm hook.
 *
 * @example
 * const loginSchema = createSchema([
 *   { type: 'email', name: 'email', required: true },
 *   { type: 'password', name: 'password', required: true },
 * ]);
 *
 * const form = useForm({
 *   schema: loginSchema,
 *   onSubmit: async (data) => {
 *     await auth.login(data);
 *   },
 * });
 */
export interface UseFormOptions<TData = Record<string, unknown>> {
  // =========================================================================
  // PRIMARY CONFIGURATION
  // =========================================================================

  /**
   * Zod schema for validation.
   * - Use `createSchema([...])` for schema with fields attached (recommended)
   * - Use raw Zod schema for validation-only (manual field rendering)
   */
  schema: ZodSchema<TData> | BuzzFormSchema<TData>;

  /**
   * Default values for the form.
   * If not provided and schema has fields, extracted from field definitions.
   * Can be static, sync function, or async function.
   */
  defaultValues?: TData | (() => TData) | (() => Promise<TData>);

  /**
   * Form submission handler.
   * Called with validated data after all validation passes.
   */
  onSubmit?: (data: TData) => Promise<void> | void;

  // =========================================================================
  // PROVIDER OVERRIDES
  // =========================================================================

  /**
   * Override the adapter for this specific form.
   * Uses provider's adapter if not specified.
   */
  adapter?: AdapterFactory;

  /**
   * Override the validation mode for this form.
   * Uses provider's mode if not specified.
   */
  mode?: "onChange" | "onBlur" | "onSubmit";

  /**
   * Override the re-validation mode for this form.
   * Uses provider's reValidateMode if not specified.
   */
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";

  // =========================================================================
  // OUTPUT
  // =========================================================================

     /**
     * Output configuration for this form.
     * Overrides the provider-level output config.
     * Controls the shape of data passed to onSubmit.
     * @default undefined (defaults to hierarchical JSON if not specified here or in Provider)
     */
    output?: OutputConfig;
  // =========================================================================
  // BEHAVIOR
  // =========================================================================

  /**
   * Form behavior settings.
   */
  settings?: FormSettings;
}
