---
title: "Context is king"
description:
  "Put context where it belongs (team, repo, or personal), share it, and write
  it so both people and agents can read it."
sidebar:
  order: 1
---

An agent starts every task knowing nothing about your team, your project, or
you. Everything it does well beyond generic code comes from the context it is
given: memories, documents, skills, steering files, rules. Getting that context
right is most of the work of a good setup, and it is work that pays off on every
task after.

## Put it where it belongs

Context has three natural homes, and each piece belongs in exactly one of them:

- **Team or organization.** How we work everywhere: coding standards, review
  norms, security rules, which services exist and who owns them. Ship it from
  one shared source that every repo and every person pulls from, so it is
  written once and updated once.
- **Project or repository.** How this codebase works: its structure, how to
  build and test it, its conventions, the decisions behind it. It lives in the
  repo, next to the code, and changes in the same commits as the code it
  describes. Context that lives somewhere else drifts away from the code it is
  about.
- **Personal.** How you work: your editor, your shortcuts, your preferences, the
  machines you have access to. It lives on your machine. Nobody else needs it,
  and it should not leak into a shared repo.

When a personal note turns out to matter to everyone, move it up a level. A
preference you keep re-explaining to your own agent is often a team convention
nobody wrote down.

## Share it

Context that only you have makes only you better. Context in the repo or the
shared source makes every collaborator better, people and agents alike,
including the new hire and the agent someone else is running next month. When
you work out how something works, the useful question is not "how do I teach my
agent this" but "where do I write this so everyone gets it".

## Write it for people and agents

Ideally, documentation is codified: real files, in the repo or the shared
source, that a person can read in a browser and an agent can read as context.
The same `CONTRIBUTING.md` that explains how to run the tests to a new hire
explains it to an agent. One document, two audiences, and when it is wrong,
someone notices and fixes it.

Do not hide good information from your users behind an LLM. If the only place
that knows how to deploy the service is a prompt or an agent memory, that
knowledge is invisible to anyone not using that agent, unreviewable, and
impossible to link to. This is not a hard rule, but it is a strong default: if a
human would benefit from reading it, it belongs in a document a human can read.

The exceptions are files that exist specifically to steer agents and are loaded
into their context every time, such as `AGENTS.md` and your tool's steering or
rules files. Those are written for the agent, and that is fine, as long as they
point at the human documentation instead of replacing it.

## Keep AGENTS.md short and link out

An `AGENTS.md` at the root of a repo should be an overview and an index, not the
documentation itself:

```markdown
# Payments service

Handles card and bank payments for checkout. Python 3.13, FastAPI, Postgres.
Owned by the payments team.

## Layout

- `src/payments/api/` HTTP handlers. Thin: parse, call the domain, map errors.
- `src/payments/domain/` Business rules. No I/O.
- `src/payments/adapters/` Card network and database clients.

## Before you change anything

- Build, test, and run locally: see `docs/development.md`.
- Code style and review norms: see `docs/style.md` and the team guide.
- Every commit must pass `make check` (format, lint, types, tests).

## Related

- `payments-schema` repo: the shared event schemas this service publishes.
- Runbook: `docs/runbook.md`.
```

Everything the agent needs to orient itself fits on one screen, and every detail
lives in a document a person can read and keep current. Because it is loaded on
every task, every line in it costs context on every task, so keep it to what is
worth that.
