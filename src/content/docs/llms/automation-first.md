---
title: "Automation first, AI review second"
description:
  "Enforce hard rules with compilers, linters, and tests. Use AI review only as
  an advisor, in addition to human review."
sidebar:
  order: 3
---

Prefer durable automation over LLMs. A compiler, a type checker, a linter, a
formatter, and a test suite give the same answer every time, run in seconds, and
cannot be talked out of a rule. An LLM can give a different answer to the same
question depending on its context and on chance, and it can miss the one thing
that mattered while commenting on five that did not.

So every rule that can be a hard rule should be one, enforced by the
[most reliable mechanism](../../shipping/reviewing-code/#repeated-comments-are-a-missing-mechanism)
you can get. An LLM is not on that ladder as a replacement for any rung.

## Where an LLM reviewer helps

Some guidance cannot be expressed as a lint rule: "keep handlers thin", "prefer
immutable values", "don't abstract early", "name things after what they mean in
the business, not how they are stored". If those practices are written down in
the repo, an agent can read a change against them at review time and point out
where the change seems to drift. That is a real use, and a good one, because it
catches things a linter never will.

It has to stay advisory:

- **Comments, not blockers.** AI review comments hint to the author, and to the
  human reviewers, that something might deserve a second look. They never fail
  the build or block a merge. A check that blocks needs to be right every time,
  and an LLM is not.
- **The written practices are the source.** The agent checks the change against
  the guidance in your repo, not against its own taste. When it flags something,
  it should point at the practice it is applying, so the author can judge
  whether the practice really applies here.
- **Ignoring a comment is fine.** If the author and the reviewer read it and
  disagree, that is the process working. If a particular comment is ignored
  again and again, either the practice is wrong or the agent is applying it
  badly. Fix whichever it is.

## Never instead of a person

AI review is an assistant, in addition to the normal review process. It is not a
replacement for it, and it is not a replacement for human judgment. Every change
still gets a human reviewer who is accountable for approving it.

The risk is not that AI review is useless. It is that it is useful enough that
people start to lean on it: the human reviewer skims because "the bot already
looked", and the change is effectively approved by something that cannot be
accountable for it. If anything, a clean AI review is a reason to look harder,
because it means the problems left in the change are the ones the AI does not
see.
