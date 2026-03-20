import type {
  AtomicCondition,
  ContextCondition,
  DataCondition,
  ConditionGroup,
  VisibilityCondition,
} from "./types";
import { getByPath } from "./utils/path";
import { resolveDynamicValue } from "./dynamic";

/** Runtime data used for evaluating conditions. */
export interface EvaluationContext {
  formData: Record<string, unknown>;
  contextData?: Record<string, unknown>;
}

function evaluateCondition(
  cond: DataCondition | ContextCondition,
  ctx: EvaluationContext,
): boolean {
  let value: unknown;

  if ("$data" in cond) {
    value = getByPath(ctx.formData, cond.$data);
  } else {
    value = getByPath(ctx.contextData ?? {}, cond.$context);
  }

  if (cond.eq !== undefined) {
    const eq = resolveDynamicValue(cond.eq, ctx.formData, ctx.contextData);
    return value === eq;
  }

  if (cond.neq !== undefined) {
    const neq = resolveDynamicValue(cond.neq, ctx.formData, ctx.contextData);
    return value !== neq;
  }

  if (cond.gt !== undefined) {
    const gt = resolveDynamicValue(cond.gt, ctx.formData, ctx.contextData);
    return typeof value === "number" && typeof gt === "number" && value > gt;
  }

  if (cond.gte !== undefined) {
    const gte = resolveDynamicValue(cond.gte, ctx.formData, ctx.contextData);
    return typeof value === "number" && typeof gte === "number" && value >= gte;
  }

  if (cond.lt !== undefined) {
    const lt = resolveDynamicValue(cond.lt, ctx.formData, ctx.contextData);
    return typeof value === "number" && typeof lt === "number" && value < lt;
  }

  if (cond.lte !== undefined) {
    const lte = resolveDynamicValue(cond.lte, ctx.formData, ctx.contextData);
    return typeof value === "number" && typeof lte === "number" && value <= lte;
  }

  if (cond.contains !== undefined) {
    const contains = resolveDynamicValue(
      cond.contains,
      ctx.formData,
      ctx.contextData,
    );
    return (
      typeof value === "string" &&
      typeof contains === "string" &&
      value.includes(contains)
    );
  }

  if (cond.startsWith !== undefined) {
    const startsWith = resolveDynamicValue(
      cond.startsWith,
      ctx.formData,
      ctx.contextData,
    );
    return (
      typeof value === "string" &&
      typeof startsWith === "string" &&
      value.startsWith(startsWith)
    );
  }

  if (cond.endsWith !== undefined) {
    const endsWith = resolveDynamicValue(
      cond.endsWith,
      ctx.formData,
      ctx.contextData,
    );
    return (
      typeof value === "string" &&
      typeof endsWith === "string" &&
      value.endsWith(endsWith)
    );
  }

  return Boolean(value);
}

function isAndCondition(
  condition: VisibilityCondition,
): condition is ConditionGroup & { $and: VisibilityCondition[] } {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !Array.isArray(condition) &&
    "$and" in condition
  );
}

function isOrCondition(
  condition: VisibilityCondition,
): condition is ConditionGroup & { $or: VisibilityCondition[] } {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !Array.isArray(condition) &&
    "$or" in condition
  );
}

function isAtomicCondition(
  condition: VisibilityCondition,
): condition is AtomicCondition {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !Array.isArray(condition) &&
    !("$and" in condition) &&
    !("$or" in condition)
  );
}

/**
 * Evaluate a visibility condition AST against form + context data.
 */
export function evaluateVisibility(
  condition: VisibilityCondition | undefined,
  ctx: EvaluationContext,
): boolean {
  if (condition === undefined) return true;
  if (typeof condition === "boolean") return condition;

  if (Array.isArray(condition)) {
    return condition.every((c) => evaluateCondition(c, ctx));
  }

  if (isAndCondition(condition)) {
    return condition.$and.every((child) =>
      evaluateVisibility(child, ctx),
    );
  }

  if (isOrCondition(condition)) {
    return condition.$or.some((child) =>
      evaluateVisibility(child, ctx),
    );
  }

  if (!isAtomicCondition(condition)) return true;

  const result = evaluateCondition(condition, ctx);
  return condition.not === true ? !result : result;
}
