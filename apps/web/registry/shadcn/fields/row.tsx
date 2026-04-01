"use client";

import type { CSSProperties, ReactNode } from "react";
import type { RowField as RowFieldDef } from "@buildnbuzz/form-core";
import { useLayoutField } from "@buildnbuzz/form-react";
import { cn } from "@/lib/utils";

/** Typed UI options for the row layout field (opaque in form-core). */
interface RowUi {
  gap?: number | string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  responsive?: boolean;
  wrap?: boolean;
}

function getGapClass(gap: number | string | undefined): string {
  if (gap === undefined) return "gap-4";
  if (typeof gap === "number") {
    const gapMap: Record<number, string> = {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
    };
    return gapMap[gap] || "gap-4";
  }
  return "";
}

function getAlignClass(ui: RowUi | undefined): string {
  switch (ui?.align) {
    case "start":
      return "items-start";
    case "center":
      return "items-center";
    case "end":
      return "items-end";
    case "stretch":
      return "items-stretch";
    default:
      return "items-start";
  }
}

function getJustifyClass(ui: RowUi | undefined): string {
  switch (ui?.justify) {
    case "start":
      return "justify-start";
    case "center":
      return "justify-center";
    case "end":
      return "justify-end";
    case "between":
      return "justify-between";
    default:
      return "justify-start";
  }
}

/**
 * Shadcn row layout field.
 *
 * Nested child fields are pre-rendered by `FieldRenderer` / `RenderFields`
 * and passed in as `children`. This component only provides the flex wrapper.
 */
export function RowField({ children }: { children?: ReactNode }) {
  const { field } = useLayoutField<RowFieldDef>();

  const ui = field.ui as RowUi | undefined;
  const responsive = ui?.responsive ?? true;
  const wrap = ui?.wrap ?? false;

  const gapClass = getGapClass(ui?.gap);
  const alignClass = getAlignClass(ui);
  const justifyClass = getJustifyClass(ui);

  const gapStyle =
    typeof ui?.gap === "string"
      ? ({ "--row-gap": ui.gap } as CSSProperties)
      : undefined;

  return (
    <div
      className={cn(
        "flex w-full",
        responsive ? "flex-col md:flex-row" : "flex-row",
        gapStyle ? "gap-(--row-gap)" : gapClass,
        alignClass,
        justifyClass,
        wrap && "flex-wrap",
        // Each direct DOM child (FieldGroup div) becomes a flex item
        "*:min-w-0",
        responsive ? "*:w-full md:*:flex-1" : "*:flex-1",
      )}
      style={gapStyle}
    >
      {children}
    </div>
  );
}
