import type { Field as CoreField } from "@buildnbuzz/form-core";
import type { FieldFormApi, UnknownData } from "../types";
import { useFieldContext } from "./field-context";

/** Convenience alias for `useFieldContext().form`. */
export function useFormContext<
  TFormData extends UnknownData = UnknownData,
>(): FieldFormApi<TFormData> {
  return useFieldContext<CoreField, TFormData>().form;
}
