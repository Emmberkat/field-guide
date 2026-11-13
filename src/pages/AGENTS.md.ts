// Builds /AGENTS.md: every rule in the guide, one per page, from each page's
// title and description, under its chapter, in sidebar order.

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { sidebar } from "../sidebar.mjs";

export const GET: APIRoute = async ({ site }) => {
  const root = new URL(import.meta.env.BASE_URL, site);
  const pages = await getCollection("docs");

  const chapters = sidebar.map(({ label, items: [{ autogenerate }] }) => {
    const rules = pages
      .filter(({ id }) => id.startsWith(`${autogenerate.directory}/`))
      .filter(
        ({ id }) => !id.endsWith("/index") && id !== autogenerate.directory,
      )
      .sort(
        (a, b) =>
          (a.data.sidebar.order ?? 0) - (b.data.sidebar.order ?? 0) ||
          a.data.title.localeCompare(b.data.title),
      )
      .map(
        ({ id, data }) =>
          `- **${data.title}.** ${data.description} ${new URL(`${id}/`, root)}`,
      );
    return `## ${label}\n\n${rules.join("\n")}`;
  });

  const text = `Each rule links to the page with its reasons, examples, and exceptions.
Read the page before you apply the rule.

${chapters.join("\n\n")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
