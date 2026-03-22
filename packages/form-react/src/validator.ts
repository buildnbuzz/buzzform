import type { StandardSchemaV1 } from "@tanstack/react-form";
import {
  collectFieldValidationChecks,
  collectValidationChecks,
  escapePointer,
  fromDotNotation,
  getByPath,
  runValidationCheck,
  shouldSkipCheck,
  splitPointer,
  walkFields,
  type DataField,
  type FormSchema,
  type ValidationRegistry,
  type ValidationRun,
} from "@buildnbuzz/form-core";

type StandardIssue = {
  message: string;
  path: string[];
};

/** Runtime options for building a Standard Schema validator from `FormSchema`. */
export interface StandardValidatorOptions {
  customValidators?: ValidationRegistry;
  contextData?: Record<string, unknown>;
  /** Which validation run should include derived (top-level) field checks. */
  derivedValidationMode?: ValidationRun;
}

/** Builds a TanStack Standard Schema validator that executes `form-core` checks on submit. */
export function buildStandardSchemaValidator<TFormData>(
  schema: FormSchema,
  options: StandardValidatorOptions = {},
): StandardSchemaV1<TFormData, unknown> {
  const { customValidators, contextData } = options;
  const derivedValidationMode = options.derivedValidationMode ?? "submit";
  const fieldEntries: Array<{
    pointer: string;
    checks: ReturnType<typeof collectFieldValidationChecks>;
  }> = [];

  walkFields(schema.fields, (field, ctx) => {
    if (!isDataField(field)) return;
    const checks = collectFieldValidationChecks(field, "submit", {
      includeDerived: derivedValidationMode === "submit",
    });
    if (checks.length === 0) return;
    fieldEntries.push({ pointer: joinPointer(ctx.path, field.name), checks });
  });

  return {
    "~standard": {
      version: 1,
      vendor: "buildnbuzz",
      validate: async (formData: unknown) => {
        const data = formData as Record<string, unknown>;
        const issues: StandardIssue[] = [];

        const fieldTasks: Array<Promise<StandardIssue | null>> = [];
        for (const entry of fieldEntries) {
          const pointers = expandWildcardPointers(data, entry.pointer);
          for (const pointer of pointers) {
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

function isDataField(field: FormSchema["fields"][number]): field is DataField {
  return "name" in field;
}

function expandWildcardPointers(
  data: Record<string, unknown>,
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

function joinPointer(basePath: string, segment: string): string {
  const escaped = escapePointer(segment);
  if (!basePath) return `/${escaped}`;
  if (basePath === "/") return `/${escaped}`;
  return basePath.endsWith("/")
    ? `${basePath}${escaped}`
    : `${basePath}/${escaped}`;
}
