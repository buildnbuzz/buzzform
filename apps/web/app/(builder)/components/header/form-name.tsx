"use client";

import { useEffect, useState } from "react";
import { useBuilderStore } from "../../lib/store";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon } from "@hugeicons/core-free-icons";

const DEFAULT_NAME = "Untitled form";

export function FormName() {
  const formName = useBuilderStore((state) => state.formName);
  const setFormName = useBuilderStore((state) => state.setFormName);
  const [draftName, setDraftName] = useState(formName);

  useEffect(() => {
    setDraftName(formName);
  }, [formName]);

  const commitName = () => {
    const trimmed = draftName.trim();
    const nextName = trimmed.length > 0 ? trimmed : DEFAULT_NAME;

    if (nextName !== formName) {
      setFormName(nextName);
    }

    if (nextName !== draftName) {
      setDraftName(nextName);
    }
  };

  return (
    <div className="group/form-name relative flex min-w-0 items-center">
      <input
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setDraftName(formName);
            event.currentTarget.blur();
          }
        }}
        placeholder={DEFAULT_NAME}
        aria-label="Form name"
        className={cn(
          "h-8 w-full min-w-0 max-w-60 bg-transparent px-2 pr-8 text-sm font-medium text-foreground",
          "rounded-md border border-transparent transition-colors",
          "hover:border-border focus:border-border focus:outline-none focus:ring-0",
          "text-ellipsis placeholder:text-muted-foreground"
        )}
      />
      <HugeiconsIcon
        icon={Edit01Icon}
        size={14}
        strokeWidth={2}
        className="pointer-events-none absolute right-2 opacity-0 transition-opacity group-hover/form-name:opacity-60 group-focus-within/form-name:opacity-60"
        aria-hidden="true"
      />
    </div>
  );
}
