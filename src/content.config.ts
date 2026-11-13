import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      // Required: each page's description is its rule in /AGENTS.md.
      extend: z.object({ description: z.string() }),
    }),
  }),
};
