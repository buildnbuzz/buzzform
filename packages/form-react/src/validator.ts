import { isValidElement } from "react";
import type { StandardSchemaV1 } from "@tanstack/react-form";
import {
  collectFieldValidationChecks,
  collectValidationChecks,
  escapePointer,
  resolveExpr,
  fromDotNotation,
  getByPath,
  joinPointer,
  runValidationCheck,
  shouldSkipCheck,
  splitPointer,
  walkFields,
  isDataField,
} from "@buildnbuzz/form-core";
import type { 
  DataField,
  FormSchema,
  ValidationCheck,
  ValidationRegistry,
  ValidationRun,
} from "@buildnbuzz/form-core";
import type { UnknownData } from "./types";

type StandardIssue = {
  message: string;
  path: string[];
};

/** Runtime options for building a Standard Schema validator from `FormSchema`. */
export interface StandardValidatorOptions {
  customValidators?: ValidationRegistry;
  contextData?: UnknownData;
  /** Which validation run should include derived (top-level) field checks. */
  derivedValidationMode?: ValidationRun;
}

/** Builds a TanStack Standard Schema validator that executes `form-core` checks on submit. */
export function buildStandardSchemaValidator<TFormData>(
  schema: FormSchema,
  options: StandardValidatorOptions = {},
): StandardSchemaV1<TFormData, unknown> {
  const { customValidators, contextData } = options;
  const fieldEntries: Array<{
    pointer: string;
    field: DataField;
    checks: ValidationCheck[];
  }> = [];

  walkFields(schema.fields, (field, ctx) => {
    if (!isDataField(field)) return;
    const checks = collectFieldValidationChecks(field, "submit", {
      includeDerived: true, // "change", "blur", and "submit" all require derived checks to pass on submit
    });
    if (checks.length === 0) return;
    fieldEntries.push({
      pointer: joinPointer(ctx.path, field.name),
      field,
      checks,
    });
  });

  return {
    "~standard": {
      version: 1,
      vendor: "buildnbuzz",
      validate: async (formData: unknown) => {
        const data = formData as UnknownData;
        const issues: StandardIssue[] = [];

        const fieldTasks: Array<Promise<StandardIssue | null>> = [];
        for (const entry of fieldEntries) {
          const pointers = expandWildcardPointers(data, entry.pointer);
          for (const pointer of pointers) {
            const basePointer = getParentPointer(pointer);
            const resolvedField = resolveRelativeDataPaths(
              entry.field,
              basePointer,
            );
            const exprCtx = { data: data, context: contextData };

            if (
              resolvedField.condition !== undefined &&
              !resolveExpr<boolean>(resolvedField.condition, exprCtx)
            ) {
              continue;
            }
            if (
              resolvedField.disabled !== undefined &&
              resolveExpr<boolean>(resolvedField.disabled, exprCtx)
            ) {
              continue;
            }

            const value = getByPath(data, pointer);
            for (const check of entry.checks) {
              if (shouldSkipCheck(check, value)) continue;
              fieldTasks.push(
                Promise.resolve(
                  runValidationCheck(
                    check,
                    value,
                    { formData: data, contextData },
                    customValidators,
                  ),
                ).then((result) =>
                  result.isValid
                    ? null
                    : { message: result.message, path: splitPointer(pointer) },
                ),
              );
            }
          }
        }

        if (fieldTasks.length > 0) {
          const fieldIssues = (await Promise.all(fieldTasks)).filter(
            (issue): issue is StandardIssue => issue !== null,
          );
          issues.push(...fieldIssues);
        }

        const formChecks = collectValidationChecks(schema.validate);
        if (formChecks.length > 0) {
          const formTasks = formChecks.map((check) =>
            Promise.resolve(
              runValidationCheck(
                check,
                data,
                { formData: data, contextData },
                customValidators,
              ),
            ).then((result) => {
              if (result.isValid) return null;
              const pathArg = (check.args as { path?: unknown } | undefined)
                ?.path;
              const rawPath = typeof pathArg === "string" ? pathArg : "";
              const pointer = rawPath ? toAbsolutePointer(rawPath) : "";
              return {
                message: result.message,
                path: pointer ? splitPointer(pointer) : [],
              } satisfies StandardIssue;
            }),
          );
          const formIssues = (await Promise.all(formTasks)).filter(
            (issue): issue is StandardIssue => issue !== null,
          );
          issues.push(...formIssues);
        }

        if (issues.length > 0) return { issues };
        return { value: formData as TFormData };
      },
    },
  };
}



function expandWildcardPointers(
  data: UnknownData,
  pointer: string,
): string[] {
  const segments = splitPointer(pointer);
  const results: string[] = [];

  const expand = (index: number, prefix: string[]): void => {
    if (index >= segments.length) {
      results.push(pointerFromSegments(prefix));
      return;
    }

    const segment = segments[index];
    if (segment === undefined) return;
    if (segment !== "*") {
      expand(index + 1, [...prefix, segment]);
      return;
    }

    const arrayPath = pointerFromSegments(prefix);
    const value = getByPath(data, arrayPath);
    if (!Array.isArray(value)) return;

    for (let i = 0; i < value.length; i += 1) {
      expand(index + 1, [...prefix, String(i)]);
    }
  };

  expand(0, []);
  return results;
}

function pointerFromSegments(segments: string[]): string {
  if (segments.length === 0) return "";
  return `/${segments.map(escapePointer).join("/")}`;
}

function toAbsolutePointer(path: string): string {
  if (!path) return "";
  if (path.startsWith("/")) return path;
  return fromDotNotation(path);
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

function resolveRelativeDataPaths<T>(value: T, basePointer: string): T {
  const resolved = resolveDynamicPaths(value, basePointer);
  return resolved === value ? value : (resolved as T);
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
