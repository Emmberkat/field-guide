---
title: "Prototype, then throw it away"
description:
  "Write it once to learn, then rebuild it with what you learned. LLMs make the
  first pass cheap."
sidebar:
  order: 4
---

Often the best way to get quality code is to write it once, throw it away, and
start over. The first pass is a prototype. The second pass is informed by what
did and did not work in the first.

This was true long before LLMs. The second pass is usually much faster than the
first, because the hard part of writing software was never typing it. It is the
design and the structure: what the pieces are, where the boundaries go, what the
data looks like, which parts are tricky. The first pass is how you find that
out. By the second, you know.

## LLMs make the first pass cheap

LLMs are great at producing a first pass quickly: something real you can read,
review, run, and poke at, in a fraction of the time it would take to write by
hand. That changes the economics. When the prototype took a week, throwing it
away felt like losing a week, so people shipped it. When it took an afternoon,
throwing it away is cheap, and keeping it is the expensive choice.

Use it to answer questions:

- Does this library actually do what its documentation says?
- What does the data look like once you have it?
- Where does the design get awkward?
- Which part is actually hard?

Then rebuild it properly, with the answers in hand: the right structure, real
tests written alongside the code, the abstractions the prototype
[showed you were needed](../../design/dont-abstract-early/) and none of the ones
it showed you were not. The rebuild can use an LLM too. It goes better, because
now you know what to ask for and can tell when the answer is wrong.

## Actually throw it away

The danger of a prototype is that it works well enough to keep. A prototype is
written to learn, not to last: it skips error handling, cuts corners on
structure, and has tests that, if it has any,
[check what it happened to do](../../testing/telling-the-truth/) rather than
what it should do. Polishing it into production code means carrying all of that
forward.

Decide it is a prototype before you start, keep it out of the main branch, and
when it has answered your questions, delete it. Keep the notes, not the code.
