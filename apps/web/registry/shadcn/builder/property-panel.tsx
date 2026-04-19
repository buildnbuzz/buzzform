"use client";

import React from "react";
import { BuilderProperties } from "@buildnbuzz/form-builder-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SelectField, TabsField } from "@buildnbuzz/form-react";

/**
 * Side panel for editing node or global form properties.
 */
export const PropertyPanel = () => {
  return (
    <div className="flex h-full flex-col bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
          Properties
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <BuilderProperties
          render={({ id, schema, data, update }) => (
            <div className="flex flex-col gap-6 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">
                  Target: {id === "form" ? "Settings" : `Node: ${id}`}
                </span>
                <Separator />
              </div>

              {schema.map((prop, propIdx) => {
                const type = prop.type;
                const name = "name" in prop ? prop.name : "";
                const propLabel = "label" in prop ? prop.label : undefined;
                const propDescription =
                  "description" in prop ? prop.description : undefined;

                // Layout indicators (mostly for form settings)
                if (type === "tabs") {
                  const tabsField = prop as TabsField;
                  return (
                    <div
                      key={propIdx}
                      className="border rounded-md p-3 bg-muted/10 space-y-4"
                    >
                      {tabsField.tabs.map((tab, idx) => (
                        <div key={idx} className="space-y-3">
                          <h4 className="text-[10px] font-bold uppercase opacity-40">
                            {typeof tab.label === "string"
                              ? tab.label
                              : `Section ${idx}`}
                          </h4>
                          <div className="space-y-3 border-l-2 pl-3 ml-1">
                            {tab.fields.map((f, fIdx) => {
                              const fName = "name" in f ? f.name : "";
                              if (!fName) return null;
                              return (
                                <div key={fIdx} className="space-y-1.5">
                                  <Label className="text-[10px] opacity-70">
                                    {typeof f.label === "string"
                                      ? f.label
                                      : fName}
                                  </Label>
                                  <Input
                                    className="h-7 text-xs"
                                    value={(data[fName] as string) || ""}
                                    onChange={(e) =>
                                      update({ [fName]: e.target.value })
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (!name) return null;

                return (
                  <div key={name} className="flex flex-col gap-2.5">
                    {propLabel && (
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {typeof propLabel === "string"
                            ? propLabel
                            : "Property"}
                        </Label>
                      </div>
                    )}

                    {(type === "text" || type === "textarea") && (
                      <Input
                        className="h-8 text-xs focus-visible:ring-1"
                        value={(data[name] as string) || ""}
                        onChange={(e) => update({ [name]: e.target.value })}
                      />
                    )}

                    {(type === "checkbox" || type === "switch") && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={name}
                          checked={!!data[name]}
                          onCheckedChange={(checked) =>
                            update({ [name]: checked })
                          }
                        />
                      </div>
                    )}

                    {type === "select" && (
                      <Select
                        value={(data[name] as string) || ""}
                        onValueChange={(val) => update({ [name]: val })}
                      >
                        <SelectTrigger className="h-8 text-xs focus:ring-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray((prop as SelectField).options) &&
                            (
                              (prop as SelectField).options as (
                                | string
                                | { label: unknown; value: string }
                              )[]
                            ).map((opt) => {
                              const rawLabel =
                                typeof opt === "string" ? opt : opt.label;
                              const val =
                                typeof opt === "string" ? opt : opt.value;
                              const displayLabel =
                                typeof rawLabel === "string" ? rawLabel : val;

                              return (
                                <SelectItem
                                  key={val}
                                  value={val}
                                  className="text-xs"
                                >
                                  {displayLabel}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    )}

                    {propDescription && (
                      <p className="text-[10px] leading-relaxed text-muted-foreground/70 italic">
                        {typeof propDescription === "string"
                          ? propDescription
                          : ""}
                      </p>
                    )}
                  </div>
                );
              })}

              {schema.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center opacity-30">
                  <span className="text-[11px]">No properties available</span>
                </div>
              )}
            </div>
          )}
        />
      </ScrollArea>
    </div>
  );
};
