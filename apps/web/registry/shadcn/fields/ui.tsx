"use client";

import type { ReactNode } from "react";
import type { UiField as UiFieldDef } from "@buildnbuzz/form-react";
import { useLayoutField, resolveExpr } from "@buildnbuzz/form-react";
import { cn } from "@/lib/utils";

interface UiUi {
  className?: string;
}

/**
 * Shadcn UI/markup layout field.
 * Renders inline text, HTML, or React elements dynamically.
 */
export function UiField() {
  const { field, formData, contextData, registries } = useLayoutField<UiFieldDef>();

  const ui = field.ui as UiUi | undefined;

  const resolvedContent = resolveExpr<ReactNode>(
    field.content,
    { data: formData, context: contextData },
    registries?.fns
  );

  return (
    <div className={cn("w-full text-sm", ui?.className)}>
      {resolvedContent}
    </div>
  );
}
