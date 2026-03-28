"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Variants (CVA)
// ---------------------------------------------------------------------------

const tagInputVariants = cva(
  "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent bg-clip-padding px-3 py-1.5 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
  {
    variants: {
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },
      readOnly: {
        true: "cursor-default bg-muted/30",
      },
    },
  }
);

const tagItemVariants = cva(
  "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 font-medium whitespace-nowrap text-foreground transition-all",
  {
    variants: {
      variant: {
        chips: "rounded-sm bg-muted px-1.5 text-xs",
        pills: "rounded-full bg-muted px-3 text-xs",
        inline: "rounded-none border-0 border-b-2 border-muted-foreground/30 bg-transparent px-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "chips",
    },
  }
);

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type TagInputContextType = {
  value: string[];
  maxTags?: number;
  allowDuplicates?: boolean;
  maxTagLength?: number;
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  variant: "chips" | "pills" | "inline";
  addTag: (tag: string) => boolean;
  removeTag: (index: number) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const TagInputContext = React.createContext<TagInputContextType | null>(null);

function useTagInputContext() {
  const context = React.useContext(TagInputContext);
  if (!context) {
    throw new Error("TagInput components must be used within a <TagInput />");
  }
  return context;
}

// ---------------------------------------------------------------------------
// TagInput Root
// ---------------------------------------------------------------------------

export type TagInputDelimiter = "Enter" | "Comma" | "Space" | "Tab" | string;

export interface TagInputProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: "chips" | "pills" | "inline";
  maxTags?: number;
  allowDuplicates?: boolean;
  maxTagLength?: number;
  children?: React.ReactNode;
}

export const TagInput = ({
  value = [],
  onValueChange,
  disabled,
  readOnly,
  variant = "chips",
  maxTags,
  allowDuplicates = false,
  maxTagLength,
  children,
}: TagInputProps) => {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (tag: string): boolean => {
    const trimmed = tag.trim();
    if (!trimmed) return false;
    if (maxTagLength && trimmed.length > maxTagLength) return false;
    if (!allowDuplicates && value.includes(trimmed)) return false;
    if (maxTags !== undefined && value.length >= maxTags) return false;

    onValueChange?.([...value, trimmed]);
    return true;
  };

  const removeTag = (index: number) => {
    if (disabled || readOnly) return;
    onValueChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <TagInputContext.Provider
      value={{
        value,
        maxTags,
        allowDuplicates,
        maxTagLength,
        onValueChange,
        disabled,
        readOnly,
        variant,
        addTag,
        removeTag,
        inputValue,
        setInputValue,
        inputRef,
      }}
    >
      {children}
    </TagInputContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// TagInputList
// ---------------------------------------------------------------------------

export type TagInputListProps = React.ComponentPropsWithoutRef<"div">;

export const TagInputList = React.forwardRef<HTMLDivElement, TagInputListProps>(
  ({ className, ...props }, ref) => {
    const { disabled, readOnly, inputRef } = useTagInputContext();

    return (
      <div
        ref={ref}
        onClick={() => !disabled && !readOnly && inputRef.current?.focus()}
        className={cn(tagInputVariants({ disabled, readOnly, className }))}
        {...props}
      />
    );
  }
);
TagInputList.displayName = "TagInputList";

// ---------------------------------------------------------------------------
// TagInputItem
// ---------------------------------------------------------------------------

export interface TagInputItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

export const TagInputItem = React.forwardRef<HTMLDivElement, TagInputItemProps>(
  ({ className, index, children, ...props }, ref) => {
    const { variant, value, disabled, readOnly, removeTag } = useTagInputContext();
    const tag = value[index];

    return (
      <div
        ref={ref}
        className={cn(tagItemVariants({ variant, className }))}
        {...props}
      >
        {children ?? <span className="truncate max-w-40">{tag}</span>}
        {!disabled && !readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            className="ml-0.5 rounded-full p-0.5 opacity-50 hover:bg-muted-foreground/20 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label={`Remove ${tag}`}
          >
            <IconPlaceholder
              lucide="X"
              hugeicons="Cancel01Icon"
              tabler="IconX"
              phosphor="X"
              remixicon="RiCloseLine"
              className="size-3"
            />
          </button>
        )}
      </div>
    );
  }
);
TagInputItem.displayName = "TagInputItem";

// ---------------------------------------------------------------------------
// TagInputControl
// ---------------------------------------------------------------------------

export interface TagInputControlProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  delimiters?: TagInputDelimiter[];
}

export const TagInputControl = React.forwardRef<HTMLInputElement, TagInputControlProps>(
  ({ className, delimiters = ["Enter"], placeholder, onBlur, onKeyDown, ...props }, ref) => {
    const {
      inputValue,
      setInputValue,
      addTag,
      removeTag,
      value: tags,
      maxTags,
      disabled,
      readOnly,
      inputRef,
    } = useTagInputContext();

    // Sync external forward ref with context ref
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
        return;
      }

      const isDelimiter = delimiters.some((d) => {
        if (d === "Comma" && e.key === ",") return true;
        if (d === "Space" && e.key === " ") return true;
        return d.toLowerCase() === e.key.toLowerCase();
      });

      if (isDelimiter && inputValue.trim()) {
        e.preventDefault();
        if (addTag(inputValue)) {
          setInputValue("");
        }
      }

      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const hasCommaDelimiter = delimiters.some((d) => d === "Comma" || d === ",");

      if (hasCommaDelimiter && val.includes(",")) {
        const parts = val.split(",");
        const last = parts.pop() ?? "";

        parts.forEach((p) => {
          addTag(p);
        });

        setInputValue(last);
        return;
      }

      setInputValue(val);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (inputValue.trim()) {
        if (addTag(inputValue)) {
          setInputValue("");
        }
      }
      onBlur?.(e);
    };

    if (readOnly) return null;

    const canAddMore = maxTags === undefined || tags.length < maxTags;
    if (!canAddMore) return null;

    return (
      <input
        {...props}
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        disabled={disabled}
        placeholder={tags.length === 0 ? placeholder : ""}
        className={cn(
          "flex-1 min-w-20 bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed",
          className
        )}
        autoComplete={props.autoComplete ?? "off"}
      />
    );
  }
);
TagInputControl.displayName = "TagInputControl";
