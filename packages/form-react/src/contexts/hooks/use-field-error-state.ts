import { useDataFieldContext } from "../field-context";

/** Normalized error entry for UI renderers. */
export interface FieldErrorItem {
  /** Human-readable error message. */
  message?: string;
}

/** Result payload returned by `useFieldErrorState`. */
export interface FieldErrorState {
  /** Normalized error list for rendering. */
  errors: FieldErrorItem[];
  /** Whether the field is currently invalid and errors should be shown. */
  isInvalid: boolean;
  /** Whether errors should be displayed based on interaction state. */
  shouldShowErrors: boolean;
}

/** Options for `useFieldErrorState`. */
export interface FieldErrorStateOptions {
  /** Overrides the default error visibility calculation. */
  shouldShowErrors?: boolean;
}

/**
 * Computes normalized errors and invalid state for data fields.
 */
export function useFieldErrorState(
  options: FieldErrorStateOptions = {},
): FieldErrorState {
  const { fieldApi } = useDataFieldContext();

  const meta = fieldApi.state.meta as {
    isTouched?: boolean;
    isDirty?: boolean;
    isValid?: boolean;
    errors?: unknown[];
  };
  const shouldShowErrors =
    options.shouldShowErrors ??
    Boolean(
      meta.isTouched ||
        meta.isDirty ||
        (fieldApi.form?.state?.submissionAttempts ?? 0) > 0,
    );
  const errors = normalizeFieldErrors(meta.errors);
  const isInvalid = shouldShowErrors && !meta.isValid && errors.length > 0;

  return {
    errors,
    isInvalid,
    shouldShowErrors,
  };
}

function normalizeFieldErrors(errors: unknown[] | undefined): FieldErrorItem[] {
  if (!errors?.length) return [];
  return errors
    .map((error) => {
      if (!error) return undefined;
      if (typeof error === "string") return { message: error };
      if (typeof error === "object") return error as FieldErrorItem;
      return undefined;
    })
    .filter(Boolean) as FieldErrorItem[];
}
