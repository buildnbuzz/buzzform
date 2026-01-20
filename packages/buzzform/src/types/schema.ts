import type { z } from "zod";
import type { Field } from "./field";

type ExtractL1<F> = F extends {
  type: "row" | "collapsible";
  fields: infer Nested extends readonly Field[];
}
  ? Nested[number]
  : F extends { type: "tabs"; tabs: readonly (infer T)[] }
  ? T extends { fields: infer TabFields extends readonly Field[] }
  ? TabFields[number]
  : never
  : F;

type ExtractL2<F> = ExtractL1<ExtractL1<F>>;
type ExtractL3<F> = ExtractL1<ExtractL2<F>>;
type ExtractL4<F> = ExtractL1<ExtractL3<F>>;

type FlattenedFields<F> = ExtractL4<F>;

type MakeOptional<T extends z.ZodTypeAny, F extends Field> = F extends {
  required: true;
}
  ? T
  : z.ZodOptional<T>;

type InnerFieldsShape<T extends readonly Field[]> = {
  [K in FlattenedFields<T[number]> as K extends { name: infer N extends string } ? N : never]:
  K extends Field ? InnerFieldToZod<K> : never;
};

type InnerFieldToZod<F extends Field> = MakeOptional<InnerBaseFieldType<F>, F>;

type InnerBaseFieldType<F extends Field> =
  F extends { schema: infer S extends z.ZodTypeAny }
  ? S
  : F extends { type: "text" }
  ? z.ZodString
  : F extends { type: "email" }
  ? z.ZodString
  : F extends { type: "password" }
  ? z.ZodString
  : F extends { type: "textarea" }
  ? z.ZodString
  : F extends { type: "number" }
  ? z.ZodNumber
  : F extends { type: "date" }
  ? z.ZodDate
  : F extends { type: "datetime" }
  ? z.ZodDate
  : F extends { type: "checkbox" }
  ? z.ZodBoolean
  : F extends { type: "switch" }
  ? z.ZodBoolean
  : F extends { type: "select"; hasMany: true }
  ? z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>
  : F extends { type: "select" }
  ? z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>
  : F extends { type: "radio" }
  ? z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>
  : F extends { type: "tags" }
  ? z.ZodArray<z.ZodString>
  : F extends { type: "upload"; hasMany: true }
  ? z.ZodArray<z.ZodUnion<[z.ZodType<File>, z.ZodString]>>
  : F extends { type: "upload" }
  ? z.ZodUnion<[z.ZodType<File>, z.ZodString]>
  : F extends { type: "group"; fields: infer Nested extends readonly Field[] }
  ? z.ZodObject<InnerFieldsShape<Nested>>
  : F extends { type: "array"; fields: infer Nested extends readonly Field[] }
  ? z.ZodArray<z.ZodObject<InnerFieldsShape<Nested>>>
  : z.ZodTypeAny;

export type FieldToZod<F extends Field> = MakeOptional<InnerBaseFieldType<F>, F>;

export type FieldsToShape<T extends readonly Field[]> = InnerFieldsShape<T>;

export type SchemaBuilder<TField extends Field = Field> = (
  field: TField,
) => z.ZodTypeAny;

export type SchemaBuilderMap = {
  [K in Field["type"]]?: SchemaBuilder<Extract<Field, { type: K }>>;
};

/**
 * Infer the TypeScript type from a BuzzForm schema.
 */
export type InferType<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * @deprecated Use `InferType` instead. This will be removed in a future version.
 */
export type InferSchema<T extends z.ZodTypeAny> = InferType<T>;
