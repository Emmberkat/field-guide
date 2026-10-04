---
title: "Don't abstract early"
description:
  "Duplicate first. Extract an abstraction once a few real call sites show what
  is shared and what varies."
sidebar:
  order: 3
---

An abstraction is cheap to create and expensive to change. That asymmetry is the
whole argument for waiting.

Creating one takes a few minutes: pull the shared lines into a function, a base
class, or an interface. Changing one later is a different job, because by then
everything that uses it depends on its shape, and every assumption it made is
load-bearing for someone.

So wait until a few places do the same thing. Two similar pieces of code might
be a coincidence. Three or four real call sites tell you what is actually
shared, what actually varies, and what the thing should be called. An
abstraction extracted from real code paths is informed by them. One designed up
front is informed by guesses, and guesses about how code will vary are wrong
more often than they are right.

## What an early abstraction turns into

It usually goes like this. Two places send an email, so someone writes
`send_notification`. Then a third place needs SMS. Then one caller needs it to
be urgent, another needs a daily digest, and another needs to ignore
unsubscribes because it sends security notices:

```python
# Don't do this.
def send_notification(
    user: User,
    message: str,
    *,
    channel: Literal["email", "sms"] = "email",
    urgent: bool = False,
    digest: bool = False,
    template: str | None = None,
    respect_unsubscribe: bool = True,
) -> None: ...
```

Every new case that did not fit the original assumption became a parameter, and
every parameter is a branch inside. The callers use a handful of the
combinations, the function supports all of them, and nobody can tell which ones
matter. It is now harder to understand than the duplicated code it replaced, and
harder to change, because every caller depends on it. That is not a failure of
the person who wrote it. It is what happens to an abstraction designed before
the cases it had to cover existed.

The duplicated version would have been three or four short functions, each
obvious and each free to change on its own. If they still shared a few lines
once the cases had settled, a small helper for just those lines would have been
the right abstraction, and by then it would have been obvious what it was.

## Duplication is cheaper than the wrong abstraction

Duplicated code costs you some repeated effort when the shared behavior changes.
The wrong abstraction costs you every time any caller's behavior changes,
because each change has to be threaded through something everyone shares.

Code that looks the same is not always the same, either. Two validation
functions with identical bodies today, one for invoices and one for user
profiles, change for different reasons and on different schedules. Merging them
couples two things that have nothing to do with each other, and the first time
one of them needs to change, you add a flag.

## Getting out of a wrong abstraction

When an abstraction has grown flags, the fastest way out is usually backwards.
Inline it into each caller, delete the branches each caller does not use, and
look at what is left. Often each caller is now short and clear, and nothing
needs to be shared. If a real common piece remains, extract that, and only that.

## Seams are not speculation

The testing chapter recommends
[typing an injected collaborator](../../testing/shaping-code/#3-inject-what-is-left)
as a `Protocol` or an interface. That is not an early abstraction. It has two
implementations from the day it is written, the real one and the test stand-in,
and it describes only the methods its caller actually uses. What I am arguing
against is the abstraction built for callers that do not exist yet.
