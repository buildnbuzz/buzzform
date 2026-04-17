import type {
  AtomicCondition,
  Condition,
  ConditionGroup,
  Expr,
  ExprContext,
  FnRegistry,
} from "./types";
import { getByPath } from "./utils/path";

/**
 * Resolve an Expr<T> value to its concrete result.
 *
 * Handles all expression node types: primitives, $data, $context,
 * $when/$then/$else, $fn, $text, inline functions, arrays (implicit AND),
 * and Condition group nodes ($and/$or).
 *
 * @param value - The expression to resolve (may be undefined).
 * @param ctx - The evaluation context.
 * @param fns - Optional function registry for $fn nodes.
 * @returns The resolved value, or undefined if the input was undefined.
 */
export function resolveExpr<T>(
  value: Expr<T> | undefined,
  ctx: ExprContext,
  fns?: FnRegistry,
): T | undefined {
  if (value === undefined) return undefined;

  // Inline function
  if (typeof value === "function") {
    return (value as (c: ExprContext) => T)(ctx);
  }

  // Array → Recursive resolve (treat as data array)
  if (Array.isArray(value)) {
    return value.map((item) => resolveExpr(item, ctx, fns)) as T;
  }

  if (typeof value === "object" && value !== null) {
    // $data reference (with or without comparison operators)
    if ("$data" in value) {
      return isConditionNode(value)
        ? (evaluateCondition(value as AtomicCondition, ctx, fns) as T)
        : (getByPath(ctx.data, (value as { $data: string }).$data) as T | undefined);
    }

    // $context reference (with or without comparison operators)
    if ("$context" in value) {
      return isConditionNode(value)
        ? (evaluateCondition(value as AtomicCondition, ctx, fns) as T)
        : (getByPath(ctx.context ?? {}, (value as { $context: string }).$context) as T | undefined);
    }

    // $when/$then/$else branching
    if ("$when" in value) {
      const cond = value as {
        $when: Condition;
        $then: Expr<T>;
        $else: Expr<T>;
      };
      const pred = evaluateConditionValue(cond.$when, ctx, fns);
      return pred
        ? resolveExpr(cond.$then, ctx, fns)
        : resolveExpr(cond.$else, ctx, fns);
    }

    // $fn registry call
    if ("$fn" in value) {
      const fnNode = value as {
        $fn: string;
        args?: Record<string, Expr<unknown>>;
      };
      const fn = fns?.[fnNode.$fn];
      if (!fn) return undefined;
      const resolvedArgs = resolveArgs(fnNode.args, ctx, fns);
      return fn({ ...ctx, args: resolvedArgs }) as T;
    }

    // $text template interpolation
    if ("$text" in value) {
      return resolveTextTemplate(
        (value as { $text: string }).$text,
        ctx,
      ) as T;
    }

    // $and / $or groups
    if ("$and" in value) {
      return (
        (value as ConditionGroup & { $and: Condition[] }).$and.every((child) =>
          evaluateConditionValue(child, ctx, fns),
        ) as T
      );
    }
    if ("$or" in value) {
      return (
        (value as ConditionGroup & { $or: Condition[] }).$or.some((child) =>
          evaluateConditionValue(child, ctx, fns),
        ) as T
      );
    }
  }

  // Primitive literal
  return value as T;
}

/**
 * Resolve an Expr<boolean> to a boolean result.
 *
 * Special-cases AtomicCondition arrays (implicit AND) and Condition groups,
 * falling back to general resolveExpr for primitives and ExprBase nodes.
 */
export function resolveBooleanExpr(
  value: Expr<boolean> | undefined,
  ctx: ExprContext,
  fns?: FnRegistry,
): boolean {
  if (value === undefined) return true;

  // Condition arrays or objects ($and, $or, $data, $context)
  if (
    Array.isArray(value) ||
    (typeof value === "object" &&
      value !== null &&
      ("$and" in value ||
        "$or" in value ||
        "$data" in value ||
        "$context" in value) &&
      !("$when" in value || "$fn" in value || "$text" in value))
  ) {
    return evaluateConditionValue(value as Condition, ctx, fns);
  }

  return Boolean(resolveExpr(value, ctx, fns));
}

