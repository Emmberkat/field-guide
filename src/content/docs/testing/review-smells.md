---
title: "Smells I comment on in review"
description:
  "A checklist of test smells, grouped by the part of the chapter they violate."
sidebar:
  order: 6
  label: "Review smells"
---

If I find myself leaving one of these on the same codebase again and again, the
comment is not the fix. A lint rule or a test is; see
[repeated comments are a missing mechanism](../../shipping/reviewing-code/#repeated-comments-are-a-missing-mechanism).

Deciding what to test:

- Tests added for coverage on code with no branching.
- A test of a library's documented behavior.
- A test guarding an invariant the code could have made impossible.

Shaping the code:

- A `MagicMock` or `patch` anywhere.
- `assert x.called`, or any assertion whose subject is a test double.
- A test that imports a private function, or a function whose visibility was
  loosened so a test could call it.
- A function that constructs or imports its own external client when it could
  take it as a parameter.
- A hand-written stand-in that is not typed against a `Protocol` or interface.
- Tests that arrived last, in a separate PR, visibly working around the code's
  shape.
- A new test that reproduces existing tests' setup wholesale, when the
  interesting logic could have been extracted instead.

Telling the truth:

- A loop or parametrize over data that could be empty, with nothing asserting
  that it is not.
- A `try/except` in a test that turns a failure into a pass, or a bare `except`
  anywhere near an assertion.
- A skip that fires on an infrastructure condition.
- A retry or a `sleep` added to make a test stop failing.
- A hardcoded absolute date, or an expected value copied out of a failing run's
  output with no reason for it being correct.
- A coverage number cited as evidence that something is tested.
- A test that depends on another test having run first, or on shared
  module-level state.

Making failures useful:

- A test whose name describes the implementation ("calls the client twice")
  rather than the behavior.
- Several assertions or checks sharing one generic title.
- A hand-rolled "check failed" message that hides both sides of the comparison.
- A wrapper that catches and re-raises, losing the traceback.

Unit tests:

- Cleanup written as the last lines of a test body instead of in a fixture or
  context manager.
- The input that matters to the test hidden inside a fixture.
- A Hypothesis failure "fixed" by rerunning, or by narrowing the strategy until
  the failing input can no longer be generated.
- A bug Hypothesis found that was fixed without an `@example` pinning the input.

Recorded-check end-to-end tests:

- A test that verifies everything with bare `assert`s and records no checks. The
  test still fails, but the results carry one generic check instead of the
  outcomes it verified, and the first failure aborts the rest.
- A check title built from run-specific data, or a test ID that is not stable
  across runs.
- Configuration read inside a worker process instead of captured at
  construction.
- A proxy constraint where the real requirement is narrower.

BDD scenarios:

- A new step that overlaps an existing step's pattern.
- A setup or teardown step that should have been a lifecycle hook.
- An examples table extended without saying what it does to the scenario count.
