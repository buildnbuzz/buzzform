/** Options for `useFieldA11yIds`. */
export interface FieldA11yIdsOptions {
  /** Field id used as the base for generated ids. */
  fieldId: string;
  /** Optional field description content. */
  description?: string | null;
  /** Whether to include an error id in the described-by chain. */
  isInvalid?: boolean;
}

/** Result payload returned by `useFieldA11yIds`. */
export interface FieldA11yIds {
  /** ID for the description element (if any). */
  descriptionId?: string;
  /** ID for the error element (if any). */
  errorId?: string;
  /** Combined value for `aria-describedby` (if any). */
  ariaDescribedBy?: string;
}

/**
 * Builds stable description/error ids and `aria-describedby` values.
 */
export function useFieldA11yIds({
  fieldId,
  description,
  isInvalid,
}: FieldA11yIdsOptions): FieldA11yIds {
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = isInvalid ? `${fieldId}-error` : undefined;
  const ariaDescribedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return {
    descriptionId,
    errorId,
    ariaDescribedBy,
  };
}
