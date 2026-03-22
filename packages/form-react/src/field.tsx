import { useEffect, useMemo } from "react";
import {
  collectFieldValidationChecks,
  evaluateVisibility,
  extractDependencies,
  getByPath,
  getValidationGroup,
  runChecks,
  type ValidationCheck,
  type ValidationRegistry,
} from "@buildnbuzz/form-core";
import type {
  AnyFieldValidators,
  FieldFormApi,
  FieldProps,
  UnknownData,
} from "./types";

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
    }
    if (blurChecks.length > 0) {
      next.onBlurAsync = buildValidator(
        blurChecks,
        form,
        contextData,
        customValidators,
      );
      next.onBlurAsyncDebounceMs = blurGroup?.debounceMs;
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
  }, [field, form, contextData, customValidators, derivedValidationMode]);

  const mergedValidators = useMemo(() => {
    if (!generatedValidators) return validators;
    if (!validators) return generatedValidators;
    return { ...generatedValidators, ...validators };
  }, [generatedValidators, validators]);

  const renderField = () => {
    const formData = form.store.state.values as UnknownData;
    const ctx = { formData, contextData };
    const isConditionMet =
      field.condition === undefined || evaluateVisibility(field.condition, ctx);
    const isHidden =
      field.hidden !== undefined && evaluateVisibility(field.hidden, ctx);

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
        {() => children}
      </form.Field>
    );
  };

  if (deps.length === 0) return renderField();

  return (
    <form.Subscribe
      selector={(state: { values: UnknownData }) =>
        deps.map((path) => getByPath(state.values, path))
      }
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
