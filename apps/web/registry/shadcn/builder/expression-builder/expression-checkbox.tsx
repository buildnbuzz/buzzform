"use client";

import React from "react";
import { useDataField } from "@buildnbuzz/form-react";
import type { ExpressionGroup } from "@buildnbuzz/form-builder-core";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { IconPlaceholder } from "@/components/icon-placeholder";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { ExpressionBuilder } from "./index";

type ExpressionValue = boolean | undefined | ExpressionGroup;

function isExpressionGroup(value: unknown): value is ExpressionGroup {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as ExpressionGroup).type === "group"
  );
}

/**
 * Dual-mode property widget for boolean/expression fields.
 *
 * - Static mode: renders a Checkbox or Switch (per `field.type`) with a ⚡ button.
 * - Expression mode: renders an "Expression active" badge with Edit and Clear buttons.
 *
 * Toggling ⚡ opens the ExpressionBuilder dialog. Saving stores an ExpressionGroup.
 * Clearing reverts to `false` (static boolean).
 */
export function ExpressionCheckbox() {
  const {
    field,
    fieldApi,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleBlur,
    handleChange,
  } = useDataField();

  const value = fieldApi.state.value as ExpressionValue;
  const disabled = isDisabled || isReadOnly;
  const isExpression = isExpressionGroup(value);
  const boolValue = isExpression ? false : ((value as boolean | undefined) ?? false);
  const fieldType = (field as { type?: string }).type;
  
  const ui = (
    field as {
      ui?: {
        alignment?: "start" | "end" | "between";
        autoFocus?: boolean;
        className?: string;
        expressionMode?: "default" | "only" | "none";
      };
    }
  ).ui;
  const alignment = ui?.alignment ?? "between";
  const expressionMode = ui?.expressionMode ?? "default";

  const handleSave = (group: ExpressionGroup) => handleChange(group);
  const handleClear = () => handleChange(expressionMode === "only" ? undefined : false);

  // 1. The active expression node (replaces the input)
  const activeControlNode = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-500",
        fieldType === "switch" ? "h-5 w-9 rounded-full" : "h-4 w-4 mt-0.5 rounded-sm"
      )}
    >
      <IconPlaceholder
        lucide="Zap"
        hugeicons="Lightning"
        tabler="IconBolt"
        phosphor="Lightning"
        remixicon="RiFlashlightLine"
        size={fieldType === "switch" ? 12 : 10}
        className="fill-amber-500/20"
      />
    </div>
  );

  const expressionBar = isExpression ? (
    <div className="mt-2 flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-1 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-500">
        <IconPlaceholder
          lucide="Zap"
          hugeicons="Lightning"
          tabler="IconBolt"
          phosphor="Lightning"
          remixicon="RiFlashlightLine"
          size={14}
          className="fill-amber-500/20"
        />
        Dynamic Expression
      </div>
      <div className="flex items-center gap-0.5">
        <ExpressionBuilder
          initialValue={value as ExpressionGroup}
          onSave={handleSave}
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 text-amber-600/70 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-500/70 dark:hover:text-amber-500"
            >
              <IconPlaceholder
                lucide="Pencil"
                hugeicons="PencilEdit01Icon"
                tabler="IconPencil"
                phosphor="PencilSimple"
                remixicon="RiPencilLine"
                size={12}
              />
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-6 w-6 text-amber-600/70 hover:bg-destructive/10 hover:text-destructive dark:text-amber-500/70 dark:hover:text-destructive"
          onClick={handleClear}
          disabled={disabled}
        >
          <IconPlaceholder
            lucide="X"
            hugeicons="Cancel01Icon"
            tabler="IconX"
            phosphor="X"
            remixicon="RiCloseLine"
            size={12}
          />
        </Button>
      </div>
    </div>
  ) : expressionMode === "only" && !isExpression ? (
    <div className="mt-2">
      <ExpressionBuilder
        initialValue={undefined}
        onSave={handleSave}
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-full gap-1.5 border-dashed text-xs text-muted-foreground hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-500"
          >
            <IconPlaceholder
              lucide="Zap"
              hugeicons="Lightning"
              tabler="IconBolt"
              phosphor="Lightning"
              remixicon="RiFlashlightLine"
              size={14}
            />
            Set Expression
          </Button>
        }
      />
    </div>
  ) : null;

  // 2. The static control node
  const switchNode = (
    <Switch
      id={fieldApi.name}
      checked={boolValue}
      onCheckedChange={(checked) => {
        handleChange(checked);
        handleBlur();
      }}
      disabled={disabled}
      aria-invalid={isInvalid}
      aria-describedby={ariaDescribedBy}
      aria-readonly={isReadOnly}
      autoFocus={ui?.autoFocus}
      size="sm"
    />
  );

  const checkboxNode = (
    <Checkbox
      id={fieldApi.name}
      checked={boolValue}
      onCheckedChange={(checked) => {
        handleChange(!!checked);
        handleBlur();
      }}
      disabled={disabled}
      aria-invalid={isInvalid}
      aria-describedby={ariaDescribedBy}
      aria-readonly={isReadOnly}
      autoFocus={ui?.autoFocus}
    />
  );

  const emptyControlNode = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center text-muted-foreground/30",
        fieldType === "switch" ? "h-5 w-9" : "h-4 w-4 mt-0.5"
      )}
    >
      <IconPlaceholder
        lucide="Zap"
        hugeicons="Lightning"
        tabler="IconBolt"
        phosphor="Lightning"
        remixicon="RiFlashlightLine"
        size={fieldType === "switch" ? 12 : 10}
      />
    </div>
  );

  const controlNode = isExpression
    ? activeControlNode
    : expressionMode === "only"
      ? emptyControlNode
      : fieldType === "switch"
        ? switchNode
        : checkboxNode;

  // 3. The content element (label, description, error, expression bar)
  const isSwitchBetween = fieldType === "switch" && alignment === "between";
  const contentElement = (
    <FieldContent className={isSwitchBetween ? "flex-1" : undefined}>
      {label && (
        <FieldLabel
          htmlFor={fieldApi.name}
          className={cn(
            "cursor-pointer m-0 font-normal",
            isSwitchBetween ? "flex-none gap-1 items-baseline" : "inline"
          )}
        >
          {isSwitchBetween && isRequired && <span className="text-destructive">*</span>}
          {label}
          {!isSwitchBetween && isRequired && <span className="text-destructive">&nbsp;*</span>}
        </FieldLabel>
      )}
      {description && !isInvalid && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {isInvalid && <FieldError id={errorId} errors={errors} />}
      {expressionBar}
    </FieldContent>
  );

  // 4. Assemble the layout
  return (
    <FieldGroup data-field={fieldApi.name} className={cn("group/expr", ui?.className)}>
      <div className="flex items-start gap-2 w-full">
        <Field
          orientation="horizontal"
          className={cn("flex-1", isSwitchBetween && "w-full justify-between")}
          data-invalid={isInvalid}
          data-disabled={disabled}
        >
          {fieldType === "switch" ? (
            alignment === "start" ? (
              <>
                {controlNode}
                {contentElement}
              </>
            ) : (
              <>
                {contentElement}
                {controlNode}
              </>
            )
          ) : (
            // Default Checkbox layout
            <>
              {controlNode}
              {contentElement}
            </>
          )}
        </Field>

        {/* Lightning bolt trigger (only visible when static mode and default mode) */}
        {!isExpression && expressionMode === "default" && (
          <ExpressionBuilder
            initialValue={undefined}
            onSave={handleSave}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 shrink-0 opacity-0 transition-all hover:bg-amber-500/10 hover:text-amber-500 focus-visible:opacity-100 group-hover/expr:opacity-100 dark:text-muted-foreground"
                disabled={disabled}
              >
                <IconPlaceholder
                  lucide="Zap"
                  hugeicons="Lightning"
                  tabler="IconBolt"
                  phosphor="Lightning"
                  remixicon="RiFlashlightLine"
                  size={14}
                />
              </Button>
            }
          />
        )}
      </div>
    </FieldGroup>
  );
}
