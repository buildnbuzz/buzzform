"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CopyCommand() {
  const [hasCopied, setHasCopied] = React.useState(false);
  const command =
    "npx shadcn@latest add https://form.buildnbuzz.com/r/starter.json";

  const copyToClipboard = React.useCallback(() => {
    navigator.clipboard.writeText(command);
    setHasCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, []);

  return (
    <Button
      variant="outline"
      onClick={copyToClipboard}
      className={cn(
        "mt-6 h-auto animate-fade-in max-w-[90vw] gap-2.5 rounded-full px-4 py-2.5 font-normal sm:px-5",
        "active:scale-98"
      )}
    >
      <span className="shrink-0 text-muted-foreground select-none">$</span>
      <code className="truncate font-mono text-xs sm:text-sm text-foreground/90">
        npx shadcn@latest add .../starter.json
      </code>
      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
        <HugeiconsIcon
          icon={hasCopied ? Tick02Icon : Copy01Icon}
          className={cn(
            "h-3.5 w-3.5 transition-all text-muted-foreground",
            hasCopied && "text-green-500 scale-110"
          )}
        />
      </div>
    </Button>
  );
}
