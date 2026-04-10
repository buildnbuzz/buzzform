import { useState, useEffect, useMemo, useRef } from "react";
import type {
  OptionsConfig,
  NormalizedOption,
  FieldOption,
} from "@buildnbuzz/form-core";
import { resolveOptions } from "@buildnbuzz/form-core";
import { useDataFieldContext } from "../field-context";
import { useDependenciesSelector } from "./use-dependencies-selector";

/**
 * Module-level promise cache for request deduplication.
 * Keys are JSON-serialized resolver configs, values are in-flight promises.
 * Entries are removed when promises settle.
 */
const pendingRequests = new Map<string, Promise<Array<FieldOption | string>>>();

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
 * Automatically clears the field value when:
 * - Dependencies change (cascading dropdowns)
 * - Options fail to load (API errors)
 * - Current value is no longer in the enabled options list
 *
 * @param rawOptions The OptionsConfig defined on the field schema.
 */
export function useFieldOptions(
  rawOptions: OptionsConfig = [],
): FieldOptionsState {
  const { form, field, fieldApi, formData, contextData, optionResolvers } =
    useDataFieldContext();

  const isStatic = Array.isArray(rawOptions);

  // 0. Stabilize inputs that might change reference on every render
  // FieldRenderer often returns a new shallow copy of the field, so we must
  // stabilize rawOptions if it's an object/resolver.
  const stableRawOptions = useMemo(() => {
    return rawOptions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rawOptions)]);

  const stableContextData = useMemo(() => {
    return contextData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(contextData)]);

  // 1. Manage fetching state for dynamic options.
  const [dynamicState, setDynamicState] = useState<{
    options: Array<FieldOption | string>;
    isLoading: boolean;
    error?: Error;
  }>(() => ({
    options: [],
    isLoading: !isStatic,
  }));

  // Track explicit dependencies for re-fetching dynamic options.
  const explicitDeps = useMemo(() => {
    return "dependencies" in field && Array.isArray(field.dependencies)
      ? (field.dependencies as string[])
      : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify("dependencies" in field ? field.dependencies : [])]);

  const depsSelector = useDependenciesSelector(explicitDeps);
  const rawDepValues = depsSelector(form.store.state);

  // Stabilize depValues to prevent reference changes from triggering the effect
  const stableDepValues = useMemo(() => {
    return rawDepValues;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rawDepValues)]);

  // 2. Resolve final Options (evaluating VisibilityConditions)
  const resolvedOptions = useMemo(() => {
    const source = isStatic
      ? (stableRawOptions as Array<FieldOption | string>)
      : dynamicState.options;
    return resolveOptions(source, formData, stableContextData ?? {});
  }, [isStatic, stableRawOptions, dynamicState.options, formData, stableContextData]);

  // 2.5. Effect: Clear field value when dependencies change
  // This prevents stale values from being used when parent fields change
  const prevDepValuesRef = useRef<unknown[]>(stableDepValues);
  useEffect(() => {
    const depValuesChanged =
      explicitDeps.length > 0 &&
      JSON.stringify(stableDepValues) !== JSON.stringify(prevDepValuesRef.current);

    if (depValuesChanged && !isStatic) {
      // Clear this field's value since its options will change
      fieldApi.handleChange(undefined);
    }
    prevDepValuesRef.current = stableDepValues;
  }, [stableDepValues, isStatic, explicitDeps.length, fieldApi]);

  // 3. Effect: Fetch Dynamic Options
  // Triggered ONLY by stable dependency values or schema changes.
  useEffect(() => {
    if (isStatic) return;

    let isCancelled = false;

    // Build a cache key for deduplication
    const cacheKey = JSON.stringify({
      type: typeof stableRawOptions === "function" ? "inline" : "resolver",
      resolver:
        typeof stableRawOptions === "object" &&
        stableRawOptions !== null &&
        "resolver" in stableRawOptions
          ? stableRawOptions.resolver
          : undefined,
      args:
        typeof stableRawOptions === "object" &&
        stableRawOptions !== null &&
        "args" in stableRawOptions
          ? stableRawOptions.args
          : undefined,
      deps: stableDepValues,
    });

    const resolveDynamic = async () => {
      // Use a functional update to avoid capturing dynamicState in effect closure
      setDynamicState((prev) => {
        if (prev.isLoading) return prev;
        return { ...prev, isLoading: true, error: undefined };
      });

      try {
        const resolverContext = {
          data: form.store.state.values as Record<string, unknown>,
          context: stableContextData as Record<string, unknown> | undefined,
        };

        // Check for existing in-flight request
        let requestPromise = pendingRequests.get(cacheKey);

        if (!requestPromise) {
          // Create and cache the new request
          requestPromise = (async () => {
            if (typeof stableRawOptions === "function") {
              return stableRawOptions(resolverContext);
            }
            if (
              typeof stableRawOptions === "object" &&
              stableRawOptions !== null &&
              "resolver" in stableRawOptions
            ) {
              const resolverKey = stableRawOptions.resolver;
              const resolverFn = optionResolvers?.[resolverKey];

              if (!resolverFn) {
                throw new Error(
                  `Option resolver '${resolverKey}' not found in registry.`,
                );
              }

              return resolverFn(
                resolverContext,
                stableRawOptions.args as Record<string, unknown> | undefined,
              );
            }
            return [];
          })();

          pendingRequests.set(cacheKey, requestPromise);
        }

        const resultPath = await requestPromise;

        if (isCancelled) return;

        setDynamicState({
          options: resultPath,
          isLoading: false,
        });
      } catch (err) {
        if (isCancelled) return;
        setDynamicState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
        // Clear field value when options fail to load, as the current value may be invalid
        fieldApi.handleChange(undefined);
      } finally {
        // Always clean up cache entry when this effect is done with the request
        pendingRequests.delete(cacheKey);
      }
    };

    void resolveDynamic();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStatic, stableRawOptions, optionResolvers, stableContextData, stableDepValues]);

  // 4. Effect: Clear invalid value when current value is not in enabled options
  const lastResolvedOptionsRef = useRef<NormalizedOption[]>([]);

  useEffect(() => {
    if (dynamicState.isLoading && !isStatic) return;

    // Check if options actually changed to avoid loop with handleChange
    const optionsChanged =
      JSON.stringify(resolvedOptions) !==
      JSON.stringify(lastResolvedOptionsRef.current);
    if (!optionsChanged) return;
    lastResolvedOptionsRef.current = resolvedOptions;

    const enabledValues = new Set(
      resolvedOptions.filter((opt) => !opt.disabled).map((opt) => opt.value),
    );

    const isMany =
      typeof field === "object" &&
      field !== null &&
      "hasMany" in field &&
      (field as { hasMany?: boolean }).hasMany === true;

    const value = fieldApi.state.value as unknown;

    if (isMany) {
      const current = Array.isArray(value) ? (value as unknown[]) : [];
      const next = current.filter(
        (v): v is string => typeof v === "string" && enabledValues.has(v),
      );

      const changed =
        current.length !== next.length ||
        next.some((v, i) => !Object.is(v, current[i]));

      if (changed) fieldApi.handleChange(next);
      return;
    }

    if (value == null || value === "") return;

    if (!enabledValues.has(String(value))) {
      fieldApi.handleChange(undefined);
    }
  }, [
    resolvedOptions,
    dynamicState.isLoading,
    isStatic,
    fieldApi,
    field,
  ]);

  return {
    options: resolvedOptions,
    isLoading: isStatic ? false : dynamicState.isLoading,
    error: dynamicState.error,
  };
}
