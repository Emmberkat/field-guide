---
title: "Keep it simple"
description:
  "Fewer moving parts, fewer states, fewer concepts. Reach for the boring option
  first, fold special cases into the general one, and aim for boring code."
sidebar:
  order: 1
---

Simple is not the same as short, and it is not the same as easy. Simple means
there is less to hold in your head: fewer moving parts, fewer states, fewer
concepts a reader has to learn before they can change anything. A ten-line
function with one path through it is simpler than a three-line one that relies
on a metaclass.

## Reach for the boring option first

Every solution sits somewhere on a ladder, and each rung up costs more to own:

1. Nothing. The problem goes away if you change the requirement, drop the
   feature, or use something that already exists.
2. Data. A new entry in a config file, a table, or an existing mapping, handled
   by code that already exists.
3. A function.
4. A class or a module.
5. A new dependency, service, or framework.

Start at the first rung and climb only when the one you are on cannot do the
job. The higher rungs are not bad. They are expensive, and the expense is paid
by everyone who reads, debugs, and upgrades the code after you. The "can it be
nothing?" question from the
[testing chapter](../../testing/deciding-what-to-test/) is the first rung of
this ladder.

Dependencies deserve a special mention. A dependency is code you did not write
and still have to maintain: its upgrades, its security advisories, its breaking
changes, and its own dependencies. That is a great trade for a hard problem you
should not solve yourself, such as cryptography, time zones, or parsing a real
file format. It is a bad trade for something you could write in twenty lines and
never touch again.

## Count the states, not the lines

The most useful measure of complexity I know is how many states the code can be
in, and how many of them are valid.

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
something: pending, running, done, and failed. Every other combination is a bug
waiting for a code path to produce it, and every reader has to work out which
combinations are real.

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

More lines, and much simpler. There are four states and all of them are valid. A
finished download without a path cannot exist, the `match` reads like the state
diagram, and the type checker complains if a new state is added and `describe`
does not handle it.

## Fold special cases into the general one

When two branches do nearly the same work, see whether one of them is really a
special case of the other. If it is, turn the special case into the general one
at the edge, and let one path handle both. The branch disappears, and so does
the chance of the two paths quietly drifting apart.

The simplest example is a function that accepts one item or a list:

```python
# Don't do this.
def add_items(items: Item | list[Item]) -> None:
    if isinstance(items, Item):
        validate(items)
        save(items)
    else:
        for item in items:
            validate(item)
            save(item)
```

One item is a list of one item. Normalize it on the way in, and everything after
that is a single path:

```python
def add_items(items: Item | Iterable[Item]) -> None:
    if isinstance(items, Item):
        items = [items]
    for item in items:
        validate(item)
        save(item)
```

There is still one `if`, but it does not decide what work happens, only what
shape the input is in. The interesting logic exists once, so it is tested once,
fixed once, and cannot behave differently for one item than for many. Better
still, if every caller can pass a list, take only a list and let the type
checker remove the last branch for you.

The same move shows up in many forms:

- **The empty case.** `sum([])` is `0` and a loop over nothing does nothing. An
  `if not items: return 0` in front of code that already handles an empty
  collection is a branch with no job.
- **The default is a value of the general case.** "No paging" is a page starting
  at zero with no limit. "No filter" is a filter that matches everything. "No
  timeout" is an infinite one. Represent the default as that value instead of as
  a separate code path.
- **Neutral defaults instead of `None` checks.** An empty list, an empty dict, a
  no-op callback, or a logger that discards everything lets the code call
  through without asking whether the thing is there.
- **Old formats upgraded on read.** If a config file or message has two
  versions, convert version 1 to version 2 as soon as you load it, and write the
  rest of the code against version 2 only.
- **Synchronous as a batch of one.** If you already process requests in batches,
  a single synchronous request can be a batch of one rather than a separate
  path.

The pattern is the same each time: find the general case, move the translation
to the boundary, and make the middle of the code unaware that the special case
ever existed.

It is not always possible. If the special case genuinely does different work
(different validation, different side effects, different failure handling),
forcing it through the general path just moves the branch inside, where it is
harder to see. Fold cases that are the same work in a different shape, not cases
that are different work.

## Boring is a compliment

Great code is often boring code. It is simple, and it works. There is nothing in
it to admire, because everything in it is obvious: the names say what things
are, each function does what its name says, and the control flow goes where you
expect. Reading it, you think "well, of course", and that is the best reaction
code can get. Code that is exciting to read is exciting because it surprises
people, and surprises are what bugs are made of.

The same goes for the change that introduces it. If the review of your change is
quick and dull, that is usually a sign it was done well.

## Cleverness is a cost

Code is read far more often than it is written, usually by someone in a hurry
who did not write it. A clever one-liner saves its author a minute and costs
every reader five. If a piece of code needs a comment to explain how it works,
try writing the version that would not need one.
[Save comments for why](../comments/).

Simple code is also the code that is easy to test. When the
[first draft of a test](../../testing/shaping-code/#write-the-code-and-the-test-together)
is painful to write, complexity is usually what it is telling you about.
