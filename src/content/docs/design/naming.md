---
title: "Name things for what they are"
description:
  "Helper, common, base, lib, util, and manager say nothing about what is
  inside. A name that fits anything ends up holding everything."
sidebar:
  order: 7
---

`helper`, `common`, `base`, `lib`, `util`, `misc`, `shared`, `manager`. These
are lazy names. They tell you nothing about what the code does, only that
someone needed somewhere to put it and did not want to decide where.

The real problem is not that they are vague. It is what vague names attract. A
module called `dates` has an obvious rule for what belongs in it. A module
called `utils` has none, so everything fits:

```text
utils.py
  parse_iso_date()
  slugify()
  retry()
  send_welcome_email()
  chunk()
  load_feature_flags()
```

Six functions with nothing in common except the file they live in. Every module
that needs `slugify` now imports something that also knows how to send email and
read feature flags. Nobody can say what `utils` is for, so nobody can say what
does not belong there, and it only ever grows. The same goes for `common/`
directories, `BaseService` classes that every service inherits from for one
method, and `StringHelper`, which helps strings with whatever the last person
needed.

## Name it for what it does

The fix is the decision the name avoided. Split the dumping ground by what each
piece is about:

```text
dates.py         parse_iso_date()
text.py          slugify()
retry.py         retry()
onboarding.py    send_welcome_email()
flags.py         load_feature_flags()
```

`chunk()` went to the one caller that used it. A function only one module needs
is not shared code.

Each name now says what is inside, which also says what is not. A reviewer
seeing a new function in `dates.py` can tell at a glance whether it belongs
there. Nobody can do that for `utils.py`.

## If you cannot name it, it is two things

When the honest name for a module is `stuff_for_orders_and_also_logging`, that
is not a naming problem. The code does two unrelated jobs, and the vague name
was hiding it. Split it, and the names come easily.

The same test works for classes and functions. `OrderManager` usually means
"everything that touches an order": validation, pricing, persistence, and the
email. A function called `process_data` or `handle` has the same smell. If the
specific name is long, or needs an "and", the thing is doing too much.

## Names say what things are

A name is a claim. A directory called `containers/` that holds services which
are not containers is worse than a vague name, because it tells the reader
something false, and they will believe it. When what a thing is changes, rename
it in the same change.

## Where the generic name is the convention

Some generic names are imposed by the tools: Rust's `lib.rs` and `mod.rs`,
Python's `__init__.py`, Go's `internal/`. Those are fine, because everyone knows
what they mean and the tool decides what goes in them. Keep them thin: a
`lib.rs` that declares modules, not one that holds the code.
