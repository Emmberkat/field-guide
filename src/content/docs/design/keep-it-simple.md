---
title: "Keep it simple"
description: "Fewer moving parts, fewer states, fewer concepts. Reach for the boring option first, and aim for boring code."
sidebar:
  order: 1
---

Simple is not the same as short, and it is not the same as easy. Simple
means there is less to hold in your head: fewer moving parts, fewer
states, fewer concepts a reader has to learn before they can change
anything. A ten-line function with one path through it is simpler than a
three-line one that relies on a metaclass.

## Reach for the boring option first

Every solution sits somewhere on a ladder, and each rung up costs more
to own:

1. Nothing. The problem goes away if you change the requirement, drop
   the feature, or use something that already exists.
2. Data. A new entry in a config file, a table, or an existing mapping,
   handled by code that already exists.
3. A function.
4. A class or a module.
5. A new dependency, service, or framework.

Start at the first rung and climb only when the one you are on cannot do
the job. The higher rungs are not bad. They are expensive, and the
expense is paid by everyone who reads, debugs, and upgrades the code
after you. The "can it be nothing?" question from the [testing
chapter](../../testing/deciding-what-to-test/) is the first rung of this
ladder.

Dependencies deserve a special mention. A dependency is code you did not
write and still have to maintain: its upgrades, its security advisories,
its breaking changes, and its own dependencies. That is a great trade
for a hard problem you should not solve yourself, such as cryptography,
time zones, or parsing a real file format. It is a bad trade for
something you could write in twenty lines and never touch again.

## Count the states, not the lines

The most useful measure of complexity I know is how many states the code
can be in, and how many of them are valid.

```python
# Don't do this.
@dataclass
class Download:
    is_running: bool
    is_finished: bool
    error: str | None
    path: Path | None
```

That is sixteen combinations of set and unset fields. Four of them mean
something: pending, running, done, and failed. Every other combination
is a bug waiting for a code path to produce it, and every reader has to
work out which combinations are real.

```python
@dataclass(frozen=True)
class Pending: ...


@dataclass(frozen=True)
class Running: ...


@dataclass(frozen=True)
class Done:
    path: Path


@dataclass(frozen=True)
class Failed:
    error: str


Download = Pending | Running | Done | Failed


def describe(download: Download) -> str:
    match download:
        case Pending():
            return "waiting"
        case Running():
            return "downloading"
        case Done(path):
            return f"saved to {path}"
        case Failed(error):
            return f"failed: {error}"
```

More lines, and much simpler. There are four states and all of them are
valid. A finished download without a path cannot exist, the `match`
reads like the state diagram, and the type checker complains if a new
state is added and `describe` does not handle it.

## Boring is a compliment

Great code is often boring code. It is simple, and it works. There is
nothing in it to admire, because everything in it is obvious: the names
say what things are, each function does what its name says, and the
control flow goes where you expect. Reading it, you think "well, of
course", and that is the best reaction code can get. Code that is
exciting to read is exciting because it surprises people, and surprises
are what bugs are made of.

The same goes for the change that introduces it. If the review of your
change is quick and dull, that is usually a sign it was done well.

## Cleverness is a cost

Code is read far more often than it is written, usually by someone in a
hurry who did not write it. A clever one-liner saves its author a minute
and costs every reader five. If a piece of code needs a comment to
explain how it works, try writing the version that would not need one.
[Save comments for why](../comments/).

Simple code is also the code that is easy to test. When the [first draft
of a
test](../../testing/shaping-code/#write-the-code-and-the-test-together)
is painful to write, complexity is usually what it is telling you about.
