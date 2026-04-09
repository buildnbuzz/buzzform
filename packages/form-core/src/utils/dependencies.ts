import type {
  AtomicCondition,
  DynamicValue,
  Field,
  ValidationConfig,
  ValidationCheck,
} from "../types";
import { deriveFieldChecks } from "../validation";

function addDep(set: Set<string>, path: string | undefined): void {
  if (!path) return;
  set.add(path);
}

function extractFromDynamicValue(
  value: DynamicValue<unknown> | undefined,
  deps: Set<string>,
): void {
  if (!value || typeof value !== "object") return;
  if ("$data" in value) addDep(deps, value.$data as string);
}

function extractFromCondition(
  condition: AtomicCondition | undefined,
  deps: Set<string>,
): void {
  if (!condition) return;
  if (typeof condition !== "object") return;
  if ("$data" in condition) addDep(deps, condition.$data);
  if ("$context" in condition) return;

  if ("eq" in condition && condition.eq !== undefined)
    extractFromDynamicValue(condition.eq, deps);
  if ("neq" in condition && condition.neq !== undefined)
    extractFromDynamicValue(condition.neq, deps);
  if ("gt" in condition && condition.gt !== undefined)
    extractFromDynamicValue(condition.gt, deps);
  if ("gte" in condition && condition.gte !== undefined)
    extractFromDynamicValue(condition.gte, deps);
  if ("lt" in condition && condition.lt !== undefined)
    extractFromDynamicValue(condition.lt, deps);
  if ("lte" in condition && condition.lte !== undefined)
    extractFromDynamicValue(condition.lte, deps);
  if ("contains" in condition && condition.contains !== undefined)
    extractFromDynamicValue(condition.contains, deps);
  if ("startsWith" in condition && condition.startsWith !== undefined)
    extractFromDynamicValue(condition.startsWith, deps);
  if ("endsWith" in condition && condition.endsWith !== undefined)
    extractFromDynamicValue(condition.endsWith, deps);
}

function extractFromValidationCheck(
  check: ValidationCheck,
  deps: Set<string>,
): void {
  if (!check.args) return;

  for (const value of Object.values(check.args)) {
    extractFromDynamicValue(value as DynamicValue<unknown>, deps);
  }
}

function extractFromValidationChecks(
  checks: readonly ValidationCheck[],
  deps: Set<string>,
): void {
  for (const check of checks) {
    extractFromValidationCheck(check, deps);
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
    extractFromValidationChecks(group!.checks, deps);
  }
}

/**
 * Extract all `$data` dependencies for a single field.
 */
export function extractDependencies(field: Field): Set<string> {
  const deps = new Set<string>();

  if ("condition" in field) {
    const condition = field.condition;
    if (Array.isArray(condition)) {
      condition.forEach((c) => extractFromCondition(c, deps));
    } else if (
      condition &&
      typeof condition === "object" &&
      "$and" in condition
    ) {
      condition.$and.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else if (
      condition &&
      typeof condition === "object" &&
      "$or" in condition
    ) {
      condition.$or.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else {
      extractFromCondition(condition as AtomicCondition, deps);
    }
  }

  if ("hidden" in field) {
    const hidden = field.hidden;
    if (Array.isArray(hidden)) {
      hidden.forEach((c) => extractFromCondition(c, deps));
    } else if (hidden && typeof hidden === "object" && "$and" in hidden) {
      hidden.$and.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else if (hidden && typeof hidden === "object" && "$or" in hidden) {
      hidden.$or.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else {
      extractFromCondition(hidden as AtomicCondition, deps);
    }
  }

  if ("disabled" in field) {
    const disabled = field.disabled;
    if (Array.isArray(disabled)) {
      disabled.forEach((c) => extractFromCondition(c, deps));
    } else if (disabled && typeof disabled === "object" && "$and" in disabled) {
      disabled.$and.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else if (disabled && typeof disabled === "object" && "$or" in disabled) {
      disabled.$or.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else {
      extractFromCondition(disabled as AtomicCondition, deps);
    }
  }

  if ("required" in field) {
    const required = field.required;
    if (Array.isArray(required)) {
      required.forEach((c) => extractFromCondition(c, deps));
    } else if (required && typeof required === "object" && "$and" in required) {
      required.$and.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else if (required && typeof required === "object" && "$or" in required) {
      required.$or.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else {
      extractFromCondition(required as AtomicCondition, deps);
    }
  }

  if ("readOnly" in field) {
    const readOnly = field.readOnly;
    if (Array.isArray(readOnly)) {
      readOnly.forEach((c) => extractFromCondition(c, deps));
    } else if (readOnly && typeof readOnly === "object" && "$and" in readOnly) {
      readOnly.$and.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else if (readOnly && typeof readOnly === "object" && "$or" in readOnly) {
      readOnly.$or.forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((inner) => extractFromCondition(inner, deps));
        } else {
          extractFromCondition(c as AtomicCondition, deps);
        }
      });
    } else {
      extractFromCondition(readOnly as AtomicCondition, deps);
    }
  }

  if ("defaultValue" in field) {
    extractFromDynamicValue(field.defaultValue as DynamicValue<unknown>, deps);
  }

  if ("validate" in field) {
    extractFromValidationConfig(field.validate as ValidationConfig, deps);
  }

  extractFromValidationChecks(deriveFieldChecks(field), deps);

  if ("options" in field && Array.isArray(field.options)) {
    for (const option of field.options) {
      if (typeof option === "object") {
        extractFromDynamicValue(option.label, deps);
        extractFromDynamicValue(option.disabled as DynamicValue<unknown>, deps);
      }
    }
  }

  if ("label" in field) {
    extractFromDynamicValue(field.label as DynamicValue<unknown>, deps);
  }

  if ("placeholder" in field) {
    extractFromDynamicValue(field.placeholder as DynamicValue<unknown>, deps);
  }

  if ("description" in field) {
    extractFromDynamicValue(field.description as DynamicValue<unknown>, deps);
  }

  if ("dependencies" in field && Array.isArray(field.dependencies)) {
    for (const dep of field.dependencies) {
      if (typeof dep === "string") deps.add(dep);
    }
  }

  return deps;
}

/**
 * Extract `$data` dependencies for all fields in a schema.
 */
export function extractDependenciesFromFields(
  fields: readonly Field[],
): Set<string> {
  const deps = new Set<string>();

  for (const field of fields) {
    extractDependencies(field).forEach((dep) => deps.add(dep));

    if (field.type === "row" || field.type === "collapsible") {
      extractDependenciesFromFields(field.fields).forEach((dep) => deps.add(dep));
    }

    if (field.type === "tabs") {
      for (const tab of field.tabs) {
        extractDependenciesFromFields(tab.fields).forEach((dep) => deps.add(dep));
      }
    }

    if (field.type === "group" || field.type === "array") {
      extractDependenciesFromFields(field.fields as readonly Field[]).forEach((dep) => deps.add(dep));
    }
  }

  return deps;
}
