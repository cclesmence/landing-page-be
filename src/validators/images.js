const { z } = require("zod");

const preprocessNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const num = Number(value);
  return Number.isNaN(num) ? value : num;
};

const preprocessString = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return value;
};

const dimensionSchema = z
  .preprocess(preprocessNumber, z.number().int().positive().max(10000))
  .optional();

const createImageSchema = z.object({
  label: z.string().min(1).max(160),
  description: z.string().max(400).optional(),
  url: z.preprocess(preprocessString, z.string().url()).optional(),
  width: dimensionSchema,
  height: dimensionSchema,
});

const updateImageSchema = createImageSchema.partial();

module.exports = {
  createImageSchema,
  updateImageSchema,
};
