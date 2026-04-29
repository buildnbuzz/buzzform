"use client";

import React from "react";
import type { FieldInputProps } from "@buildnbuzz/buzzform";
import type { ExpressionGroup } from "@buildnbuzz/form-builder-core";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconPlaceholder } from "@/components/icon-placeholder";
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
export function ExpressionCheckbox({
  field,
  value,
  onChange,
  disabled,
}: FieldInputProps<ExpressionValue>) {
  const isExpression = isExpressionGroup(value);
  const boolValue = isExpression ? false : (value as boolean | undefined) ?? false;
  const fieldType = (field as { type?: string }).type;

  const handleSave = (group: ExpressionGroup) => {
    onChange(group);
  };

  const handleClear = () => {
    onChange(false);
  };

  if (isExpression) {
    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <Badge
          variant="secondary"
          className="gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <IconPlaceholder
            lucide="Zap"
            hugeicons="LightningIcon"
            tabler="IconBolt"
            phosphor="Lightning"
            remixicon="RiFlashlightLine"
            size={12}
          />
          Expression active
        </Badge>

        <div className="flex items-center gap-1">
          <ExpressionBuilder
            initialValue={value as ExpressionGroup}
            onSave={handleSave}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <IconPlaceholder
                  lucide="Pencil"
                  hugeicons="PencilEdit01Icon"
                  tabler="IconPencil"
                  phosphor="PencilSimple"
                  remixicon="RiPencilLine"
                  size={14}
                />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={handleClear}
            disabled={disabled}
          >
            <IconPlaceholder
              lucide="X"
              hugeicons="Cancel01Icon"
              tabler="IconX"
              phosphor="X"
              remixicon="RiCloseLine"
              size={14}
            />
          </Button>
        </div>
      </div>
    );
  }

  // Static mode
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      {fieldType === "switch" ? (
        <Switch
          checked={boolValue}
          onCheckedChange={(checked) => onChange(checked)}
          disabled={disabled}
          size="sm"
        />
      ) : (
        <Checkbox
          checked={boolValue}
          onCheckedChange={(checked) => onChange(!!checked)}
          disabled={disabled}
        />
      )}

      <ExpressionBuilder
        initialValue={undefined}
        onSave={handleSave}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 text-muted-foreground/50 hover:text-amber-500 transition-colors"
            disabled={disabled}
          >
            <IconPlaceholder
              lucide="Zap"
              hugeicons="LightningIcon"
              tabler="IconBolt"
              phosphor="Lightning"
              remixicon="RiFlashlightLine"
              size={14}
            />
          </Button>
        }
      />
    </div>
  );
}
