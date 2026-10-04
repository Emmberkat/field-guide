---
title: "Rules by flavor"
description: "Additions for unit, property-based, integration, end-to-end, BDD, and canary tests."
sidebar:
  order: 5
---

Everything in the philosophy pages applies to every flavor. These are
the additions.

## Unit tests

The bar is your full local build: type checker, linter, and tests. A
test that passes but fails the linter is not done.

- No network, no cloud APIs, no SSH, no remote hosts. If your unit test
  needs any of those, it is an integration test wearing the wrong hat.
- Test the interesting logic: the solver, the parser, the derivation,
  the result modeling, the thing with branches. Not the plumbing that
  hands it its arguments.
- One behavior per test, named after the behavior, not the
  implementation.
- If your linter flags `assert` (ruff's `S101`, for example), disable
  that rule for test files. A plain `assert` is correct in a test. You
  do not need a helper.
- Type-annotate tests like any other code, and run the type checker on
  them.
- Do not compare a resolved path against an unresolved one. Home and
  temp directories are symlinks on plenty of machines, so a test
  comparing `Path(tmpdir)` against something that went through
  `resolve()` fails on one box and passes on another, which wastes an
  hour every time.
- Structure every test as Arrange, Act, Assert, plus a fourth A,
  Annihilate (clean up what you created). If a reader cannot point at
  the parts, the test is doing too much.
  - Arrange: preconditions that are the same for every test belong in a
    fixture. Preconditions that vary are the point of the test and
    belong in the test body or in `@pytest.mark.parametrize`, where a
    reader can see them. Hiding the interesting input in a fixture three
    files away makes the test unreadable.
  - Act: ideally one line, the call you are actually testing. Several
    lines of Act usually means the API is awkward or the test covers two
    behaviors.
  - Assert: on the outcome of that one call.
  - Annihilate: never by hand at the end of the test body, because an
    earlier failed assertion skips it. Use a `yield` fixture, a context
    manager, or `tmp_path`, so cleanup runs whether the test passed or
    not.

### Property-based tests

Example-based tests check the inputs you thought of. Property-based
tests (Hypothesis, in Python) check a statement that should hold for
every input, and let the tool generate inputs to try to break it. When
it finds one, it shrinks it to the smallest failing case before
reporting, which is often the most useful debugging output you will get
all week.

```python
@given(st.dictionaries(st.text(), st.integers()))
def test_config_survives_a_round_trip(config: dict[str, int]) -> None:
    assert decode_config(encode_config(config)) == config
```

That one test tries empty dicts, empty keys, unicode keys, negative and
enormous values, and whatever else Hypothesis thinks might break your
encoder.

- They are strongest on the same code that deserves unit tests in the
  first place: parsers, serializers, solvers, anything with a clear
  contract. Properties that are easy to state and catch a lot:
  - Round trip: `decode(encode(x)) == x`.
  - Invariants: the output is sorted, the total is preserved, no element
    is lost.
  - Oracle: the fast implementation agrees with a slow, obviously
    correct one.
  - Idempotence: doing it twice is the same as doing it once.
- Keep the example tests too. A property says what must always be true;
  an example documents a specific case a human cared about. When
  Hypothesis finds a failure, fix it and pin that input with
  `@example(...)` so it is checked on every run, not only when the
  generator happens to find it again.
- A Hypothesis failure in CI is not flakiness. The input space was
  always non-deterministic, and today the tool found a real bug.
  Reproduce it from the falsifying example in the output, fix it, pin
  it. If you need CI to be reproducible run to run, configure that
  explicitly (a settings profile with `derandomize=True`) rather than
  rerunning until it goes green.
- Constrain strategies to the actual domain of the function. A property
  that only passes because you filtered out the inputs that break it
  (`assume(...)` everywhere) is a false pass with extra steps.
- For anything with a sequence of operations (a cache, a queue, a state
  machine), Hypothesis's stateful testing generates whole operation
  sequences and checks invariants after each step. It finds the "works
  unless you call these three things in this order" bugs that example
  tests almost never do.

## Integration tests

These still run in your regular test runner and in the build, but they
assemble real pieces: they invoke the CLI as a subprocess, load entry
points, exercise plugin contracts.

- This is the right layer for contract questions: does the entry point
  actually get discovered, does a CLI argument actually reach the
  component that consumes it, does a plugin that raises actually fail
  the run.
- When a test spans a process boundary, communicate results through the
  feature itself rather than a side channel. If you are testing that a
  CLI argument reaches a plugin, pass a file path through that argument
  and assert on the file contents. That tests the argument mechanism as
  well as the thing you meant to test. Smuggling the result out through
  an environment variable tests neither.
- Assert on the process's observable output: exit code plus the artifact
  it was supposed to produce. Exit code alone is a false pass waiting to
  happen.
- Keep them hermetic. A temp directory, an `--output-dir` under it, no
  writes outside it.

## End-to-end tests

- Only point a test at resources actually running the build under test.
  If the framework assigns roles (client, server) itself, an untouched
  host can land in the role you are measuring, and the run will look
  fine.
- Express the real constraint, not a proxy for it. If a client and
  server only need separate network interfaces, ask for separate
  interfaces, not separate machines. The proxy over-constrains: on an
  environment with one big machine, the test becomes unplaceable and
  fails with a misleading "no capacity" error while the capacity sits
  right there.
- If a test behaves differently by mode (against the new build or
  against production, say), make the branch explicit in the test. If
  forgetting it is a recurring mistake, add a lint rule that fails the
  build when it is missing.
- Know where the machine-readable results land (JUnit XML, a results
  file, a results store), and check those, not the console output, when
  you want to know what actually ran.

### If your harness records named checks

Many end-to-end harnesses do not use plain pass/fail functions. The test
reports a set of named checks to a recorder, and the run passes only if
every recorded check passed. If yours works that way:

- Report every outcome as a recorded check, not a return value or a log
  line.
- Give each check a stable title. The title identifies the check across
  runs, so it is an identifier, not a sentence about this particular
  run. Run-specific detail goes in the message.
- A failed check should not stop execution; that is the point. One run
  reports every failure instead of only the first. When later checks
  depend on an earlier one, branch on the earlier outcome and return
  early rather than letting twenty checks fail off one dead connection.
- Let exceptions propagate. Catching one and recording it as a failed
  check loses the traceback.
- Test IDs must be stable across runs and unique within a run. They are
  what results are tracked by, so an ID derived from something
  nondeterministic breaks history.
- Anything you want to select or exclude on the command line has to be
  declared metadata (a tag, a marker) visible at filter time, not a
  parameter buried in the test body.
- If tests run in worker processes, configuration the parent read at
  startup does not automatically follow them. Capture what the test
  needs as an attribute at construction, so it travels with the test
  instance, instead of reading global config inside the test body.

## BDD scenarios (behave, Cucumber, and friends)

Most tests check that you built the thing right. Acceptance tests check
that you built the right thing. A Gherkin feature file is meant to be an
executable specification: requirements written in Given/When/Then with
the people who own them, then wired to code so the spec cannot silently
drift from the behavior.

That value only exists if someone outside the engineering team actually
reads or writes the feature files. If nobody does, you are paying the
full cost of a string-matching indirection layer for a test you could
have written directly. Decide which situation you are in before you
choose the tool.

Gherkin frameworks also fight a lot of this chapter's philosophy: steps are
matched by string, results are reported per scenario, and the
interesting failure is often several layers away from the assertion.
These rules are mostly about not letting them hide things from you.

- Reuse a step before adding one. Step lookup is pattern matching with
  no type checking, so a new step that overlaps an existing pattern is a
  silent behavior change somewhere else.
- Use typed step parameters (`{count:d}` with behave's default `parse`
  matcher) instead of capturing strings and converting them by hand. The
  conversion then fails at match time, with the step text in hand,
  instead of as a confusing error inside the step body.
- Use tables in the feature file for table-shaped requirements. A table
  the requirement owner can read is better than ten nearly identical
  scenarios.
- Setup and teardown belong in the framework's lifecycle hooks
  (`before_scenario` / `after_scenario` in behave's `environment.py`),
  not in steps. A teardown step never runs when an earlier step fails.
- Step wrappers, hooks, and reporters routinely mangle tracebacks, so
  this is where putting actual-versus-expected in the assertion message
  matters most.
- A syntax or whitespace error in one `.feature` file can kill the
  entire run, not just that scenario. Treat a dry run as mandatory
  before you commit a feature-file change; it also reports the scenario
  count without executing anything.
- Scenario outlines and combination tables fan out multiplicatively.
  Adding one more parameter value is not a small change. Know the
  resulting scenario count before you push it.
- Check your framework's tag semantics rather than trusting intuition.
  In behave's classic syntax, `--tags=a --tags=b` is AND and
  `--tags=a,b` is OR, which is the opposite of what most people guess.
- Individual rows of an examples table usually cannot be selected on
  their own. If you want to run one combination in isolation, give it
  its own tagged block. Designing for selectability up front saves the
  "add a temporary `@mine` tag and remember to remove it" dance.

## Canaries

A canary is the same test run continuously, so everything else in this
chapter still applies, plus:

- A canary that cannot distinguish "ran and passed" from "did not run"
  is a liveness check pretending to be a test. Make sure a zero-scenario
  run is loud.
- Success rate is the metric that matters, not attempt count. A liveness
  alarm on "are updates happening" cannot tell 1000 clean runs from 1000
  runs with 100 failures.
- A result that is computed and then only printed does not exist. If the
  canary derives pass/fail per host, that has to land in the results
  store, not the log. The same goes for measurements: one that is
  collected but never registered wherever your pipeline turns values
  into metrics is not a metric, no matter how carefully you collected
  it.
- Name metrics after the established standard when one exists (for
  networking, the Linux kernel's interface counters), so someone reading
  a metric name can go find the canonical definition.
