import type { Tab, CollapsibleField, ExprContext, FnRegistry } from "./types";
import { resolveExpr } from "./expr";

/** Resolved Tab properties for UI rendering. */
export interface ResolvedTab {
  label: string;
  disabled: boolean;
}

/** Resolved Collapsible properties for UI rendering. */
export interface ResolvedCollapsible {
  label: string;
  collapsed: boolean;
}

/** Resolves a single tab's dynamic properties. */
export function resolveTab(
  tab: Tab,
  ctx: ExprContext,
  fns?: FnRegistry,
): ResolvedTab {
  return {
    label:
      typeof tab.label === "string"
        ? tab.label
        : resolveExpr<string>(tab.label, ctx, fns) ?? (tab.name || "Tab"),
    disabled:
      tab.disabled === undefined
        ? false
        : resolveExpr<boolean>(tab.disabled, ctx, fns) ?? false,
  };
}

/** Resolves an array of tabs. */
export function resolveTabs(
  tabs: readonly Tab[],
  ctx: ExprContext,
  fns?: FnRegistry,
): ResolvedTab[] {
  return tabs.map((tab) => resolveTab(tab, ctx, fns));
}

/** Resolves collapsible container properties. */
export function resolveCollapsible(
  field: CollapsibleField,
  ctx: ExprContext,
  fns?: FnRegistry,
): ResolvedCollapsible {
  return {
    label:
      typeof field.label === "string"
        ? field.label
        : resolveExpr<string>(field.label, ctx, fns) ?? "Collapsible",
    collapsed:
      field.collapsed === undefined
        ? false
        : resolveExpr<boolean>(field.collapsed, ctx, fns) ?? false,
  };
}
