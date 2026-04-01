import { useEffect, useMemo } from "react";
import type { AnyFieldApi } from "@tanstack/form-core";
import {
  type DataField,
  type Field as CoreField,
  collectFieldValidationChecks,
  evaluateVisibility,
  escapePointer,
  extractDependencies,
  fromDotNotation,
  getByPath,
  getValidationGroup,
  runChecks,
  splitPointer,
  toDotNotation,
  type ValidationCheck,
  type ValidationRegistry,
} from "@buildnbuzz/form-core";
import type {
  AnyFieldValidators,
  FieldFormApi,
  FieldProps,
  UnknownData,
} from "./types";
import { FieldContext } from "./contexts";

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
    const value =
      typeof input === "object" && input !== null && "value" in input
        ? (input as { value: unknown }).value
        : input;

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
  customValidators,
  validators,
  derivedValidationMode,
  children,
}: FieldProps<TFormData>) {
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
    const derivedRun = derivedValidationMode ?? "blur";
    const changeGroup = getValidationGroup(resolvedField.validate, "change");
    const blurGroup = getValidationGroup(resolvedField.validate, "blur");
    const changeChecks = collectFieldValidationChecks(resolvedField, "change", {
      includeDerived: derivedRun === "change",
    });
    const blurChecks = collectFieldValidationChecks(resolvedField, "blur", {
      includeDerived: derivedRun === "blur",
    });
    const submitChecks = collectFieldValidationChecks(resolvedField, "submit", {
      includeDerived: derivedRun === "submit",
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

  const depsSelector = useMemo(() => {
    let prev: unknown[] | undefined;

    return (state: { values: UnknownData }) => {
      if (deps.length === 0) return [];
      if (!prev || prev.length !== deps.length) {
        const next = deps.map((path) => getByPath(state.values, path));
        prev = next;
        return next;
      }

      let next: unknown[] | undefined;
      for (let i = 0; i < deps.length; i += 1) {
        const value = getByPath(state.values, deps[i]!);
        if (!next) {
          if (Object.is(value, prev[i])) continue;
          next = prev.slice();
        }
        next[i] = value;
      }

      if (!next) return prev;
      prev = next;
      return next;
    };
  }, [deps]);

  const renderField = () => {
    const formData = form.store.state.values as UnknownData;
    const ctx = { formData, contextData };
    const isConditionMet =
      resolvedField.condition === undefined ||
      evaluateVisibility(resolvedField.condition, ctx);
    const isHidden =
      resolvedField.hidden !== undefined &&
      evaluateVisibility(resolvedField.hidden, ctx);
    const isDisabled =
      resolvedField.disabled !== undefined &&
      evaluateVisibility(resolvedField.disabled, ctx);
    const isReadOnly =
      resolvedField.readOnly !== undefined &&
      evaluateVisibility(resolvedField.readOnly, ctx);
    const isRequired =
      resolvedField.required !== undefined &&
      evaluateVisibility(resolvedField.required, ctx);

    if (!isConditionMet) {
      return (
        <ConditionalFieldRemover
          form={form}
          name={field.name}
        />
      );
    }

    if (isHidden) {
      return (
        <form.Field
          name={field.name as never}
          validators={mergedValidators}
        >
          {() => null}
        </form.Field>
      );
    }

    return (
      <form.Field
        name={field.name as never}
        validators={mergedValidators}
      >
        {(tanstackField: AnyFieldApi) => (
          <FieldContext.Provider
            value={{
              form,
              fieldApi: tanstackField,
              field: resolvedField,
              fieldPath: pointer,
              formData,
              contextData,
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

  return (
    <form.Subscribe
      selector={depsSelector}
    >
      {renderField}
    </form.Subscribe>
  );
}

/**
 * Headless wrapper for layout fields (Row, Tabs, etc.) that provides
 * visibility logic and context without TanStack form registration.
 */
export interface LayoutFieldProps<
  TFormData extends UnknownData = UnknownData,
> {
  field: CoreField;
  form: FieldFormApi<TFormData>;
  contextData?: UnknownData;
  basePath?: string;
  children: React.ReactNode;
}

export function LayoutField<TFormData extends UnknownData = UnknownData>({
  field,
  form,
  contextData,
  basePath,
  children,
}: LayoutFieldProps<TFormData>) {
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

  const depsSelector = useMemo(() => {
    let prev: unknown[] | undefined;

    return (state: { values: UnknownData }) => {
      if (deps.length === 0) return [];
      if (!prev || prev.length !== deps.length) {
        const next = deps.map((path) => getByPath(state.values, path));
        prev = next;
        return next;
      }

      let next: unknown[] | undefined;
      for (let i = 0; i < deps.length; i += 1) {
        const value = getByPath(state.values, deps[i]!);
        if (!next) {
          if (Object.is(value, prev[i])) continue;
          next = prev.slice();
        }
        next[i] = value;
      }

      if (!next) return prev;
      prev = next;
      return next;
    };
  }, [deps]);

  const renderField = () => {
    const formData = form.store.state.values as UnknownData;
    const ctx = { formData, contextData };
    const isConditionMet =
      resolvedField.condition === undefined ||
      evaluateVisibility(resolvedField.condition, ctx);
    const isHidden =
      resolvedField.hidden !== undefined &&
      evaluateVisibility(resolvedField.hidden, ctx);

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

  return (
    <form.Subscribe
      selector={depsSelector}
    >
      {renderField}
    </form.Subscribe>
  );
}

function resolveRelativeDataPaths<TField extends DataField>(
  field: TField,
  basePointer: string,
): TField {
  const resolved = resolveDynamicPaths(field, basePointer);
  return resolved === field ? field : (resolved as TField);
}

function resolveDynamicPaths(value: unknown, basePointer: string): unknown {
  if (!value || typeof value !== "object") return value;

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
