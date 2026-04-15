import { useEffect, useMemo, isValidElement } from "react";
import type { AnyFieldApi } from "@tanstack/form-core";
import {
  type DataField,
  type Field as CoreField,
  type FormRegistries,
  collectFieldValidationChecks,
  resolveExpr,
  escapePointer,
  extractDependencies,
  fromDotNotation,
  getValidationGroup,
  runChecks,
  splitPointer,
  toDotNotation,
  type ValidationCheck,
  type OptionResolverRegistry,
  type ValidationRegistry,
} from "@buildnbuzz/form-core";
import type {
  AnyFieldValidators,
  FieldFormApi,
  FieldProps,
  UnknownData,
} from "./types";
import { FieldContext, useFormConfig } from "./contexts";
import { useDependenciesSelector } from "./contexts/hooks/use-dependencies-selector";

function mergeListenTo(
  generated?: string[],
  provided?: string[],
): string[] | undefined {
  if (!generated) return provided;
  if (!provided) return generated;
  return Array.from(new Set([...generated, ...provided]));
}

const buildValidator = <TFormData extends UnknownData>(
  checks: ValidationCheck[],
  form: FieldFormApi<TFormData>,
  contextData?: UnknownData,
  customValidators?: ValidationRegistry,
) => {
  return async (input: unknown) => {
    const isObjectInput = typeof input === "object" && input !== null;
    const value =
      isObjectInput && "value" in input
        ? (input as { value: unknown }).value
        : input;
    const fieldApi =
      isObjectInput && "fieldApi" in input
        ? (input as { fieldApi: AnyFieldApi }).fieldApi
        : undefined;

    // If we have fieldApi, we can check if the field has been modified.
    // We skip validation for pristine fields to avoid "red flashes" on blur/close.
    // However, we MUST NOT skip it during submission, otherwise 'required' checks won't run.
    if (
      fieldApi &&
      fieldApi.state.meta.isPristine &&
      !form.store.state.isSubmitting
    ) {
      return undefined;
    }

    return runChecks(
      checks,
      value,
      {
        formData: form.store.state.values as UnknownData,
        contextData,
      },
      customValidators,
    );
  };
};

/**
 * Headless field wrapper that maps `form-core` field checks into TanStack field validators.
 */
