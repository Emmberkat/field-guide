---
title: "Comment the surprises"
description:
  "No comment where the code already says it. Comments are for what is not
  obvious and for where the code deliberately breaks the norm."
sidebar:
  order: 5
---

The default is no comment. If the code already says what it does, a comment that
says it again adds nothing, and it is not free:

- Every reader has to read it.
- Every change has to keep it accurate, and nothing checks that it is. The
  compiler checks the code. Nothing checks the comment.
- When it drifts, it lies. A comment that no longer matches the code is worse
  than no comment, because the reader has to work out which one to believe, and
  they usually pick the comment.

So comments are reserved for the two places where the code cannot speak for
itself: where it does something that is not immediately obvious, and where it
deliberately breaks the norm.

## Say it in code first

A comment that explains what the code does is usually a name that has not been
written yet.

```python
# Don't do this.
# Check whether the user can edit the document.
if user.role in (Role.OWNER, Role.EDITOR) and not document.locked:
    ...
```

```python
if can_edit(user, document):
    ...
```

The function name says what the comment said, and unlike the comment, it cannot
quietly go out of date: change what `can_edit` means and every caller changes
with it. The same goes for a well-named variable, a constant instead of a magic
number, or a type that makes the bad value impossible. And comments that narrate
each step (`# loop over the orders`, `# return the total`) tell the reader
nothing they could not see faster by reading the line underneath.

## Comment what is not obvious

Comment when a competent reader who knows the codebase would be surprised,
confused, or tempted to "fix" the code. Those comments say why, because the code
already says what:

```python
try:
    invoices = billing.list_invoices(account_id)
except NotFound:
    # The billing API returns 404, not an empty list, for an account
    # that has never been invoiced. That is not an error here.
    invoices = []
```

Without that comment, the next person to read this code sees an exception being
swallowed, assumes it is a bug, and removes it. Other things in the same
category:

- A workaround for a bug or quirk in something you do not control. Link the
  upstream issue, so whoever reads it later can check whether it is still
  needed.
- An ordering constraint that is not visible in the code: this must run before
  that, or the cache serves stale data.
- A choice made for performance that makes the code less obvious than the simple
  version. Say what you measured.
- Something that looks wrong and is not.

## Comment where you break the norm

If the codebase does something one way everywhere, and this code does it
differently on purpose, say so. Otherwise the deviation looks like a mistake,
and a well-meaning reviewer or a later refactor will bring it back in line.

```python
def shutdown() -> None:
    # Not using the shared HTTP client: this runs during its shutdown
    # hook, after its connection pool has already been closed.
    with httpx.Client() as client:
        client.post(DEREGISTER_URL, json={"instance": INSTANCE_ID})
```

The more often the norm is enforced, by a lint rule, a review comment, or a
[guide like this one](../../shipping/reviewing-code/#repeated-comments-are-a-missing-mechanism),
the more important the comment is. If a lint rule has to be suppressed for the
line, the suppression is the place for it:
`# noqa: TID251 -- runs before the clock is configured`, not a bare `# noqa`.

## Documentation comments are different

Docstrings and Javadoc on a public function, class, or module are fine, and
often worth writing. They are not commentary on the code. They are part of the
interface, written for callers who will never read the body, and editors and
documentation tools show them at the call site.

Make them say what the signature cannot: what the function promises, what it
does on bad input, what it raises or returns when things go wrong, units, and
anything a caller has to know before calling it. A docstring that only restates
the name and the parameter types (`"""Get the user."""` on
`get_user(user_id: str) -> User`) is the same wasted comment as any other.

## Delete commented-out code

Commented-out code is not documentation. It is code that was not quite deleted,
it rots immediately because nothing compiles or tests it, and every reader has
to wonder whether it matters. Delete it. Version control remembers it. ruff's
`ERA001` rule flags it automatically, which is the
[durable option](../../shipping/reviewing-code/#repeated-comments-are-a-missing-mechanism)
over asking for it in review.
