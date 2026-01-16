"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlaceholder } from "@/components/icon-placeholder";

export interface CopyButtonProps {
  /** The value to copy to clipboard */
  value: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Duration in ms to show the success state (default: 2000) */
  successDuration?: number;
  /** Additional className for the button */
  className?: string;
  /** Callback fired after successful copy */
  onCopy?: () => void;
}

export function CopyButton({
  value,
  disabled = false,
  successDuration = 2000,
  className,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value || disabled) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleCopy}
      disabled={disabled || !value}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <IconPlaceholder
          lucide="Check"
          hugeicons="Tick02Icon"
          tabler="IconCheck"
          phosphor="Check"
          remixicon="RiCheckLine"
          className="size-4"
        />
      ) : (
        <IconPlaceholder
          lucide="Copy"
          hugeicons="Copy01Icon"
          tabler="IconCopy"
          phosphor="Copy"
          remixicon="RiFileCopyLine"
          className="size-4"
        />
      )}
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}
