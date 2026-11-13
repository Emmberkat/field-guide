// Publishes every page's Markdown source, unchanged, under /agents/, apart
// from the web pages: src/content/docs/design/naming.md is
// /agents/design/naming.md. SKILL.md links to these, and links between pages
// are paths to the other page's file, so they work here as they are. The home
// page has no rules and is left out.

import { readFile } from "node:fs/promises";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

export const getStaticPaths = (async () => {
  const pages = await getCollection("docs", ({ id }) => id !== "index");
  return pages.map(({ filePath }) => ({
    params: { page: filePath!.replace("src/content/docs/", "") },
    props: { filePath: filePath! },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await readFile(props.filePath, "utf8"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
