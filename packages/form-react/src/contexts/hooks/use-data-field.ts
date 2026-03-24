import type { DataField } from "@buildnbuzz/form-core";
import type { UnknownData } from "../../types";
import type { DataFieldContextValue } from "../field-context";
import { useDataFieldContext } from "../field-context";
import type { ResolvedFieldTextOptions } from "./use-resolved-field-text";
import { useResolvedFieldText } from "./use-resolved-field-text";
import type {
  FieldErrorState,
  FieldErrorStateOptions,
} from "./use-field-error-state";
import { useFieldErrorState } from "./use-field-error-state";
import { useFieldA11yIds } from "./use-field-a11y-ids";

/** Result payload returned by `useDataField`. */
export interface DataFieldState<
  TField extends DataField = DataField,
  TFormData extends UnknownData = UnknownData,
> extends DataFieldContextValue<TField, TFormData>,
    FieldErrorState {
  /** Resolved field label. */
  label: string;
  /** Resolved field placeholder. */
  placeholder: string;
  /** Resolved field description. */
  description: string;
  /** ID for the description element (if any). */
  descriptionId?: string;
  /** ID for the error element (if any). */
  errorId?: string;
  /** Combined value for `aria-describedby` (if any). */
  ariaDescribedBy?: string;
}

/** Options for `useDataField`. */
export interface DataFieldOptions
  extends ResolvedFieldTextOptions,
    FieldErrorStateOptions {}

/**
 * Aggregates common UI state for BuzzForm data fields.
 *
 * Composes resolved text, error state, and a11y ids into a single return value.
 * Throws if used outside a data field context.
 */
export function useDataField<
  TField extends DataField = DataField,
  TFormData extends UnknownData = UnknownData,
>(options: DataFieldOptions = {}): DataFieldState<TField, TFormData> {
  const ctx = useDataFieldContext<TField, TFormData>();
  const text = useResolvedFieldText<TField, TFormData>(options);
  const errorState = useFieldErrorState(options);
  const a11y = useFieldA11yIds({
    fieldId: ctx.fieldApi.name,
    description: text.description,
    isInvalid: errorState.isInvalid,
  });

  return {
    ...ctx,
    ...text,
    ...errorState,
    ...a11y,
  };
}

/**
 * @deprecated Use `useDataField` instead. Will be removed in v1.0.
 */
export const useFieldUiState = useDataField;

/**
 * @deprecated Use `DataFieldState` instead. Will be removed in v1.0.
 */
export type FieldUiState<
  TField extends DataField = DataField,
  TFormData extends UnknownData = UnknownData,
> = DataFieldState<TField, TFormData>;

/**
 * @deprecated Use `DataFieldOptions` instead. Will be removed in v1.0.
 */
export type FieldUiStateOptions = DataFieldOptions;
