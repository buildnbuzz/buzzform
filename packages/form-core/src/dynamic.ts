// =============================================================================
// dynamic.ts — deprecated wrapper over resolveExpr
// =============================================================================

import { resolveExpr } from "./expr";
import type { DataPath, ContextPath, Expr, ExprContext } from "./types";

/** @deprecated Use `Expr<T>` instead. */
export type DynamicValue<T = unknown> = T | { $data: DataPath } | { $context: ContextPath };

/**
 * @deprecated Use `resolveExpr(value, ctx)` instead.
 */
export function resolveDynamicValue<T>(
  value: DynamicValue<T> | undefined,
  formData: Record<string, unknown>,
  contextData?: Record<string, unknown>,
): T | undefined {
  return resolveExpr<T>(
    value as Expr<T> | undefined,
    { data: formData, context: contextData },
  );
}
