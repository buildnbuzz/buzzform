import {
  type ReactNode,
} from "react";
import {
  defineSchema,
  isDataField,
  isContainerType,
  walkFields,
  toDotNotation,
  fromDotNotation,
  resolveDynamicValue,
  evaluateVisibility,
  defineValidators,
  builtInValidators,
  extractDefaults,
  flattenToPathKeys,
  expandPathKeys,
  transformFormOutput,
  resolveOptions,
  clampNumber,
  applyNumericPrecision,
  formatNumberWithSeparator,
  parseFormattedNumber,
} from "@buildnbuzz/form-core";

export {
  defineSchema,
  isDataField,
  isContainerType,
  walkFields,
  toDotNotation,
  fromDotNotation,
  resolveDynamicValue,
  evaluateVisibility,
  defineValidators,
  builtInValidators,
  extractDefaults,
  flattenToPathKeys,
  expandPathKeys,
  transformFormOutput,
  resolveOptions,
  clampNumber,
  applyNumericPrecision,
  formatNumberWithSeparator,
  parseFormattedNumber,
};

// --- Core Types ---
export type {
  InferType,
  FormSchema,
  Field as CoreField,
  DataField,
  LayoutField,
  FieldOption,
  ArrayFieldDef,
  GroupField,
  TextField,
  SelectField,
  PasswordField,
  DateField,
  CheckboxField,
  CheckboxGroupField,
  EmailField,
  NumberField,
  RadioField,
  RowField,
  SwitchField,
  TabsField,
  Tab,
  TagsField,
  TextareaField,
  TristateCheckboxField,
  CollapsibleField,
  DynamicText,
  DynamicString,
  DynamicBoolean,
  VisibilityCondition,
  ValidationRegistry,
  ValidationFunction,
  ValidationContext,
  ValidationRun,
  ValidationResult,
  NormalizedOption,
  OptionsConfig,
} from "@buildnbuzz/form-core";

export { useForm } from "./use-form";
export { Field } from "./field";
export { Form } from "./form";
export { FieldRenderer, RenderFields } from "./renderer";
export {
  FieldContext,
  FormProvider,
  RegistryContext,
  FormConfigContext,
  useFormConfig,
  useDataFieldContext,
  useFieldA11yIds,
  useFieldApi,
  useFieldContext,
  useFieldErrorState,
  useFormContext,
  useDataField,
  useFieldOptions,
  useLayoutField,
  useNestedErrorCount,
  useRegistry,
  useResolvedFieldText,
} from "./contexts";

export type { FieldRendererProps, RenderFieldsProps } from "./renderer";
export type { LayoutFieldProps } from "./field";
export type { FormProps } from "./form";
export type {
  AnyReactFormExtendedApi,
  AnyFieldValidators,
  AnyTanstackFormOptions,
  FieldFormApi,
  FieldProps,
  UnknownData,
  UseFormOptions,
  UseFormOptionsWithSchema,
} from "./types";
export type {
  DataFieldContextValue,
  DataFieldState,
  DataFieldOptions,
  FieldA11yIds,
  FieldA11yIdsOptions,
  FieldContextValue,
  FieldErrorItem,
  FieldErrorState,
  FieldErrorStateOptions,
  FieldRegistry,
  FormProviderProps,
  FormConfig,
  LayoutFieldState,
  LayoutFieldOptions,
  FieldOptionsState,
  ResolvedFieldTextOptions,
} from "./contexts";

declare module "@buildnbuzz/form-core" {
  interface FrameworkOverrides {
    react: ReactNode;
  }
}
