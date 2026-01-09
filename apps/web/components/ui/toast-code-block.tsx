"use client";

import { cn } from "@/lib/utils";

interface ToastCodeBlockProps {
  code: string;
  className?: string;
}

export function ToastCodeBlock({ code, className }: ToastCodeBlockProps) {
  return (
    <pre
      className={cn(
        "mt-2 w-full max-h-48 overflow-auto rounded-md bg-fd-secondary p-3 text-xs",
        className
      )}
    >
      <code className="block text-fd-secondary-foreground whitespace-pre-wrap break-all">
        {code}
      </code>
    </pre>
  );
}
