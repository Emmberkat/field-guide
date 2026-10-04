---
title: "Making tests tell the truth"
description: "False passes, silent skips, what coverage and mutation testing actually measure, and determinism."
sidebar:
  order: 3
---

## A test that cannot fail is worse than no test

The cardinal sin in test code is the silent false pass: a green result
that asserts the opposite of the truth. No test at all is honest about
its own absence. A false pass actively lies, and it lies inside a
release pipeline where someone is making a go decision from it.

The classic shape: a test is supposed to run against the new build you
are about to release, but targeting that build is opt-in. The "deploy to
the test environment" steps are no-ops unless a flag is set. Forget the
flag and nothing is deployed. The test runs against whatever was already
there (often the current production version), measures that, and goes
green. That green result asserts production works. It says nothing about
the release you are trying to ship. In a release gate that is a
catastrophic false negative, and it looks exactly like success.

The quieter version needs no infrastructure at all:

```python
def test_every_endpoint_is_healthy() -> None:
    for endpoint in load_endpoints("endpoints.yaml"):
        assert check(endpoint).healthy
```

If the config comes back empty, the loop runs zero times and the test
passes having asserted nothing. `@pytest.mark.parametrize` over the same
empty list is the same bug: pytest skips the test with "got empty
parameter set" and the run stays green. Nothing in the output
distinguishes "ran and passed" from "was never generated"; the only tell
is the test count. Make the emptiness loud:

```python
def test_every_endpoint_is_healthy() -> None:
    endpoints = load_endpoints("endpoints.yaml")
    assert endpoints, "endpoints.yaml produced no endpoints; this test would check nothing"
    for endpoint in endpoints:
        assert check(endpoint).healthy, f"{endpoint} is unhealthy"
```

For parametrized tests, set `empty_parameter_set_mark = fail_at_collect`
in your pytest config. Table-driven frameworks (BDD tools especially)
have the same failure mode with an empty examples table or parameter
group.

Run every new test through this: did the stated expectation match what
actually ran, and if not, did something fail loudly? Then ask who can
even see the mismatch. A framework can only enforce the gaps where it
holds both sides (you configured a resource, no test consumed it).
Anything that is a fact about your own test (did my workload physically
land on the host I asked for?) can only be caught by an assertion you
write. Do not assume the framework is covering you there. It
structurally cannot.

Which brings me to the line I care about more than any other in this
document: a green build is not evidence that the feature works. It
proves nothing crashed. If the change produces output (a file, a log
line, an API response, a metric, a measurement), prove the output is
right end to end. Compiling and passing unit tests of internal helpers
is not that.

## Skipping is a decision, not a side effect

A test that was not explicitly filtered out was meant to run. If it did
not run because the environment could not satisfy it, or because its
inputs came back empty, that is a failure, not a skip. Marking it
skipped converts a real gap in coverage into a quiet, permanently green
row that nobody reads.

If a test genuinely should not run in some environment, disable it
explicitly, with a tag, where a reviewer can see the decision. The worst
version of this is a skip that fires on an infrastructure condition,
because the amount of coverage you have then depends on the weather.

## Measuring your tests

Line coverage tells you which code ran during the tests. It says nothing
about whether anything checked what that code did. A test that calls a
function and asserts nothing gets full coverage of it. Low coverage is
useful information (this code is definitely untested). High coverage is
not (this code ran, and that is all you know).

Mutation testing gets closer to the question you actually care about:
would the tests notice if the code were wrong? A mutation tester
(`mutmut` in Python) makes small deliberate changes to your code, such
as flipping a `<` to `<=`, swapping `and` for `or`, or replacing a
constant, and reruns your tests against each one. If the tests still
pass, the mutant "survived", and you have found behavior your suite
executes but does not check. It is slow and noisy across a whole
codebase, so adopt it incrementally: point it at the module where a
silent bug would hurt most, or at the code a change touched, and treat
each survivor as a question ("should a test have caught this?") rather
than a number to drive to zero.

Neither number is a goal. Once a metric becomes a target, people
optimize the metric. A coverage gate produces exactly the padding tests
this guide tells you not to write, and a mutation score can be gamed the
same way. Use metrics to decide where to look, not whether you are done.

## Determinism is your responsibility, not the environment's

- Never hardcode an absolute date in a fixture for code that
  time-filters. A date that is safely in the future when you write the
  test passes until the calendar catches up, then fails with no code
  change, in a way that reads like a real regression. Build windows
  relative to now: `end = datetime.now(UTC) + timedelta(days=30)`.
- Retries inside a test are usually a bug you decided not to look at. If
  attempt 2 succeeds every time, attempt 1 is the failure and the retry
  is hiding it. Retry only on exception types you understand; retrying
  on `Exception` retries on your own bugs.
- Flaky is a load-bearing word and we use it too cheaply. Flaky means
  intermittent on a known-deterministic input. Different hosts,
  different timing, different upstream state is not a flaky test, it is
  a non-deterministic environment, which is a different bug with a
  different fix. A test that fails 1 in 100 with no diagnosed cause is
  not flaky, it is undiagnosed. 1% is what you can measure today.
- Tests must not depend on each other or share mutable resources: a
  module-level dict, a fixed file path, a database row, a port. Shared
  state makes the outcome depend on run order, and the day someone turns
  on parallel execution or test shuffling (`pytest-xdist`,
  `pytest-randomly`), a suite that was green for years turns red at
  random. Running in random order occasionally is a cheap way to find
  these first. Each test creates what it needs and cleans it up.
- If you cannot tell whether a failure is real or environmental, the
  visibility gap is part of the bug, and fixing it is on the critical
  path.
