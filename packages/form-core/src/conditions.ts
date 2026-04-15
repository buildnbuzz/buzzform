// =============================================================================
// conditions.ts — deprecated wrapper over resolveExpr
// =============================================================================
// @deprecated Use `resolveExpr` from `expr.ts` with `ExprContext` instead.

import { resolveExpr } from "./expr";
import type { Condition, ConditionGroup, Expr, ExprContext } from "./types";

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
  condition: Expr<boolean>,
): condition is ConditionGroup & { $and: Condition[] } {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !Array.isArray(condition) &&
    "$and" in condition
  );
}

function isOrCondition(
  condition: Expr<boolean>,
): condition is ConditionGroup & { $or: Condition[] } {
  return (
    typeof condition === "object" &&
    condition !== null &&
    !Array.isArray(condition) &&
    "$or" in condition
  );
}

/**
 * @deprecated Use `resolveExpr(condition, ctx)` instead.
 */
export function evaluateVisibility(
  condition: Expr<boolean> | undefined,
  ctx: EvaluationContext,
): boolean {
  if (condition === undefined) return true;
  if (typeof condition === "function") return condition(toExprContext(ctx));
  if (typeof condition === "boolean") return condition;

  if (Array.isArray(condition)) {
    return condition.every((c) =>
      resolveExpr<boolean>(c, toExprContext(ctx)),
    );
  }

  if (isAndCondition(condition)) {
    return condition.$and.every((child) =>
      resolveExpr<boolean>(child, toExprContext(ctx)),
    );
  }

  if (isOrCondition(condition)) {
    return condition.$or.some((child) =>
      resolveExpr<boolean>(child, toExprContext(ctx)),
    );
  }

  // Everything else ($when, $fn, $text, AtomicCondition) → delegate to resolveExpr
  return resolveExpr<boolean>(condition, toExprContext(ctx)) ?? true;
}
