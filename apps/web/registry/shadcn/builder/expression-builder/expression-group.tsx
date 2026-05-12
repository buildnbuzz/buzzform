"use client";

import React from "react";
import type { StoreApi } from "zustand";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type ExpressionGroup } from "@buildnbuzz/form-builder-core";
import { type ExpressionStoreState } from "@buildnbuzz/form-builder-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconPlaceholder } from "@/components/icon-placeholder";
import { SortableItem } from "./sortable-item";
import { ExpressionRuleItem } from "./expression-rule";

interface ExpressionGroupItemProps {
  group: ExpressionGroup;
  parentId?: string;
  isRoot?: boolean;
  store: StoreApi<ExpressionStoreState>;
}

export function ExpressionGroupItem({
  group,
  parentId,
  isRoot = false,
  store,
}: ExpressionGroupItemProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const {
    updateGroupOperator,
    removeNode,
    addRule,
    addGroup,
    duplicateGroup,
  } = store.getState();

  const headerContent = (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center gap-2 p-1.5 transition-all relative",
        isRoot
          ? "rounded-xl"
          : cn(
              "bg-muted/50 cursor-pointer group/header hover:bg-muted/80 rounded-t-xl",
              isOpen ? "rounded-b-none" : "rounded-b-xl"
            )
      )}
    >
      {!isRoot && (
        <div className="flex items-center justify-center w-6 h-6 shrink-0 text-muted-foreground mr-1">
          {isOpen ? (
            <IconPlaceholder
              lucide="ChevronDown"
              hugeicons="ArrowDown01Icon"
              tabler="IconChevronDown"
              phosphor="CaretDown"
              remixicon="RiArrowDownSLine"
              size={18}
            />
          ) : (
            <IconPlaceholder
              lucide="ChevronRight"
              hugeicons="ArrowRight01Icon"
              tabler="IconChevronRight"
              phosphor="CaretRight"
              remixicon="RiArrowRightSLine"
              size={18}
            />
          )}
        </div>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <Select
          value={group.logicalOperator}
          onValueChange={(val: unknown) => {
            if (val) updateGroupOperator(group.id, val as "AND" | "OR");
          }}
        >
          <SelectTrigger className="w-26.25 text-xs font-medium bg-muted border-none">
            <SelectValue>
              {group.logicalOperator === "AND" ? "Match ALL" : "Match ANY"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            align="start"
            sideOffset={4}
          >
            <SelectItem value="AND">Match ALL</SelectItem>
            <SelectItem value="OR">Match ANY</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <span className="text-sm font-medium text-muted-foreground">
        {isRoot ? "of the following:" : "Expression Group"}
      </span>

      {!isRoot && parentId && (
        <div
          className="absolute -top-3 right-4 flex items-center bg-card border shadow-sm rounded-md px-1 py-0.5 opacity-0 group-hover/header:opacity-100 transition-all z-30 scale-95 group-hover/header:scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateGroup(parentId, group.id);
                  }}
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
            <TooltipContent>Duplicate Expression Group</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-border mx-0.5" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNode(parentId, group.id);
                  }}
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
            <TooltipContent>Delete Expression Group</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );

  const mainContent =
    group.children.length === 0 ? (
      <Empty className={isRoot ? "h-full min-h-75" : "h-auto py-8"}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconPlaceholder
              lucide="Layers"
              hugeicons="Layers01Icon"
              tabler="IconLayersIntersect"
              phosphor="Stack"
              remixicon="RiStackLine"
            />
          </EmptyMedia>
          <EmptyTitle>No rules added</EmptyTitle>
          <EmptyDescription>
            Click the buttons below to add rules
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <SortableContext
        id={group.id}
        items={group.children.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {group.children.map((child) => (
            <SortableItem key={child.id} id={child.id}>
              {child.type === "group" ? (
                <ExpressionGroupItem
                  group={child}
                  parentId={group.id}
                  store={store}
                />
              ) : (
                <ExpressionRuleItem
                  rule={child}
                  parentId={group.id}
                  store={store}
                />
              )}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    );

  const footerActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => addRule(group.id)}
      >
        <span className="mr-1 flex items-center justify-center">
          <IconPlaceholder
            lucide="Plus"
            hugeicons="PlusSignIcon"
            tabler="IconPlus"
            phosphor="Plus"
            remixicon="RiAddLine"
            size={14}
          />
        </span>
        Add Rule
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => addGroup(group.id)}
      >
        <span className="mr-1 flex items-center justify-center">
          <IconPlaceholder
            lucide="FolderPlus"
            hugeicons="FolderAddIcon"
            tabler="IconFolderPlus"
            phosphor="FolderPlus"
            remixicon="RiFolderAddLine"
            size={14}
          />
        </span>
        Add Group
      </Button>
    </div>
  );

  if (isRoot) {
    return (
      <div className="flex flex-col flex-1 min-h-0 h-full">
        <div className="shrink-0 px-6 pt-0 pb-0">{headerContent}</div>
        <ScrollArea className="flex-1 h-full min-h-0">
          <div className="px-6 pt-4 pb-2">{mainContent}</div>
        </ScrollArea>
        <div className="shrink-0 px-6 pt-2 pb-0">{footerActions}</div>
      </div>
    );
  }

  return (
    <div className="overflow-visible w-full">
      <Card
        size="sm"
        className="gap-0 py-0 data-[size=sm]:py-0 ring-1 ring-border shadow-sm border-none bg-card overflow-visible"
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger
            nativeButton={false}
            render={headerContent}
            className="w-full"
          />
          <CollapsibleContent>
            <CardContent className="pt-2 pb-0">{mainContent}</CardContent>
            <CardFooter className="bg-transparent border-none px-4 py-2">
              {footerActions}
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
