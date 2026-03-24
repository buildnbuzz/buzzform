"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlaceholder } from "@/components/icon-placeholder";

export interface CopyButtonProps {
  value: string;
  disabled?: boolean;
  successDuration?: number;
  className?: string;
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
      setTimeout(() => setCopied(false), successDuration);
    } catch {
      // clipboard access denied — fail silently
    }
  };

  if (!value) return null;

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
          hugeicons="Tick02Icon"
          lucide="Check"
          tabler="IconCheck"
          phosphor="Check"
          remixicon="RiCheckLine"
          className="size-4"
        />
      ) : (
        <IconPlaceholder
          hugeicons="Copy01Icon"
          lucide="Copy"
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
