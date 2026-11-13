// Builds /agents/AGENTS.md: every rule in the guide, one per page, from each page's
// title and description, under its chapter, in sidebar order. Each rule links
// to its page's Markdown, published by [...page].ts, by a path relative to
// this file, so the links work on the site and in a saved copy alike.

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { sidebar } from "../../sidebar.mjs";

export const GET: APIRoute = async () => {
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
        ({ filePath, data }) =>
          `- **${data.title}.** ${data.description} ${filePath!.replace("src/content/docs/", "")}`,
      );
    return `## ${label}\n\n${rules.join("\n")}`;
  });

  const text = `Each rule is followed by the path of its page, relative to this file. Read the
page when you need the reasons, examples, and exceptions behind the rule.

${chapters.join("\n\n")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