export function Field<TFormData extends UnknownData = UnknownData>({
  field,
  form,
  contextData,
  registries,
  customValidators,
  optionResolvers,
  validators,
  derivedValidationMode,
  children,
}: FieldProps<TFormData>) {
  const { registries: globalRegistries, derivedValidationMode: globalMode } = useFormConfig();

  const mergedRegistries = useMemo(() => {
    return {
      validators: { ...globalRegistries?.validators, ...registries?.validators, ...customValidators },
      resolvers: { ...globalRegistries?.resolvers, ...registries?.resolvers, ...optionResolvers },
      fns: { ...globalRegistries?.fns, ...registries?.fns },
    };
  }, [globalRegistries, registries, customValidators, optionResolvers]);
  const pointer = useMemo(() => {
    if (field.name.startsWith("/")) return field.name;
    if (field.name.includes(".")) return fromDotNotation(field.name);
    return `/${escapePointer(field.name)}`;
  }, [field.name]);
  const basePointer = useMemo(() => getParentPointer(pointer), [pointer]);
  const resolvedField = useMemo(
    () => resolveRelativeDataPaths(field, basePointer),
    [field, basePointer],
  );
  const deps = useMemo(
    () => Array.from(extractDependencies(resolvedField)),
    [resolvedField],
  );
  const fieldName = useMemo(() => toDotNotation(pointer), [pointer]);

  const validationListenTo = useMemo(() => {
    if (deps.length === 0) return undefined;

    const listenTo = new Set<string>();
    for (const dep of deps) {
      const dotPath = toDotNotation(dep);
      if (!dotPath || dotPath === fieldName) continue;
      listenTo.add(dotPath);
    }

    return listenTo.size > 0 ? Array.from(listenTo) : undefined;
  }, [deps, fieldName]);

  const generatedValidators = useMemo(() => {
    const derivedRun = derivedValidationMode ?? "submit";
    const changeGroup = getValidationGroup(resolvedField.validate, "change");
    const blurGroup = getValidationGroup(resolvedField.validate, "blur");
    const changeChecks = collectFieldValidationChecks(resolvedField, "change", {
      includeDerived: derivedRun === "change",
    });
    const blurChecks = collectFieldValidationChecks(resolvedField, "blur", {
      includeDerived: derivedRun === "blur" || derivedRun === "change",
    });
    const submitChecks = collectFieldValidationChecks(resolvedField, "submit", {
      includeDerived: true, // "change", "blur", and "submit" modes all trigger on submit
    });

    if (changeChecks.length + blurChecks.length + submitChecks.length === 0) {
      return undefined;
    }

    const next: AnyFieldValidators = {};
    if (changeChecks.length > 0) {
      next.onChangeAsync = buildValidator(
        changeChecks,
        form,
        contextData,
        customValidators,
      );
      next.onChangeAsyncDebounceMs = changeGroup?.debounceMs;
      if (validationListenTo) next.onChangeListenTo = validationListenTo;
    }
    if (blurChecks.length > 0) {
      next.onBlurAsync = buildValidator(
        blurChecks,
        form,
        contextData,
        customValidators,
      );
      next.onBlurAsyncDebounceMs = blurGroup?.debounceMs;
      if (validationListenTo) next.onBlurListenTo = validationListenTo;
    }
    if (submitChecks.length > 0) {
      next.onSubmitAsync = buildValidator(
        submitChecks,
        form,
        contextData,
        customValidators,
      );
    }
    return next;
  }, [
    resolvedField,
    form,
    contextData,
    customValidators,
    derivedValidationMode,
    validationListenTo,
  ]);

  const mergedValidators = useMemo(() => {
    if (!generatedValidators) return validators;
    if (!validators) return generatedValidators;

    const next: AnyFieldValidators = { ...generatedValidators, ...validators };
    const onChangeListenTo = mergeListenTo(
      generatedValidators.onChangeListenTo,
      validators.onChangeListenTo,
    );
    if (onChangeListenTo) next.onChangeListenTo = onChangeListenTo;

    const onBlurListenTo = mergeListenTo(
      generatedValidators.onBlurListenTo,
      validators.onBlurListenTo,
    );
    if (onBlurListenTo) next.onBlurListenTo = onBlurListenTo;

    return next;
  }, [generatedValidators, validators]);

  const depsSelector = useDependenciesSelector(deps);

  const renderField = () => {
    const formData = form.store.state.values as UnknownData;
    const ctx = { data: formData, context: contextData };
    const isConditionMet =
      resolvedField.condition === undefined ||
      (resolveExpr<boolean>(resolvedField.condition, ctx, mergedRegistries.fns) ?? true);
    const isHidden =
      resolvedField.hidden !== undefined &&
      (resolveExpr<boolean>(resolvedField.hidden, ctx, mergedRegistries.fns) ?? false);
    const isDisabled =
      resolvedField.disabled !== undefined &&
      (resolveExpr<boolean>(resolvedField.disabled, ctx, mergedRegistries.fns) ?? false);
    const isReadOnly =
      resolvedField.readOnly !== undefined &&
      (resolveExpr<boolean>(resolvedField.readOnly, ctx, mergedRegistries.fns) ?? false);
    const isRequired =
      resolvedField.required !== undefined &&
      (resolveExpr<boolean>(resolvedField.required, ctx, mergedRegistries.fns) ?? false);

    if (!isConditionMet) {
      return <ConditionalFieldRemover form={form} name={field.name} />;
    }

    if (isHidden) {
      return (
        <form.Field name={field.name as never} validators={mergedValidators}>
          {() => null}
        </form.Field>
      );
    }

    return (
      <form.Field name={field.name as never} validators={mergedValidators}>
        {(tanstackField: AnyFieldApi) => (
          <FieldContext.Provider
            value={{
              form,
              fieldApi: tanstackField,
              field: resolvedField,
              fieldPath: pointer,
              formData,
              contextData,
              registries: mergedRegistries,
              isHidden,
              isConditionMet,
              isDisabled,
              isReadOnly,
              isRequired,
            }}
          >
            {children}
          </FieldContext.Provider>
        )}
      </form.Field>
    );
  };

  if (deps.length === 0) {
    return renderField();
  }

  return <form.Subscribe selector={depsSelector}>{renderField}</form.Subscribe>;
}

/**
 * Headless wrapper for layout fields (Row, Tabs, etc.) that provides
 * visibility logic and context without TanStack form registration.
 */
export interface LayoutFieldProps<TFormData extends UnknownData = UnknownData> {
  field: CoreField;
  form: FieldFormApi<TFormData>;
  contextData?: UnknownData;
  /** Runtime registries (validators, resolvers, fns). Merged over global config. */
  registries?: FormRegistries;
  /** @deprecated Use `registries.resolvers` instead. */
  optionResolvers?: OptionResolverRegistry;
  basePath?: string;
  children: React.ReactNode;
}

