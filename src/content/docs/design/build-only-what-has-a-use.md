---
title: "Build only what has a use"
description:
  "Don't build features, options, or extension points nobody needs yet. Think
  hard about one-way doors, but build nothing speculative."
sidebar:
  order: 2
---

Do not build functionality that does not have a use yet. Not the option nobody
passes, not the config setting nobody changes, not the second storage backend,
not the plugin system for one plugin.

Speculative code looks free because nobody is using it. It is not free:

- Everyone who touches the code around it has to read it, understand it, and
  keep it compiling.
- It has to be tested, and it cannot be tested well, because there is no real
  caller to say what correct behavior is. You end up asserting your own guesses.
- It encodes assumptions about a future that has not happened. When the real
  need arrives it rarely matches the guess, and now you have to work around or
  unpick code that is already there.
- It never gets the feedback that real use provides, so its bugs sit
  undiscovered until the day someone finally relies on it.

"We will need it eventually" is an argument for building it eventually. By then
you will know what it actually needs to do, and adding it then almost always
costs less than carrying a wrong version until then.

```python
# Don't do this.
def export(
    report: Report,
    fmt: Literal["json", "csv", "xml"] = "json",
    compress: bool = False,
    encoding: str = "utf-8",
) -> bytes: ...
```

If every caller is `export(report)`, that is one real code path and five that
have never run, plus whatever a different encoding does to each of them. Write
`export_json(report)`. When someone needs CSV, they will tell you what CSV means
to them.

## Leave the door open, don't walk through it

The exception is a decision that is expensive to reverse: a public API, a wire
format, a database schema, an identifier other systems store. Those deserve
thought about what is likely to come, because changing them later means
migrating data or breaking callers you do not control.

Thinking ahead there means leaving room, not building the future. Put a version
in the URL or the message. Use an opaque ID as the primary key instead of an
email address. Give an event a `type` field even though there is only one type
today. Each of those costs almost nothing now and makes the future change cheap.
None of them is a feature.

Everything else, which is most code, is a door you can walk back through. Build
the smallest thing that does the job, and change it when the job changes.

## Delete what has lost its use

The same reasoning works in reverse. Code whose last caller went away is
speculative code that used to be real. Delete it. Version control remembers it
if you were wrong.
