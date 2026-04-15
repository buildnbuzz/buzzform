import type { FormRegistries } from "@buildnbuzz/form-core";
import type { FieldRegistry } from "../contexts/registry-context";

/**
 * Deep-merge two `FormRegistries` objects.
 *
 * Each sub-registry (`fields`, `validators`, `resolvers`, `fns`) is merged
 * independently so that keys from `override` win over `base`, while keys
 * present only in `base` are preserved.
 *
 * @param base - The lower-priority registries (e.g. from `FormProvider`).
 * @param override - The higher-priority registries (e.g. from `<Form>`).
 * @returns A new merged `FormRegistries` object, or `undefined` if both inputs are falsy.
 */
export function mergeRegistries(
  base: FormRegistries | undefined,
  override: FormRegistries | undefined,
): FormRegistries | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;

  return {
    fields: mergeRecord(
      base.fields as FieldRegistry | undefined,
      override.fields as FieldRegistry | undefined,
    ) as FormRegistries["fields"],
    validators: mergeRecord(base.validators, override.validators),
    resolvers: mergeRecord(base.resolvers, override.resolvers),
    fns: mergeRecord(base.fns, override.fns),
  };
}

function mergeRecord<T extends Record<string, unknown>>(
  base: T | undefined,
  override: T | undefined,
): T | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  return { ...base, ...override };
}
