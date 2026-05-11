import type { UnknownData } from "@buildnbuzz/form-core";
import { z } from "zod";

// ---------------------------------------------------------------------------
// JSON primitive helpers (used by the legacy backup validator)
// ---------------------------------------------------------------------------

const JsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([JsonPrimitiveSchema, z.array(JsonValueSchema), JsonObjectSchema]),
);

const JsonObjectSchema: z.ZodType<UnknownData> = z.lazy(() =>
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

// ---------------------------------------------------------------------------
// Serializable field shapes (legacy backup import)
// ---------------------------------------------------------------------------

type SerializableTabShape = {
  name?: string;
  label: string;
  fields: SerializableFieldShape[];
} & UnknownData;

type SerializableFieldShape =
  | ({ type: string; name: string } & UnknownData)
  | ({
      type: "group" | "array";
      name: string;
      fields: SerializableFieldShape[];
    } & UnknownData)
  | ({ type: "row"; fields: SerializableFieldShape[] } & UnknownData)
  | ({
      type: "collapsible";
      label: string;
      fields: SerializableFieldShape[];
    } & UnknownData)
  | ({ type: "tabs"; tabs: SerializableTabShape[] } & UnknownData);

function createNamedFieldSchema<const TType extends string>(type: TType) {
  return z
    .object({
      type: z.literal(type),
      name: z.string(),
    })
    .catchall(JsonValueSchema);
}

export const SerializableFieldSchema: z.ZodType<SerializableFieldShape> =
  z.lazy(() =>
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

// ---------------------------------------------------------------------------
// Legacy builder backup schema (old format)
// ---------------------------------------------------------------------------

export const LegacyBackupSchema = z.object({
  schemaVersion: z.number().optional(),
  builderVersion: z.string().optional(),
  formId: z.string().optional(),
  formName: z.string().optional(),
  outputConfig: z.unknown().optional(),
  nodes: z.record(z.string(), z.unknown()),
  rootIds: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// FormSchema shape validator (modern format)
// ---------------------------------------------------------------------------

export const FormSchemaShapeSchema = z.object({
  fields: z.array(z.unknown()),
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  validate: z.unknown().optional(),
  output: z.unknown().optional(),
  meta: z.unknown().optional(),
});

export type SerializableField = z.infer<typeof SerializableFieldSchema>;
export type LegacyBackupDocument = z.infer<typeof LegacyBackupSchema>;
export type FormSchemaShape = z.infer<typeof FormSchemaShapeSchema>;
