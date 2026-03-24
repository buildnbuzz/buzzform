import { createContext, useContext } from "react";
import type { Field as CoreField } from "@buildnbuzz/form-core";
import type { ComponentType, ReactNode } from "react";

/** Registry mapping field type strings to renderer components. */
export type FieldRegistry = {
  [K in CoreField["type"]]?: ComponentType<{ children?: ReactNode }>;
};

/** React context for globally configured renderer registry. */
export const RegistryContext = createContext<FieldRegistry | null>(null);

/** Reads field renderer registry from the nearest `FormProvider`. */
export function useRegistry(): FieldRegistry {
  const registry = useContext(RegistryContext);
  if (!registry) {
    throw new Error(
      "No field registry found. Wrap with <FormProvider> or pass `registry` directly.",
    );
  }
  return registry;
}

/** Props for global form-react provider configuration. */
export interface FormProviderProps {
  /** Default registry used by `FieldRenderer` and `RenderFields`. */
  registry: FieldRegistry;
  children: ReactNode;
}

/** Provides default field renderer registry to descendants. */
export function FormProvider({ registry, children }: FormProviderProps) {
  return (
    <RegistryContext.Provider value={registry}>
      {children}
    </RegistryContext.Provider>
  );
}
