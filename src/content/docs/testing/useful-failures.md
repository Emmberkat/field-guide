---
title: "Making failures useful"
description:
  "Model checks around meaningful outcomes and make every failure name the
  mismatch."
sidebar:
  order: 4
---

## One check per meaningful outcome

I once saw a dense-connectivity test that recorded about 192 checks, every one
titled "TCP connectivity between instances", one per random pair. That is not
192 outcomes. It is one outcome, "dense-packed connectivity holds", sampled 192
times.

Repeated generic titles are the tell of mis-modeling. If an individual result is
not meaningful standing alone, it is not an outcome. It is evidence for one, and
it belongs in the message. Remodeling that test as a single check with the
failing pairs listed in the message made the result both smaller and more
useful.

Distinctness falls out of good modeling; it does not get designed in. Do not
reshape your assertions to make a report look better. Report what the test
actually verifies, at the granularity it actually verifies it.

## A failure has to name the mismatch

Failing loudly is not the same as exiting non-zero. A generic "deployment
failed" goes red and closes nothing. The person reading it still has to go find
out what happened. The bar: someone who just made this mistake should
immediately understand what they got versus what they asked for.

```python
# Sends someone digging.
raise LookupError("run has no trace file")

# Ends the investigation.
raise LookupError(f"run {run_id} has no trace file at {url} (HTTP {status})")
```

Put the value, the path, the URL, the expected-versus-actual in the message. You
are writing for the person at 2am who did not write this code.

Lean on tooling that does this for you. pytest's assertion rewriting already
prints both sides of a plain `assert a == b`, so a bare comparison often beats a
hand-rolled helper that reports "check failed". For comparisons that are not
simple equality (contains, close-to, has-these-keys), a matcher library such as
PyHamcrest produces an "expected ... but was ..." message for free. Either way,
read the failure output of a new test once, on purpose, by breaking it before
you commit.

And do not let the framework or your own wrapper eat the traceback. A failed
test must point at the assertion site in the author's code. If the test raises
`AssertionError("expected 90Gbps, got 42Gbps")`, that exact message and that
exact line number are what should show up. Catching, wrapping, and re-raising
loses the only thing that was useful. Frameworks that do this are reliably the
ones whose failures take longest to diagnose. Where a framework does it anyway,
put everything the reader needs into the assertion message, because the message
is all that survives.
