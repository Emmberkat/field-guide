# Emma's Field Guide

Software opinions, earned the hard way.

Published at <https://emmberkat.github.io/field-guide/>. Built with
[Starlight](https://starlight.astro.build/).

## Layout

```
src/content/docs/
  index.mdx            Home page
  <chapter>/           One directory per chapter, one page per topic
    index.md           Chapter overview (optional)
```

Each chapter is a directory under `src/content/docs/`, listed in the sidebar in
`astro.config.mjs`. Pages within a chapter are ordered by `sidebar.order` in
their frontmatter. Use `.md` for plain pages and `.mdx` for pages that need
components, such as language tabs:

````mdx
import { Tabs, TabItem } from "@astrojs/starlight/components";

<Tabs>
<TabItem label="Python">

```python
...
```

</TabItem>
<TabItem label="Java">

```java
...
```

</TabItem>
</Tabs>
````

Keep the code fences at the start of the line, with a blank line on each side of
every `<TabItem>` tag, or MDX will not treat them as code blocks.

Link between pages with relative links (`../shaping-code/`), not absolute ones,
so the site keeps working if the base path changes.

## Formatting

Everything Prettier understands is formatted with it, prose included
(`proseWrap: "always"` in `.prettierrc`; that is the only setting). Turn on
format on save in your editor, or run `npm run format` before committing. CI
runs `npm run format:check` and fails on unformatted files.

Commits that only reformat are listed in `.git-blame-ignore-revs`, which
GitHub's blame view skips automatically. To skip them locally too:

```sh
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## With Nix (recommended)

```sh
nix develop          # shell with Node
npm ci && npm run dev
nix build            # static site in ./result
nix run              # serve the build at http://localhost:8000/field-guide/
nix flake check      # what CI runs
```

## Without Nix

Requires Node 22.12 or newer.

```sh
npm ci
npm run dev          # live preview at http://localhost:4321/field-guide/
npm run build        # static site in ./dist
npm run preview      # serve ./dist
npm run format       # format everything with Prettier
```

## Deployment

Every push to `main` builds the site and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). Pull requests build both ways without
deploying.
