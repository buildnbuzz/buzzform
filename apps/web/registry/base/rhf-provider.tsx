"use client";

import { FormProvider } from "@buildnbuzz/buzzform";
import { useRhf } from "@buildnbuzz/buzzform/rhf";
import { zodResolver } from "@buildnbuzz/buzzform/zod";

export const BuzzFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FormProvider adapter={useRhf} resolver={zodResolver} mode="onBlur">
      {children}
    </FormProvider>
  );
};
