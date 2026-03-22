import { useEffect, useMemo } from "react";
import type { AnyFieldApi } from "@tanstack/form-core";
import {
  collectFieldValidationChecks,
  evaluateVisibility,
  escapePointer,
  extractDependencies,
  getByPath,
  getValidationGroup,
  runChecks,
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
  const deps = useMemo(() => Array.from(extractDependencies(field)), [field]);
  const fieldName = useMemo(() => {
    const pointer = field.name.startsWith("/")
      ? field.name
      : `/${escapePointer(field.name)}`;
    return toDotNotation(pointer);
  }, [field.name]);

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
    const changeGroup = getValidationGroup(field.validate, "change");
    const blurGroup = getValidationGroup(field.validate, "blur");
    const changeChecks = collectFieldValidationChecks(field, "change", {
      includeDerived: derivedRun === "change",
    });
    const blurChecks = collectFieldValidationChecks(field, "blur", {
      includeDerived: derivedRun === "blur",
    });
    const submitChecks = collectFieldValidationChecks(field, "submit", {
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
    field,
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

  const renderField = () => {
    const formData = form.store.state.values as UnknownData;
    const ctx = { formData, contextData };
    const isConditionMet =
      field.condition === undefined || evaluateVisibility(field.condition, ctx);
    const isHidden =
      field.hidden !== undefined && evaluateVisibility(field.hidden, ctx);
    const isDisabled =
      field.disabled !== undefined && evaluateVisibility(field.disabled, ctx);
    const isReadOnly =
      field.readOnly !== undefined && evaluateVisibility(field.readOnly, ctx);

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
              field,
              formData,
              contextData,
              isHidden,
              isConditionMet,
              isDisabled,
              isReadOnly,
            }}
          >
            {children}
          </FieldContext.Provider>
        )}
      </form.Field>
    );
  };

  if (deps.length === 0) return renderField();

  const depsSelector = useMemo(() => {
    let prev: unknown[] | undefined;

    return (state: { values: UnknownData }) => {
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

  return (
    <form.Subscribe
      selector={depsSelector}
    >
      {renderField}
    </form.Subscribe>
  );
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