/**
 * Extract all $data / $context paths from an Expr value.
 */
export function extractFromExpr(
  value: Expr<unknown> | undefined,
  deps: Set<string>,
): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  if ("$data" in value) deps.add((value as { $data: string }).$data);
  if ("$context" in value) return;
  if ("$when" in value) {
    const node = value as {
      $when: Condition;
      $then: Expr<unknown>;
      $else: Expr<unknown>;
    };
    extractFromConditionValue(node.$when, deps);
    extractFromExpr(node.$then, deps);
    extractFromExpr(node.$else, deps);
  }
  if ("$fn" in value) {
    const node = value as { args?: Record<string, Expr<unknown>> };
    if (node.args) {
      for (const arg of Object.values(node.args)) {
        extractFromExpr(arg, deps);
      }
    }
  }
  if ("$text" in value) {
    extractTextDeps((value as { $text: string }).$text, deps);
  }
  if ("$and" in value) {
    for (const child of (value as ConditionGroup & { $and: Condition[] }).$and) {
      extractFromConditionValue(child, deps);
    }
  }
  if ("$or" in value) {
    for (const child of (value as ConditionGroup & { $or: Condition[] }).$or) {
      extractFromConditionValue(child, deps);
    }
  }
}

// ============================================================================
// Internal helpers
// ============================================================================

/** Check if an object is a Condition node (has comparison operators). */
function isConditionNode(value: object): value is AtomicCondition {
  return (
    "$data" in value ||
    "$context" in value
  ) && (
    "eq" in value ||
    "neq" in value ||
    "gt" in value ||
    "gte" in value ||
    "lt" in value ||
    "lte" in value ||
    "contains" in value ||
    "startsWith" in value ||
    "endsWith" in value ||
    "not" in value
  );
}

/** Evaluate a single AtomicCondition node. */
function evaluateCondition(
  cond: AtomicCondition,
  ctx: ExprContext,
  fns?: FnRegistry,
): boolean {
  const base = "$data" in cond ? cond.$data : cond.$context;
  const value = "$data" in cond
    ? getByPath(ctx.data, base)
    : getByPath(ctx.context ?? {}, base);

  const applyNot = (result: boolean) => cond.not === true ? !result : result;

  if ("eq" in cond && cond.eq !== undefined) {
    const eq = resolveExpr(cond.eq, ctx, fns);
    return applyNot(value === eq);
  }
  if ("neq" in cond && cond.neq !== undefined) {
    const neq = resolveExpr(cond.neq, ctx, fns);
    return applyNot(value !== neq);
  }
  if ("gt" in cond && cond.gt !== undefined) {
    const gt = resolveExpr(cond.gt, ctx, fns);
    return applyNot(typeof value === "number" && typeof gt === "number" && value > gt);
  }
  if ("gte" in cond && cond.gte !== undefined) {
    const gte = resolveExpr(cond.gte, ctx, fns);
    return applyNot(typeof value === "number" && typeof gte === "number" && value >= gte);
  }
  if ("lt" in cond && cond.lt !== undefined) {
    const lt = resolveExpr(cond.lt, ctx, fns);
    return applyNot(typeof value === "number" && typeof lt === "number" && value < lt);
  }
  if ("lte" in cond && cond.lte !== undefined) {
    const lte = resolveExpr(cond.lte, ctx, fns);
    return applyNot(typeof value === "number" && typeof lte === "number" && value <= lte);
  }
  if ("contains" in cond && cond.contains !== undefined) {
    const contains = resolveExpr(cond.contains, ctx, fns);
    return applyNot(
      typeof value === "string" &&
      typeof contains === "string" &&
      value.includes(contains)
    );
  }
  if ("startsWith" in cond && cond.startsWith !== undefined) {
    const startsWith = resolveExpr(cond.startsWith, ctx, fns);
    return applyNot(
      typeof value === "string" &&
      typeof startsWith === "string" &&
      value.startsWith(startsWith)
    );
  }
  if ("endsWith" in cond && cond.endsWith !== undefined) {
    const endsWith = resolveExpr(cond.endsWith, ctx, fns);
    return applyNot(
      typeof value === "string" &&
      typeof endsWith === "string" &&
      value.endsWith(endsWith)
    );
  }

  // Plain truthiness (no comparison operator)
  return applyNot(Boolean(value));
}

