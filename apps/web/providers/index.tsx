"use client";

import * as React from "react";
import { ThemeProvider } from "./theme";
import { RootProvider } from "fumadocs-ui/provider/next";
import { BuzzFormProvider } from "./buzz-form";
import { FormProvider } from "@buildnbuzz/form-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { registry } from "@/registry/shadcn/registry";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RootProvider
        theme={{
          enabled: false,
        }}
      >
        <TooltipProvider>
          <BuzzFormProvider>
            <FormProvider registries={{ fields: registry }} derivedValidationMode="blur">
              {children}
            </FormProvider>
          </BuzzFormProvider>
        </TooltipProvider>
      </RootProvider>
    </ThemeProvider>
  );
}
