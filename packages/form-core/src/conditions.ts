// =============================================================================
// conditions.ts — deprecated wrapper over resolveExpr
// =============================================================================
// @deprecated Use `resolveExpr` from `expr.ts` with `ExprContext` instead.

import { resolveExpr } from "./expr";
import type { AtomicCondition, Condition, ConditionGroup, ExprContext } from "./types";

/**
 * @deprecated Use `ExprContext` instead.
 */
export interface EvaluationContext {
  formData: Record<string, unknown>;
  contextData?: Record<string, unknown>;
}

function toExprContext(ctx: EvaluationContext): ExprContext {
  return { data: ctx.formData, context: ctx.contextData };
}

function isAndCondition(
  condition: Condition,
): condition is ConditionGroup & { $and: Condition[] } {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !Array.isArray(condition) &&
    "$and" in condition
  );
}

function isOrCondition(
  condition: Condition,
): condition is ConditionGroup & { $or: Condition[] } {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !Array.isArray(condition) &&
    "$or" in condition
  );
}

function isAtomicCondition(
  condition: Condition,
): condition is AtomicCondition {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !("$and" in condition) &&
    !("$or" in condition)
  );
}

/**
 * @deprecated Use `resolveExpr(condition, ctx)` instead.
 */
export function evaluateVisibility(
  condition: Condition | undefined,
  ctx: EvaluationContext,
): boolean {
  if (condition === undefined) return true;
  if (typeof condition === "boolean") return condition;

  if (Array.isArray(condition)) {
    return condition.every((c) => evaluateVisibility(c, ctx));
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

  // AtomicCondition — resolveExpr handles all comparison ops including `not`
  return resolveExpr<boolean>(condition, toExprContext(ctx)) ?? true;
}
