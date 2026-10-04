---
title: "Deciding what to test"
description: "Pick the failure mode first, then the cheapest layer that can see it, and prefer making bad states impossible."
sidebar:
  order: 1
---

## The first question: what could break?

Before writing anything, answer what you are actually protecting
against. If you cannot name a failure mode, you are about to write a
test that can only ever fail for reasons unrelated to the thing you care
about.

The answer picks the layer for you:

- Real logic (branching, transformation, an algorithm, an edge case) ->
  unit test.
- Behavior that only exists once the pieces are assembled (CLI parsing,
  entry-point loading, plugin contracts, process orchestration) ->
  integration test.
- Behavior that only emerges from real hardware, a real network, or a
  real deployed environment -> end-to-end test.
- Nothing interesting (a function calls another function with an
  argument) -> no test. Write nothing.

Pick the cheapest layer that can actually see the failure. Cheap means
fast feedback and few moving parts, and it usually means the failure
message points somewhere useful. A bug you can catch in a unit test
should not be chased with a fleet of test hosts.

Think about every test as value against cost. A test's cost is not just
writing it. It is every run, every read by someone trying to understand
a failure, and every edit during a refactor, for as long as the test
exists. When a test is expensive, the first move is to make it cheaper,
not to delete the value. The testing pyramid falls out of this: lots of
cheap tests at the bottom, few expensive ones at the top. Treat the
shape as a consequence of picking the cheapest layer each time, not as a
quota to hit.

And ["can it be nothing?"](../../design/keep-it-simple/#reach-for-the-boring-option-first)
applies to tests too. A test with no failure
mode behind it is a maintenance cost with no upside. It will still be
there in three years, and someone will keep it passing during a refactor
by weakening it.

## Make it impossible before you make it tested

Sometimes the right answer to "what could break?" is "nothing, once the
code stops allowing it". Tests are the weakest place to enforce an
invariant. Preference order for making a bad state impossible:

1. Construction time. A validating constructor, a factory, a type that
   cannot represent the bad value. The bad state stops existing.
2. Build time. A strict type checker, a linter, a project-specific lint
   rule. Caught by your local build, which is the tightest feedback loop
   a human actually sits in.
3. A runtime check somewhere shared, failing with a specific message.
4. Convention plus a test that watches for violations. Weakest.

```python
@dataclass(frozen=True)
class TimeWindow:
    start: datetime
    end: datetime

    def __post_init__(self) -> None:
        if self.end <= self.start:
            raise ValueError(f"window end {self.end} is not after start {self.start}")
```

No code anywhere can now hold a backwards window, so no test needs to
check that each caller avoided building one. A test only catches the
violation someone thought to write a test for. A constructor catches
every one, because a new call site cannot opt out of it.

Types and classes are how you communicate intent to the people who come
after you, and a class exists to protect its invariants. If nothing can
break an invariant, it is just a data container; use a dataclass or a
dict. If something can, the constructor is the place to enforce it. At
system boundaries (config files, API payloads, CLI input), validate on
the way in with something like pydantic, so malformed data fails
immediately and specifically rather than three calls later as a
`KeyError`. And a custom lint rule is cheaper to write than most people
assume (a small pylint plug-in is an afternoon). A rule that turns a
team convention into a build failure is worth more than any amount of
review diligence.

This is not an argument against testing invariants. It is an argument
about ordering. Once the guard exists, unit test the guard, and prove
the invariant end to end on the live path. Both, not one. The unit test
says the guard works. The integration test says the guard is actually in
the path.

## Don't test the library

I once deleted a set of tests that asserted a `tenacity` `@retry`
decorator retried. They passed. They were still wrong. They tested
tenacity's documented behavior, which tenacity already tests, and they
would have kept passing if our retry policy had been attached to the
wrong function entirely.

Same category: do not unit test Click's argument parsing, Python's
`dict()`, `str.split`, an SDK's serialization, or anything else you did
not write.

The one exception: when you have promised behavior that only falls out
of an implementation detail, pin it. If your CLI collects repeated
`--param key=value` arguments into a dict, a repeated key silently takes
the last value. Once you document that as the contract, an integration
test that passes the same key twice and checks the second value wins is
not testing Python. It records the promise, and it notices if the
plumbing changes under you.
