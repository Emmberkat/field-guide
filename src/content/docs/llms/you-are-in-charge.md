---
title: "You are in charge"
description:
  "Hand the agent work like you would a junior engineer, turn its mistakes into
  durable context, and never take its word as the final answer."
sidebar:
  order: 2
---

Treat an agent like a junior engineer on the team. You assign it work, and you
expect it to figure out how to do it. You also review what it produces, because
you are accountable for it, not the agent.

## Assign work, not instructions

I aim to talk to my agent with as little context in the prompt as possible:

> Add retries to the storage upload in the nightly export.

not a page of instructions on which file to open, which library to use, and how
the tests are structured. If the agent needs a page of instructions to do a
routine task in this repo, the problem is not the prompt. It is that the repo
does not explain itself. The prompt is the worst place for that knowledge: it is
gone after one task, nobody else gets it, and you will type it again tomorrow.

So the prompt carries the task, and the [context](../context-is-king/) carries
everything that is true about the project regardless of the task.

## Where it gets stuck becomes a rule

Pay attention to where the agent goes wrong, and fix it once, durably. If it
keeps running the wrong test command, the development docs are unclear or the
`AGENTS.md` does not point at them. If it keeps reaching for a library you have
banned, that is a lint rule, a memory, or a line in the steering file. Each fix
is small, and the agent gets better at your codebase over time instead of making
the same mistake every week.

This is the same idea as
[repeated review comments being a missing mechanism](../../shipping/reviewing-code/#repeated-comments-are-a-missing-mechanism),
and the same ladder applies: prefer the fix that makes the mistake impossible or
fails the build, then documentation, and only then a note that only the agent
sees.

## The agent is never the expert

Regardless of your skill level, you need to be in charge. The agent is your
worker, not your authority. LLMs make mistakes confidently: a made-up API, a
flag that does not exist, a plausible explanation for a bug that is not the bug,
delivered in exactly the same tone as a correct answer. Tone tells you nothing.

That means:

- **Review its code** as you would any author's, and
  [review it hostilely](../../shipping/reviewing-code/#assume-the-code-is-wrong).
  Generated code deserves more suspicion, not less, because it is written fast
  and reads well whether or not it is right.
- **Validate its answers.** Do not assume an answer is correct because it is
  fluent or detailed. Ask for the source: a link to the documentation, the line
  in the code, the release note. Then open the link. A source the agent cannot
  produce, or one that does not say what the agent claimed, is your answer.
- **Check that it did what it said.** "I ran the tests and they pass" is a
  claim. The test output is evidence. A
  [green build is not evidence that the feature works](../../testing/telling-the-truth/),
  and neither is an agent saying so.

If you cannot evaluate what the agent produced, you are not in a position to
accept it. That is a signal to learn the area, or to bring in someone who knows
it, not to trust the output harder.
