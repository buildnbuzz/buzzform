import type { DataField } from "@buildnbuzz/form-core";
import type { ReactNode } from "react";
import type { FieldFormApi, FieldProps } from "../src/types";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : false;

type Assert<T extends true> = T;

type FormData = {
  profile: {
    email: string;
  };
};

type Props = FieldProps<FormData>;
type _ChildrenType = Assert<Equal<Props["children"], ReactNode>>;

const field = { type: "text", name: "email" } as DataField;
const form = {} as FieldFormApi<FormData>;

const props: FieldProps<FormData> = {
  field,
  form,
  children: null,
};

const _assertions = [true as _ChildrenType];
void props;
void _assertions;
