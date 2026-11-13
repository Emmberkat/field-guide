// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import starlight from "@astrojs/starlight";
import { satteri } from "@astrojs/markdown-satteri";
import { satteriRelativeMarkdownLinks } from "@system76/satteri-relative-markdown-links";

const base = "/field-guide/";

// https://astro.build/config
export default defineConfig({
  site: "https://emmberkat.github.io",
  base,
  // No images to optimize, so skip sharp and its native binaries.
  image: { service: passthroughImageService() },
  markdown: {
    processor: satteri({
      // Links between pages are written as links to the other page's file
      // (`../testing/shaping-code.mdx`), so they work when the Markdown is read
      // on its own. This turns them into links to the pages on the site.
      mdastPlugins: [
        satteriRelativeMarkdownLinks({
          collections: { docs: { base: false } },
          base,
          trailingSlash: "always",
        }),
      ],
    }),
  },
  integrations: [
    starlight({
      title: "Emma's Field Guide",
      description: "Software opinions, earned the hard way.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Emmberkat/field-guide",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/Emmberkat/field-guide/edit/main/",
      },
      sidebar: [
        {
          label: "Design",
          items: [{ autogenerate: { directory: "design" } }],
        },
        {
          label: "Testing",
          items: [{ autogenerate: { directory: "testing" } }],
        },
        {
          label: "Shipping changes",
          items: [{ autogenerate: { directory: "shipping" } }],
        },
        {
          label: "Working with LLMs",
          items: [{ autogenerate: { directory: "llms" } }],
        },
      ],
    }),
  ],
});
