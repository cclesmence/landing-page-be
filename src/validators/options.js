const { z } = require("zod");

const metadataSchema = z.union([z.record(z.any()), z.array(z.any())]).nullable();

const metadataField = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (err) {
      throw new Error("Metadata must be valid JSON");
    }
  }
  return val;
}, metadataSchema);

const optionalString = (max) =>
  z.preprocess((val) => (val === undefined || val === null ? "" : String(val)), z.string().max(max));

const nullableString = (max) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return null;
    return String(val);
  }, z.string().max(max).nullable());

const booleanField = z.preprocess((val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return Boolean(val);
  if (typeof val === "string") {
    const lowered = val.toLowerCase().trim();
    if (["1", "true", "yes", "on"].includes(lowered)) return true;
    if (["0", "false", "no", "off"].includes(lowered)) return false;
  }
  return val;
}, z.boolean());

const sortOrderField = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return undefined;
  return Number(val);
}, z.number().int().optional());

const createGroupSchema = z.object({
  slug: z.string().min(2).max(64).regex(/^[a-z0-9_-]+$/i),
  title: z.string().min(1).max(160),
  description: optionalString(255).optional(),
  multi_select: booleanField.optional(),
  metadata: metadataField.optional(),
});

const updateGroupSchema = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: optionalString(255).optional(),
    multi_select: booleanField.optional(),
    metadata: metadataField.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No changes supplied",
  });

const optionItemSchema = z.object({
  id: z.number().int().positive().optional(),
  value: z.string().min(1).max(80),
  label: z.string().min(1).max(160),
  description: optionalString(255).optional(),
  image_url: nullableString(2048).optional(),
  accent_color: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === "") return null;
      return String(val).startsWith("#") ? String(val) : `#${String(val)}`;
    },
    z
      .string()
      .regex(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
      .nullable()
      .optional()),
  metadata: metadataField.optional(),
  sort_order: sortOrderField,
});

const upsertItemsSchema = z.object({
  items: z.array(optionItemSchema).default([]),
});

module.exports = {
  createGroupSchema,
  updateGroupSchema,
  upsertItemsSchema,
  optionItemSchema,
};
