import type { ReactNode } from "react";
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
  label: ReactNode;
  /** Resolved field placeholder. */
  placeholder: string;
  /** Resolved field description. */
  description: ReactNode;
  /** ID for the description element (if any). */
  descriptionId?: string;
  /** ID for the error element (if any). */
  errorId?: string;
  /** Combined value for `aria-describedby` (if any). */
  ariaDescribedBy?: string;
  /**
   * Preferred change handler. Use instead of `fieldApi.handleChange`.
   * Future transforms and debouncing will be absorbed here.
   */
  handleChange: (value: unknown) => void;
  /**
   * Preferred blur handler. Applies `field.trim` if set, then calls `fieldApi.handleBlur`.
   * Use instead of `fieldApi.handleBlur`.
   */
  handleBlur: () => void;
}

/** Options for `useDataField`. */
export interface DataFieldOptions
  extends ResolvedFieldTextOptions,
  FieldErrorStateOptions { }

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
    description: typeof text.description === "string" ? text.description : undefined,
    isInvalid: errorState.isInvalid,
  });

  return {
    ...ctx,
    ...text,
    ...errorState,
    ...a11y,
    handleChange: (value: unknown) => ctx.fieldApi.handleChange(value),
    handleBlur: () => {
      if (
        "trim" in ctx.field &&
        ctx.field.trim === true &&
        (ctx.field.type === "text" || ctx.field.type === "textarea") &&
        typeof ctx.fieldApi.state.value === "string"
      ) {
        const trimmed = ctx.fieldApi.state.value.trim();
        if (trimmed !== ctx.fieldApi.state.value) {
          ctx.fieldApi.handleChange(trimmed);
        }
      }
      ctx.fieldApi.handleBlur();
    },
  };
}

