// Context providers and core hooks
export {
  FieldContext,
  useFieldContext,
  useDataFieldContext,
  useFieldApi,
} from "./field-context";
export type {
  FieldContextValue,
  DataFieldContextValue,
} from "./field-context";

export { useFormContext } from "./form-context";

export {
  RegistryContext,
  useRegistry,
  FormProvider,
} from "./registry-context";
export type {
  FieldRegistry,
  FormProviderProps,
} from "./registry-context";

// Composable UI hooks
export { useResolvedFieldText } from "./hooks/use-resolved-field-text";
export type { ResolvedFieldTextOptions } from "./hooks/use-resolved-field-text";

export { useFieldErrorState } from "./hooks/use-field-error-state";
export type {
  FieldErrorItem,
  FieldErrorState,
  FieldErrorStateOptions,
} from "./hooks/use-field-error-state";

export { useFieldA11yIds } from "./hooks/use-field-a11y-ids";
export type {
  FieldA11yIds,
  FieldA11yIdsOptions,
} from "./hooks/use-field-a11y-ids";

export { useFieldOptions } from "./hooks/use-field-options";
export type { FieldOptionsState } from "./hooks/use-field-options";

// Primary field hooks
export { useDataField } from "./hooks/use-data-field";
export type {
  DataFieldState,
  DataFieldOptions,
} from "./hooks/use-data-field";

export { useLayoutField } from "./hooks/use-layout-field";
export type {
  LayoutFieldState,
  LayoutFieldOptions,
} from "./hooks/use-layout-field";
