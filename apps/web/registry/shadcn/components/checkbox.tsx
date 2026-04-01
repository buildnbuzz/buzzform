"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, "checked"> & {
  checked?: boolean | "indeterminate";
  indeterminate?: boolean;
};

export function Checkbox({
  className,
  checked,
  indeterminate,
  ...props
}: CheckboxProps) {
  const isIndeterminate = indeterminate ?? checked === "indeterminate";
  const normalizedChecked = checked === "indeterminate" ? false : checked;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={normalizedChecked}
      indeterminate={isIndeterminate}
      data-indeterminate={isIndeterminate ? "" : undefined}
      className={cn(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-indeterminate:bg-primary data-indeterminate:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border transition-colors group-has-disabled/field:opacity-50 focus-visible:ring-[3px] aria-invalid:ring-[3px] peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="[&>svg]:size-3.5 grid place-content-center text-current transition-none"
      >
        {isIndeterminate ? (
          <IconPlaceholder
            hugeicons="MinusSignIcon"
            lucide="Minus"
            tabler="IconMinus"
            phosphor="Minus"
            remixicon="RiSubtractLine"
          />
        ) : (
          <IconPlaceholder
            hugeicons="Tick02Icon"
            lucide="Check"
            tabler="IconCheck"
            phosphor="Check"
            remixicon="RiCheckLine"
          />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
