import { useState, useEffect } from "react";
import type { OptionsConfig, NormalizedOption, FieldOption } from "@buildnbuzz/form-core";
import { resolveOptions } from "@buildnbuzz/form-core";
import { useFieldContext } from "../field-context";
import { useDependenciesSelector } from "./use-dependencies-selector";

/**
 * Result returned by `useFieldOptions`.
 */
export interface FieldOptionsState {
  /** Resolved, normalized options ready for rendering. */
  options: NormalizedOption[];
  /** Whether options are currently loading from an async source. */
  isLoading: boolean;
  /** Any error encountered during resolution. */
  error?: Error;
}

/**
 * Resolves static or dynamic options for option-bearing fields (select, radio, checkbox group).
 *
 * Call this alongside `useDataField` in field components that render a list of options.
 *
 * @param rawOptions The OptionsConfig defined on the field schema.
 */
export function useFieldOptions(rawOptions: OptionsConfig = []): FieldOptionsState {
  const { form, field, formData, contextData, optionResolvers } = useFieldContext();
  
  // Statically resolve synchronous arrays immediately (no loading state).
  const isStatic = Array.isArray(rawOptions);
  
  const [asyncState, setAsyncState] = useState<{ options: NormalizedOption[]; isLoading: boolean; error?: Error }>(() => ({
    options: isStatic ? resolveOptions(rawOptions, formData, contextData ?? {}) : [],
    isLoading: !isStatic,
  }));

  // We only track specifically declared dependencies for re-fetching dynamic options.
  const explicitDeps = "dependencies" in field && Array.isArray(field.dependencies) ? field.dependencies as string[] : [];
  const depsSelector = useDependenciesSelector(explicitDeps);
  
  // Use TanStack to read the actual extracted dependency values, preventing
  // infinite loops that would happen if we just depended on the full `formData`.
  const depValues = depsSelector(form.store.state);

  useEffect(() => {
    if (isStatic) {
      // Re-resolve static options if the parent field re-rendered
      // (which happens when tracked $data in the static options changes).
      setAsyncState({
        options: resolveOptions(rawOptions, formData, contextData ?? {}),
        isLoading: false,
      });
      return;
    }

    let isCancelled = false;
    
    const resolveDynamic = async () => {
      setAsyncState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      try {
        let resultPath: Array<FieldOption | string>;
        
        const resolverContext = {
          data: form.store.state.values as Record<string, unknown>,
          context: contextData as Record<string, unknown> | undefined,
        };

        if (typeof rawOptions === "function") {
          resultPath = await rawOptions(resolverContext);
        } else if (typeof rawOptions === "object" && rawOptions !== null && "resolver" in rawOptions) {
          const resolverKey = rawOptions.resolver;
          const resolverFn = optionResolvers?.[resolverKey];
          
          if (!resolverFn) {
            throw new Error(`Option resolver '${resolverKey}' not found in registry.`);
          }
          
          resultPath = await resolverFn(resolverContext, rawOptions.args as Record<string, unknown> | undefined);
        } else {
          resultPath = [];
        }

        if (isCancelled) return;

        setAsyncState({
          options: resolveOptions(resultPath, resolverContext.data, resolverContext.context ?? {}),
          isLoading: false,
        });
      } catch (err) {
        if (isCancelled) return;
        setAsyncState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    };

    void resolveDynamic();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStatic, rawOptions, optionResolvers, contextData, form.store, ...depValues]);

  // For static arrays, we can return the exact synchronous value instead of the state buffer
  // to prevent one render cycle delay.
  if (isStatic) {
    return {
      options: resolveOptions(rawOptions, formData, contextData ?? {}),
      isLoading: false,
    };
  }

  return asyncState;
}
