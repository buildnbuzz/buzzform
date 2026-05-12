"use client";

import type { StoreApi } from "zustand";
import {
  type ExpressionRule,
  type ExpressionOperator,
  EXPRESSION_OPERATORS,
  getFieldTypeCategory,
  getOperatorsForFieldType,
} from "@buildnbuzz/form-builder-core";
import {
  useAvailableFields,
  type ExpressionStoreState,
} from "@buildnbuzz/form-builder-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconPlaceholder } from "@/components/icon-placeholder";

interface ExpressionRuleItemProps {
  rule: ExpressionRule;
  parentId: string;
  store: StoreApi<ExpressionStoreState>;
}

export function ExpressionRuleItem({
  rule,
  parentId,
  store,
}: ExpressionRuleItemProps) {
  const availableFields = useAvailableFields();

  const selectedField = availableFields.find((f) => f.id === rule.fieldId);
  const fieldCategory = getFieldTypeCategory(selectedField?.type);
  const applicableOperators = getOperatorsForFieldType(selectedField?.type);

  const selectedOperator = EXPRESSION_OPERATORS.find(
    (op) => op.value === rule.operator,
  );
  const requiresValue = selectedOperator?.requiresValue ?? true;

  const selectedValueField = availableFields.find((f) => f.id === rule.value);

  const { updateRule, removeNode, duplicateRule } = store.getState();

  const handleFieldChange = (newFieldId: string) => {
    const newField = availableFields.find((f) => f.id === newFieldId);
    const newCategory = getFieldTypeCategory(newField?.type);
    const newOps = getOperatorsForFieldType(newField?.type);

    // Reset operator if not applicable to new field type
    const currentOpApplicable = newOps.some((op) => op.value === rule.operator);
    const newOperator = currentOpApplicable ? rule.operator : "equals";

    // Reset value for type changes
    let newValue = rule.value;
    if (newCategory === "boolean") {
      newValue = "true";
    } else if (newCategory !== fieldCategory) {
      newValue = "";
    }

    updateRule(parentId, rule.id, {
      fieldId: newFieldId,
      operator: newOperator,
      value: newValue,
      valueType: newCategory === "boolean" ? "custom" : rule.valueType,
    });
  };

  // Render value input based on field type category
  const renderValueInput = () => {
    if (!requiresValue) return null;

    // Field reference mode
    if (rule.valueType !== "custom") {
      return (
        <div className="flex items-center gap-2 w-full sm:flex-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="shrink-0 text-muted-foreground"
                  onClick={() =>
                    updateRule(parentId, rule.id, {
                      valueType: "custom",
                      value: selectedField?.options?.[0]?.value ?? "",
                    })
                  }
                >
                  <IconPlaceholder
                    lucide="Link"
                    hugeicons="LinkSquare02Icon"
                    tabler="IconLink"
                    phosphor="Link"
                    remixicon="RiLinksLine"
                    size={16}
                  />
                </Button>
              }
            />
            <TooltipContent>Use Custom Value</TooltipContent>
          </Tooltip>
          <Select
            value={rule.value}
            onValueChange={(val: unknown) => {
              if (val)
                updateRule(parentId, rule.id, {
                  value: val as string,
                });
            }}
          >
            <SelectTrigger className="w-full h-9!">
              <SelectValue>{selectedValueField?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              align="start"
              sideOffset={4}
            >
              {availableFields
                .filter((f) => f.id !== rule.fieldId)
                .map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    const fieldRefButton = (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              className="shrink-0 text-muted-foreground"
              onClick={() =>
                updateRule(parentId, rule.id, {
                  valueType: "field",
                  value: "",
                })
              }
            >
              <IconPlaceholder
                lucide="Type"
                hugeicons="TextIcon"
                tabler="IconLetterCase"
                phosphor="TextT"
                remixicon="RiText"
                size={16}
              />
            </Button>
          }
        />
        <TooltipContent>Use Field Reference</TooltipContent>
      </Tooltip>
    );

    // Fields with options (boolean, select, radio, checkbox-group): render Select dropdown
    if (selectedField?.options && selectedField.options.length > 0) {
      const matchedOption = selectedField.options.find(
        (o) => o.value === rule.value,
      );
      return (
        <div className="flex items-center gap-2 w-full sm:flex-1">
          {fieldRefButton}
          <Select
            value={rule.value}
            onValueChange={(val: unknown) => {
              if (val) updateRule(parentId, rule.id, { value: val as string });
            }}
          >
            <SelectTrigger className="w-full h-9!">
              <SelectValue>{matchedOption?.label ?? rule.value}</SelectValue>
            </SelectTrigger>
            <SelectContent
              alignItemWithTrigger={false}
              align="start"
              sideOffset={4}
            >
              {selectedField.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Number fields: render number input
    if (fieldCategory === "number") {
      return (
        <div className="flex items-center gap-2 w-full sm:flex-1">
          {fieldRefButton}
          <Input
            type="number"
            placeholder="Enter number..."
            className="h-9 w-full"
            value={rule.value}
            onChange={(e) =>
              updateRule(parentId, rule.id, { value: e.target.value })
            }
          />
        </div>
      );
    }

    // Default: text input
    return (
      <div className="flex items-center gap-2 w-full sm:flex-1">
        {fieldRefButton}
        <Input
          placeholder="Enter value..."
          className="h-9 w-full"
          value={rule.value}
          onChange={(e) =>
            updateRule(parentId, rule.id, { value: e.target.value })
          }
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-card p-2 rounded-lg border shadow-sm transition-all group/rule w-full relative">
      <Select
        value={rule.fieldId}
        onValueChange={(val: unknown) => {
          if (val) handleFieldChange(val as string);
        }}
      >
        <SelectTrigger className="w-full sm:w-50 h-9!">
          <SelectValue>{selectedField?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          align="start"
          sideOffset={4}
        >
          {availableFields.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={rule.operator}
        onValueChange={(val: unknown) => {
          if (val)
            updateRule(parentId, rule.id, {
              operator: val as ExpressionOperator,
            });
        }}
      >
        <SelectTrigger className="w-full sm:w-40 h-9!">
          <SelectValue>{selectedOperator?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          align="start"
          sideOffset={4}
        >
          {applicableOperators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {renderValueInput()}

      <div className="absolute -top-3 right-4 flex items-center bg-card border shadow-sm rounded-md px-1 py-0.5 opacity-0 group-hover/rule:opacity-100 transition-all z-50 scale-95 group-hover/rule:scale-100">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="text-muted-foreground hover:text-primary h-7 w-7"
                onClick={() => duplicateRule(parentId, rule.id)}
              >
                <IconPlaceholder
                  lucide="Copy"
                  hugeicons="Copy01Icon"
                  tabler="IconCopy"
                  phosphor="Copy"
                  remixicon="RiFileCopyLine"
                  size={16}
                />
              </Button>
            }
          />
          <TooltipContent>Duplicate Rule</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-0.5" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-7 w-7"
                onClick={() => removeNode(parentId, rule.id)}
              >
                <IconPlaceholder
                  lucide="Trash2"
                  hugeicons="Delete01Icon"
                  tabler="IconTrash"
                  phosphor="Trash"
                  remixicon="RiDeleteBinLine"
                  size={16}
                />
              </Button>
            }
          />
          <TooltipContent>Delete Rule</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
