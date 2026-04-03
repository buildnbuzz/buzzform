import { createContext, useContext } from "react";
import type { Field as CoreField, ValidationRun } from "@buildnbuzz/form-core";
import type { ComponentType, ReactNode } from "react";

/** Registry mapping field type strings to renderer components. */
export type FieldRegistry = {
  [K in CoreField["type"]]?: ComponentType<{ children?: ReactNode }>;
};

/** Global form configuration context value. */
export interface FormConfig {
  /** Default registry used by `FieldRenderer` and `RenderFields`. */
  registry: FieldRegistry;
  /** Default validation run for derived field checks. Defaults to `submit`. */
  derivedValidationMode?: ValidationRun;
}

/** React context for globally configured form settings. */
export const FormConfigContext = createContext<FormConfig | null>(null);

/** @deprecated Use useFormConfig().registry or wrap with <FormProvider> */
export const RegistryContext = FormConfigContext;

/** Reads global form configuration from the nearest `FormProvider`. */
export function useFormConfig(): FormConfig {
  const config = useContext(FormConfigContext);
  if (!config) {
    throw new Error(
      "No form configuration found. Wrap with <FormProvider> or pass `registry` directly.",
    );
  }
  return config;
}

/** Reads field renderer registry from the nearest `FormProvider`. */
export function useRegistry(): FieldRegistry {
  return useFormConfig().registry;
}

/** Props for global form-react provider configuration. */
export interface FormProviderProps extends Partial<FormConfig> {
  /** Registry is required unless provided via another FormProvider. */
  registry: FieldRegistry;
  children: ReactNode;
}

/** Provides default form configuration to descendants. */
export function FormProvider({
  registry,
  derivedValidationMode,
  children,
}: FormProviderProps) {
  return (
    <FormConfigContext.Provider value={{ registry, derivedValidationMode }}>
      {children}
    </FormConfigContext.Provider>
  );
}