/** Evaluate a Condition value (any shape: atomic, array, $and, $or). */
function evaluateConditionValue(
  cond: Condition,
  ctx: ExprContext,
  fns?: FnRegistry,
): boolean {
  if (typeof cond === "boolean") return cond;

  if (Array.isArray(cond)) {
    return cond.every((c) => evaluateCondition(c, ctx, fns));
  }

  if (typeof cond === "object" && cond !== null) {
    if ("$and" in cond) {
      return cond.$and.every((c) => evaluateConditionValue(c, ctx, fns));
    }
    if ("$or" in cond) {
      return cond.$or.some((c) => evaluateConditionValue(c, ctx, fns));
    }
    return evaluateCondition(cond as AtomicCondition, ctx, fns);
  }

  return true;
}

/** Extract paths from a Condition value. */
function extractFromConditionValue(
  cond: Condition,
  deps: Set<string>,
): void {
  if (typeof cond !== "object" || cond === null || Array.isArray(cond)) return;
  if ("$data" in cond) deps.add(cond.$data);
  if ("$context" in cond) return;
  if ("$and" in cond) {
    for (const c of (cond as ConditionGroup & { $and: Condition[] }).$and) {
      extractFromConditionValue(c, deps);
    }
  }
  if ("$or" in cond) {
    for (const c of (cond as ConditionGroup & { $or: Condition[] }).$or) {
      extractFromConditionValue(c, deps);
    }
  }
  if ("eq" in cond) extractFromDynamicValue(cond.eq, deps);
  if ("neq" in cond) extractFromDynamicValue(cond.neq, deps);
  if ("gt" in cond) extractFromDynamicValue(cond.gt, deps);
  if ("gte" in cond) extractFromDynamicValue(cond.gte, deps);
  if ("lt" in cond) extractFromDynamicValue(cond.lt, deps);
  if ("lte" in cond) extractFromDynamicValue(cond.lte, deps);
  if ("contains" in cond) extractFromDynamicValue(cond.contains, deps);
  if ("startsWith" in cond) extractFromDynamicValue(cond.startsWith, deps);
  if ("endsWith" in cond) extractFromDynamicValue(cond.endsWith, deps);
}

/** Extract $data/$context paths from a legacy DynamicValue-like object. */
function extractFromDynamicValue(
  value: unknown,
  deps: Set<string>,
): void {
  if (!value || typeof value !== "object") return;
  if ("$data" in value) deps.add((value as { $data: string }).$data);
  if ("$context" in value) deps.add((value as { $context: string }).$context);
}

/** Extract ${/path} interpolations from a $text template. */
function extractTextDeps(template: string, deps: Set<string>): void {
  const re = /\$\{\/[^}]+\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(template)) !== null) {
    deps.add(match[0].slice(2, -1)); // strip "${" and "}"
  }
}

/** Resolve $fn args, recursively handling nested Expr values. */
function resolveArgs(
  args: Record<string, Expr<unknown>> | undefined,
  ctx: ExprContext,
  fns?: FnRegistry,
): Record<string, unknown> | undefined {
  if (!args) return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(args)) {
    result[key] = resolveExpr(val, ctx, fns);
  }
  return result;
}

/** Interpolate ${/path} references from ctx.data. */
function resolveTextTemplate(
  template: string,
  ctx: ExprContext,
): string {
  return template.replace(
    /\$\{\/[^}]+\}/g,
    (match) => {
      const path = match.slice(2, -1); // strip "${" and "}"
      const val = getByPath(ctx.data, path);
      return val !== undefined ? String(val) : "";
    },
  );
}