export function LayoutField<TFormData extends UnknownData = UnknownData>({
  field,
  form,
  contextData,
  registries,
  optionResolvers,
  basePath,
  children,
}: LayoutFieldProps<TFormData>) {
  const { registries: globalRegistries } = useFormConfig();

  const mergedRegistries = useMemo(() => {
    return {
      validators: { ...globalRegistries?.validators, ...registries?.validators },
      resolvers: { ...globalRegistries?.resolvers, ...registries?.resolvers, ...optionResolvers },
      fns: { ...globalRegistries?.fns, ...registries?.fns },
    };
  }, [globalRegistries, registries, optionResolvers]);
  const pointer = useMemo(() => {
    if (!basePath) return "";
    return basePath.startsWith("/") ? basePath : fromDotNotation(basePath);
  }, [basePath]);

  const resolvedField = useMemo(
    () => resolveDynamicPaths(field, pointer) as CoreField,
    [field, pointer],
  );

  const deps = useMemo(
    () => Array.from(extractDependencies(resolvedField)),
    [resolvedField],
  );

  const depsSelector = useDependenciesSelector(deps);

  const renderField = () => {
    const formData = form.store.state.values as UnknownData;
    const ctx = { data: formData, context: contextData };
    const isConditionMet =
      resolvedField.condition === undefined ||
      (resolveExpr<boolean>(resolvedField.condition, ctx, mergedRegistries.fns) ?? true);
    const isHidden =
      resolvedField.hidden !== undefined &&
      (resolveExpr<boolean>(resolvedField.hidden, ctx, mergedRegistries.fns) ?? false);

    if (!isConditionMet) return null;
    if (isHidden) return null;

    return (
      <FieldContext.Provider
        value={{
          form,
          field: resolvedField,
          fieldPath: pointer,
          formData,
          contextData,
          registries: mergedRegistries,
          isHidden,
          isConditionMet,
          isDisabled: false,
          isReadOnly: false,
          isRequired: false,
        }}
      >
        {children}
      </FieldContext.Provider>
    );
  };

  return <form.Subscribe selector={depsSelector}>{renderField}</form.Subscribe>;
}

function resolveRelativeDataPaths<TField extends DataField>(
  field: TField,
  basePointer: string,
): TField {
  const resolved = resolveDynamicPaths(field, basePointer);
  return resolved === field ? field : (resolved as TField);
}

function resolveDynamicPaths(value: unknown, basePointer: string): unknown {
  if (!value || typeof value !== "object" || isValidElement(value))
    return value;

  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const resolved = resolveDynamicPaths(item, basePointer);
      if (resolved !== item) changed = true;
      return resolved;
    });
    return changed ? next : value;
  }

  const record = value as Record<string, unknown>;
  let changed = false;
  const next: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(record)) {
    if (key === "$data" && typeof entry === "string") {
      const resolvedPath = resolveRelativePath(entry, basePointer);
      next[key] = resolvedPath;
      if (resolvedPath !== entry) changed = true;
      continue;
    }

    const resolved = resolveDynamicPaths(entry, basePointer);
    next[key] = resolved;
    if (resolved !== entry) changed = true;
  }

  return changed ? next : value;
}

function resolveRelativePath(path: string, basePointer: string): string {
  if (path.startsWith("/")) return path;
  const segments = path.split("/").filter(Boolean);
  const escaped = segments.map((segment) => escapePointer(segment)).join("/");
  if (!basePointer) return `/${escaped}`;
  if (basePointer === "/") return `/${escaped}`;
  return basePointer.endsWith("/")
    ? `${basePointer}${escaped}`
    : `${basePointer}/${escaped}`;
}

function getParentPointer(pointer: string): string {
  if (!pointer || pointer === "/") return "";
  if (!pointer.startsWith("/")) return "";
  const parts = splitPointer(pointer);
  if (parts.length <= 1) return "";
  return `/${parts
    .slice(0, -1)
    .map((segment) => escapePointer(segment))
    .join("/")}`;
}

function ConditionalFieldRemover<TFormData extends UnknownData>({
  form,
  name,
}: {
  form: FieldFormApi<TFormData>;
  name: string;
}) {
  useEffect(() => {
    form.deleteField(name as never);
  }, [form, name]);
  return null;
}
