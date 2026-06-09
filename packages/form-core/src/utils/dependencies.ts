import type {
  Expr,
  FieldInput,
  OptionsConfig,
  ValidationConfig,
  ValidationCheck,
  GroupField,
  TabsField,
} from "../types";
import { extractFromExpr } from "../expr";
import { deriveFieldChecks } from "../validation";

function addExprDeps(value: Expr<unknown> | undefined, deps: Set<string>): void {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) addExprDeps(item, deps);
    return;
  }
  if (typeof value === "function" || typeof value === "object" && value !== null) {
    extractFromExpr(value, deps);
  }
}

function extractFromValidationCheck(
  check: ValidationCheck,
  deps: Set<string>,
): void {
  if (!check.args) return;
  for (const value of Object.values(check.args)) {
    addExprDeps(value as Expr<unknown>, deps);
  }
}

function extractFromValidationConfig(
  validate: ValidationConfig | undefined,
  deps: Set<string>,
): void {
  if (!validate) return;
  const groups = [validate.onChange, validate.onBlur, validate.onSubmit].filter(
    Boolean,
  );
  for (const group of groups) {
    for (const check of group!.checks) {
      extractFromValidationCheck(check, deps);
    }
  }
}

/**
 * Extract all `$data` dependencies for a single field.
 *
 * Uses the unified `extractFromExpr` walker to handle all Expr<T> node types:
 * `$data`, `$context`, `$when`, `$fn`, `$text`, inline functions, and condition groups.
 */
export function extractDependencies(field: FieldInput): Set<string> {
  const deps = new Set<string>();

  const f = field as unknown as Record<string, Expr<unknown> | undefined>;

  // Expr<boolean> properties — use generic walker
  for (const key of ["condition", "hidden", "disabled", "required", "readOnly"] as const) {
    if (key in field) addExprDeps(f[key], deps);
  }

  // Value expressions
  for (const key of ["label", "placeholder", "description", "defaultValue"] as const) {
    if (key in field) addExprDeps(f[key], deps);
  }

  // Validation
  if ("validate" in field) {
    extractFromValidationConfig(field.validate as ValidationConfig, deps);
  }

  // Derived checks
  extractFromValidationChecks(deriveFieldChecks(field), deps);

  // Options
  if ("options" in field) {
    const options = (field as { options?: OptionsConfig }).options;
    if (Array.isArray(options)) {
      for (const option of options) {
        if (typeof option === "object" && option !== null) {
          addExprDeps(option.label as Expr<unknown>, deps);
          addExprDeps(option.disabled as Expr<unknown>, deps);
        }
      }
    }
  }

  // Explicit deps
  if ("dependencies" in field && Array.isArray(field.dependencies)) {
    for (const dep of field.dependencies) {
      if (typeof dep === "string") deps.add(dep);
    }
  }

  return deps;
}

function extractFromValidationChecks(
  checks: readonly ValidationCheck[],
  deps: Set<string>,
): void {
  for (const check of checks) {
    extractFromValidationCheck(check, deps);
  }
}

/**
 * Extract `$data` dependencies for all fields in a schema.
 */
export function extractDependenciesFromFields(
  fields: readonly FieldInput[],
): Set<string> {
  const deps = new Set<string>();

  for (const field of fields) {
    extractDependencies(field).forEach((dep) => deps.add(dep));

    if (field.type === "row" || field.type === "collapsible") {
      const f = field as GroupField | { fields: readonly FieldInput[] };
      extractDependenciesFromFields((f as { fields: readonly FieldInput[] }).fields).forEach((dep) => deps.add(dep));
    }

    if (field.type === "tabs") {
      const f = field as TabsField;
      for (const tab of f.tabs) {
        extractDependenciesFromFields(tab.fields).forEach((dep) => deps.add(dep));
      }
    }

    if (field.type === "group" || field.type === "array") {
      const f = field as { fields: readonly FieldInput[] };
      extractDependenciesFromFields(f.fields).forEach((dep) => deps.add(dep));
    }
  }

  return deps;
}
