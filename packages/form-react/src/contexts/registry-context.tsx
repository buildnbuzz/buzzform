import { createContext, useContext } from "react";
import type {
  Field as CoreField,
  ValidationRun,
  FormRegistries,
} from "@buildnbuzz/form-core";
import type { ComponentType, ReactNode } from "react";

/** Registry mapping field type strings to renderer components. */
export type FieldRegistry = {
  [K in CoreField["type"]]?: ComponentType<{ children?: ReactNode }>;
};

/** Global form configuration context value. */
export interface FormConfig {
  /** @deprecated Use `registries.fields` instead. */
  registry: FieldRegistry;
  /** Global runtime registries (validators, resolvers, fns, fields). */
  registries?: FormRegistries;
  /** Default validation run for derived field checks. Defaults to `submit`. */
  derivedValidationMode?: ValidationRun;
}

/** React context for globally configured form settings. */
export const FormConfigContext = createContext<FormConfig | null>(null);

/** Default configuration used when no FormProvider is present. */
export const defaultFormConfig: FormConfig = {
  registry: {},
};

/** @deprecated Use useFormConfig().registry or wrap with <FormProvider> */
export const RegistryContext = FormConfigContext;

/** Reads global form configuration from the nearest `FormProvider`. */
export function useFormConfig(): FormConfig {
  const config = useContext(FormConfigContext);
  return config ?? defaultFormConfig;
}

/** Reads field renderer registry from the nearest `FormProvider`. */
export function useRegistry(): FieldRegistry {
  const config = useFormConfig();
  return (config.registries?.fields as FieldRegistry | undefined) ?? config.registry;
}

/** Props for global form-react provider configuration. */
export interface FormProviderProps extends Partial<FormConfig> {
  /** @deprecated Use `registries.fields` instead. */
  registry?: FieldRegistry;
  children: ReactNode;
}

/** Provides default form configuration to descendants. */
export function FormProvider({
  registry,
  registries,
  derivedValidationMode,
  children,
}: FormProviderProps) {
  // Normalize deprecated `registry` into `registries.fields`.
  // Prop-level `registries.fields` takes precedence over `registry`.
  const normalizedRegistries: FormRegistries | undefined =
    registry || registries
      ? {
          ...registries,
          fields: (registries?.fields ?? registry) as FormRegistries["fields"],
        }
      : undefined;

  return (
    <FormConfigContext.Provider
      value={{
        registry: registry ?? {},
        registries: normalizedRegistries,
        derivedValidationMode,
      }}
    >
      {children}
    </FormConfigContext.Provider>
  );
}
