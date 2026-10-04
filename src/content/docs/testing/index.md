---
title: "Testing"
description:
  "How I think about writing tests: what to test, how to shape code for it, and
  how to make tests tell the truth."
sidebar:
  order: 0
  label: "Overview"
---

This is how I think about writing tests, shaped by eight years in test
automation. It is opinionated on purpose, and it is not policy: it is a starting
point for engineers to challenge and improve their own approach. It applies to
unit, integration, and end-to-end tests in any language, though the examples
lean on Python. If you disagree with something here, good. A few of these
positions exist because someone pushed back on me and was right.

The first four pages are the philosophy, in the order you meet it:

1. [Deciding what to test](./deciding-what-to-test/)
2. [Shaping code so it can be tested](./shaping-code/)
3. [Making tests tell the truth](./telling-the-truth/)
4. [Making failures useful](./useful-failures/)

After that come [rules for each flavor of test](./by-flavor/) and the
[smells I comment on in review](./review-smells/).

## The short version

Write the test that would have caught the bug, at the cheapest layer that can
see it. Write it while the code can still change, and let it push back on the
design. Make it fail for exactly one reason, and make the failure message end
the investigation instead of starting it. Remember that green proves nothing
crashed, not that the feature works. And if you cannot say what would break, do
not write it yet.
