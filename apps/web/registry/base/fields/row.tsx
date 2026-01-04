"use client";

import * as React from "react";
import type {
  Field,
  RowField as RowFieldType,
  FormAdapter,
} from "@buildnbuzz/buzzform";
import { cn } from "@/lib/utils";
import { FieldRenderer, type FieldRegistry } from "./render";
import { Skeleton } from "@/components/ui/skeleton";

export interface RowFieldComponentProps {
  field: RowFieldType;
  path: string;
  form: FormAdapter;
  formValues: Record<string, unknown>;
  siblingData: Record<string, unknown>;
  registry?: FieldRegistry;
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

function getAlignClass(align: RowFieldType["ui"]): string {
  switch (align?.align) {
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

function getJustifyClass(justify: RowFieldType["ui"]): string {
  switch (justify?.justify) {
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

export function RowField({
  field,
  path,
  form,
  registry,
}: RowFieldComponentProps) {
  const ui = field.ui;
  const responsive = ui?.responsive !== false;
  const wrap = ui?.wrap ?? false;

  const gapClass = getGapClass(ui?.gap);
  const alignClass = getAlignClass(ui);
  const justifyClass = getJustifyClass(ui);

  const gapStyle =
    typeof ui?.gap === "string"
      ? ({ "--row-gap": ui.gap } as React.CSSProperties)
      : undefined;

  return (
    <div
      className={cn(
        "flex w-full",
        responsive ? "flex-col md:flex-row" : "flex-row",
        gapStyle ? "gap-(--row-gap)" : gapClass,
        alignClass,
        justifyClass,
        wrap && "flex-wrap"
      )}
      style={gapStyle}
    >
      {field.fields.map((nestedField, index) => {
        const nestedFieldName =
          "name" in nestedField ? nestedField.name : `row-item-${index}`;
        const itemKey = `${nestedField.type}-${nestedFieldName}-${index}`;

        const nestedPath =
          "name" in nestedField
            ? path
              ? `${path}.${nestedFieldName}`
              : nestedFieldName
            : path;

        const fieldWidth = (
          nestedField as Field & { style?: { width?: string } }
        ).style?.width as string | undefined;

        // When row handles width, remove style.width from field to prevent double application
        const fieldForRenderer = fieldWidth
          ? {
              ...nestedField,
              style: {
                ...((nestedField as Field & { style?: object }).style || {}),
                width: undefined,
              },
            }
          : nestedField;

        return (
          <div
            key={itemKey}
            className={cn(
              "min-w-0",
              responsive ? "w-full" : "",
              fieldWidth
                ? responsive
                  ? "md:basis-(--field-width)"
                  : "basis-(--field-width)"
                : responsive
                  ? "md:flex-1 md:w-auto"
                  : "flex-1"
            )}
            style={
              fieldWidth
                ? ({ "--field-width": fieldWidth } as React.CSSProperties)
                : undefined
            }
          >
            <FieldRenderer
              field={fieldForRenderer as Field}
              path={nestedPath}
              form={form}
              registry={registry}
            />
          </div>
        );
      })}
    </div>
  );
}

export function RowFieldSkeleton({ field }: { field: RowFieldType }) {
  const ui = field.ui;
  const responsive = ui?.responsive !== false;

  const gapClass = getGapClass(ui?.gap);

  const gapStyle =
    typeof ui?.gap === "string"
      ? ({ "--row-gap": ui.gap } as React.CSSProperties)
      : undefined;

  function getSkeletonHeight(nestedField: Field): string {
    switch (nestedField.type) {
      case "textarea":
        return "h-24";
      case "upload":
        return "h-32";
      case "checkbox":
      case "switch":
        return "h-5";
      default:
        return "h-9";
    }
  }

  return (
    <div
      className={cn(
        "flex w-full",
        responsive ? "flex-col md:flex-row" : "flex-row",
        gapStyle ? "gap-(--row-gap)" : gapClass
      )}
      style={gapStyle}
    >
      {field.fields.map((nestedField, index) => {
        const nestedFieldName =
          "name" in nestedField ? nestedField.name : `row-item-${index}`;
        const itemKey = `skeleton-${nestedField.type}-${nestedFieldName}-${index}`;

        const fieldWidth = (
          nestedField as Field & { style?: { width?: string } }
        ).style?.width as string | undefined;

        return (
          <div
            key={itemKey}
            className={cn(
              "min-w-0",
              responsive ? "w-full" : "",
              fieldWidth
                ? responsive
                  ? "md:basis-(--field-width)"
                  : "basis-(--field-width)"
                : responsive
                  ? "md:flex-1 md:w-auto"
                  : "flex-1"
            )}
            style={
              fieldWidth
                ? ({ "--field-width": fieldWidth } as React.CSSProperties)
                : undefined
            }
          >
            <div className="space-y-2">
              {"label" in nestedField && nestedField.label !== false && (
                <Skeleton className="h-4 w-20" />
              )}
              <Skeleton
                className={cn(
                  "w-full rounded-md",
                  getSkeletonHeight(nestedField)
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
