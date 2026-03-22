import type { FormSchema } from "@buildnbuzz/form-core";
import type { UseFormOptionsWithSchema } from "../src/types";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : false;

type Assert<T extends true> = T;

type FormData = { name: string; age?: number };
type Options = UseFormOptionsWithSchema<FormSchema, FormData>;
type SubmitValue = Parameters<NonNullable<Options["onSubmit"]>>[0]["value"];

type _SubmitValue = Assert<Equal<SubmitValue, FormData>>;
type _DefaultValues = Assert<
  Equal<Options["defaultValues"], Partial<FormData> | undefined>
>;

const _assertions = [true as _SubmitValue, true as _DefaultValues];
void _assertions;
