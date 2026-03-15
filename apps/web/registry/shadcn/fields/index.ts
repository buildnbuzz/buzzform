"use client";

import { TextField } from "./text";
import type { FieldRegistry } from "@buildnbuzz/form-react";

// Default shadcn registry — maps field types to shadcn-styled components.
export const shadcnRegistry: FieldRegistry = {
  text: TextField,
  // number: NumberField,
  // select: SelectField,
  // group: GroupField,
};
