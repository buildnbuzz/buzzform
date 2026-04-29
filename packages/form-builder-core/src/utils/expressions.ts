import { resolveBooleanExpr, type Expr, type Condition } from "@buildnbuzz/form-core";
import type { ExpressionGroup, ExpressionRule } from "../types";

/**
 * Evaluates a builder's Expression UI group against a data object.
 * 
 * Reuses form-core's expression engine for consistency.
 */
export function evaluateExpressionGroup(
  data: Record<string, unknown>,
  group: ExpressionGroup,
): boolean {
  const expr = compileToExpression(group);
  if (!expr) return true;

  return resolveBooleanExpr(expr, { data });
}

/**
 * Compiles a builder's Expression UI group into a form-core Expr<boolean> AST.
 * 
 * Supports recursive groups, logical AND/OR, and all standard operators.
 */
export function compileToExpression(
  group: ExpressionGroup | null,
): Expr<boolean> | undefined {
  if (!group || group.children.length === 0) {
    return undefined;
  }

  const children = group.children.map((child) => {
    if (child.type === "group") {
      return compileToExpression(child);
    }
    return compileRule(child);
  }).filter((c): c is Expr<boolean> => c !== undefined);

  if (children.length === 0) return undefined;
  if (children.length === 1) return children[0];

  return group.logicalOperator === "OR" 
    ? { $or: children as Condition[] } 
    : { $and: children as Condition[] };
}

/**
 * Compiles a single expression rule into an AtomicCondition.
 */
function compileRule(rule: ExpressionRule): Condition {
  const { fieldId, operator, value } = rule;
  const path = `/${fieldId}`;

  switch (operator) {
    case "equals":
      return { $data: path, eq: value };
    case "not_equals":
      return { $data: path, neq: value };
    case "contains":
      return { $data: path, contains: value };
    case "not_contains":
      return { $data: path, contains: value, not: true };
    case "greater_than":
      return { $data: path, gt: Number(value) };
    case "less_than":
      return { $data: path, lt: Number(value) };
    case "is_empty":
      return { $data: path, not: true };
    case "is_not_empty":
      return { $data: path };
    default:
      return true;
  }
}

export function findContainer(id: string, root: ExpressionGroup): string | null {
  for (const child of root.children) {
    if (child.id === id) return root.id;
    if (child.type === "group") {
      const container = findContainer(id, child);
      if (container) return container;
    }
  }
  return null;
}

export function isGroupNode(id: string, root: ExpressionGroup): boolean {
  if (root.id === id) return true;
  for (const child of root.children) {
    if (child.type === "group") {
      if (isGroupNode(id, child)) return true;
    }
  }
  return false;
}

export function findNode(
  id: string,
  root: ExpressionGroup
): ExpressionGroup | ExpressionRule | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    if (child.id === id) return child;
    if (child.type === "group") {
      const found = findNode(id, child);
      if (found) return found;
    }
  }
  return null;
}

export function isExpressionDescendant(
  parentId: string,
  targetId: string,
  root: ExpressionGroup
): boolean {
  const parentNode = findNode(parentId, root);
  if (!parentNode || parentNode.type !== "group") return false;

  const checkChildren = (node: ExpressionGroup): boolean => {
    if (node.id === targetId) return true;
    for (const child of node.children) {
      if (child.id === targetId) return true;
      if (child.type === "group" && checkChildren(child)) return true;
    }
    return false;
  };

  return checkChildren(parentNode);
}
