import { z } from "zod";
import { CURRENT_BUILDER_DOCUMENT_SCHEMA_VERSION } from "./migrations";

const JsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([JsonPrimitiveSchema, z.array(JsonValueSchema), JsonObjectSchema]),
);

const JsonObjectSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
  z
    .object({})
    .catchall(JsonValueSchema)
    .superRefine((value, ctx) => {
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) {
        ctx.addIssue({
          code: "custom",
          message: "Expected a plain JSON object.",
        });
      }
    }),
);

type SerializableNamedLeafType =
  | "text"
  | "email"
  | "password"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "checkbox-group"
  | "checkbox"
  | "switch"
  | "radio"
  | "tags"
  | "upload";

type SerializableTabShape = {
  name?: string;
  label: string;
  fields: SerializableFieldShape[];
} & Record<string, unknown>;

type SerializableFieldShape =
  | ({ type: SerializableNamedLeafType; name: string } & Record<string, unknown>)
  | ({
      type: "group" | "array";
      name: string;
      fields: SerializableFieldShape[];
    } & Record<string, unknown>)
  | ({ type: "row"; fields: SerializableFieldShape[] } & Record<string, unknown>)
  | ({
      type: "collapsible";
      label: string;
      fields: SerializableFieldShape[];
    } & Record<string, unknown>)
  | ({ type: "tabs"; tabs: SerializableTabShape[] } & Record<string, unknown>);

function createNamedFieldSchema<const TType extends string>(type: TType) {
  return z
    .object({
      type: z.literal(type),
      name: z.string(),
    })
    .catchall(JsonValueSchema);
}

export const SerializableFieldSchema: z.ZodType<SerializableFieldShape> = z.lazy(() =>
  z.discriminatedUnion("type", [
    createNamedFieldSchema("text"),
    createNamedFieldSchema("email"),
    createNamedFieldSchema("password"),
    createNamedFieldSchema("textarea"),
    createNamedFieldSchema("number"),
    createNamedFieldSchema("date"),
    createNamedFieldSchema("datetime"),
    createNamedFieldSchema("select"),
    createNamedFieldSchema("checkbox-group"),
    createNamedFieldSchema("checkbox"),
    createNamedFieldSchema("switch"),
    createNamedFieldSchema("radio"),
    createNamedFieldSchema("tags"),
    createNamedFieldSchema("upload"),
    z
      .object({
        type: z.literal("group"),
        name: z.string(),
        fields: z.array(SerializableFieldSchema),
      })
      .catchall(JsonValueSchema),
    z
      .object({
        type: z.literal("array"),
        name: z.string(),
        fields: z.array(SerializableFieldSchema),
      })
      .catchall(JsonValueSchema),
    z
      .object({
        type: z.literal("row"),
        fields: z.array(SerializableFieldSchema),
      })
      .catchall(JsonValueSchema),
    z
      .object({
        type: z.literal("collapsible"),
        label: z.string(),
        fields: z.array(SerializableFieldSchema),
      })
      .catchall(JsonValueSchema),
    z
      .object({
        type: z.literal("tabs"),
        tabs: z.array(
          z
            .object({
              name: z.string().optional(),
              label: z.string(),
              fields: z.array(SerializableFieldSchema),
            })
            .catchall(JsonValueSchema),
        ),
      })
      .catchall(JsonValueSchema),
  ]),
);

export const NodeDocumentSchema = z.object({
  id: z.string().optional(),
  field: SerializableFieldSchema,
  parentId: z.string().nullable(),
  parentSlot: z.string().nullable(),
  children: z.array(z.string()),
  tabChildren: z.record(z.string(), z.array(z.string())).optional(),
});

export const BuilderDocumentSchema = z.object({
  schemaVersion: z.literal(CURRENT_BUILDER_DOCUMENT_SCHEMA_VERSION),
  builderVersion: z.string(),
  formId: z.string(),
  formName: z.string(),
  nodes: z.record(z.string(), NodeDocumentSchema),
  rootIds: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const FormSummarySchema = BuilderDocumentSchema.pick({
  formId: true,
  formName: true,
  schemaVersion: true,
  builderVersion: true,
  createdAt: true,
  updatedAt: true,
});

export type SerializableField = z.infer<typeof SerializableFieldSchema>;
export type BuilderDocumentNode = z.infer<typeof NodeDocumentSchema>;
export type BuilderDocument = z.infer<typeof BuilderDocumentSchema>;
export type FormSummary = z.infer<typeof FormSummarySchema>;
