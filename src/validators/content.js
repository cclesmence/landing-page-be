const { z } = require("zod");

const sectionSchema = z.object({
  section: z.string().min(2).max(64),
  title: z.string().min(1).max(160),
  subtitle: z.string().max(240).default(""),
  body: z.string().max(4000).default(""),
});

const updateSectionsSchema = z.object({
  sections: z.array(sectionSchema).min(1),
});

module.exports = {
  sectionSchema,
  updateSectionsSchema,
};
