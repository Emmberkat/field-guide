---
title: "Contain your dependencies"
description:
  "Keep a library inside the part of the code that uses it, and once you have
  picked it, use it the way it was meant to be used."
sidebar:
  order: 6
---

Every dependency is a decision someone will want to revisit: a major version
with breaking changes, a different database, a library whose maintainer moved
on. How much that costs depends on two things: how far the dependency has
spread, and how much of your code was written around it instead of with it.

## Keep it where it is used

A library belongs to the part of the code that needs it. The database library
belongs to the persistence layer. The HTTP framework belongs to the code that
handles requests. Nothing else should know either one exists.

The pressure to let it spread is usually small and sounds reasonable. The
boundary costs conversions: a row becomes a domain object, a domain ID becomes
something the query builder accepts. They are repetitive, and the quickest way
to delete them is to teach the domain types about the library, with a derive, an
annotation, or a base class, so they can go straight into queries. Now the core
of the program imports the ORM, everything that uses those types builds against
it, and swapping the database touches the whole codebase instead of one module.

A few conversions at the boundary are the price of being able to change what is
behind it. Pay it. If the conversions are noisy, clean them up inside the
boundary, with a helper, a mapping function, or a typed row class. That is a
problem for the module that owns the dependency, not a reason to hand the
dependency to everyone else.

The same goes for what crosses the boundary on the way out. If the repository
returns the ORM's own objects, the library has leaked even though nobody else
imports it, and it brings company: lazy loading, sessions that have to stay
open, and fields that exist only because the table has them. Return your own
types.

This is the cheapest way I know to
[leave a door open](../build-only-what-has-a-use/#leave-the-door-open-dont-walk-through-it).
You do not build the second database backend. You just make sure that the day
you need one, it is one module's problem.

## Use the tool you picked

Once a dependency is in, use it properly. Choosing an ORM and then passing it
SQL strings and unpacking tuples by position gets you the cost of the ORM and
none of what you picked it for.

This happens most after a port. Each call is translated one for one from the old
tool into the new one, everything compiles, the tests pass, and the result is
the old tool's code in the new tool's syntax. The signs:

- **None of the features you switched for.** No mapped classes, no
  relationships, no generated queries. Just the old queries, rewritten.
- **Hand-written conversions** everywhere the new tool would have done them for
  you.
- **Several shapes for the same table.** One for reading, one for inserting, one
  for each join, because each query was translated on its own. One table should
  have one representation.

A port is the time to ask what the new tool's version of each piece looks like,
not just whether the old piece compiles. In Python with SQLAlchemy, the
translated version looks like this:

```python
# Don't do this.
def fetch_user(session: Session, user_id: UserId) -> User | None:
    row = session.execute(
        text("SELECT id, name, email FROM users WHERE id = :id"),
        {"id": user_id},
    ).first()
    if row is None:
        return None
    return User(id=UserId(row[0]), name=row[1], email=row[2])
```

It works, and `mypy --strict` accepts it. It also accepts it with `row[1]` and
`row[2]` swapped, because every column of that row is `Any`. Only a test would
notice.

Using the tool instead:

```python
class UserRow(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    email: Mapped[str]

    def to_user(self) -> User:
        return User(id=UserId(self.id), name=self.name, email=self.email)


def fetch_user(session: Session, user_id: UserId) -> User | None:
    row = session.get(UserRow, user_id)
    return row.to_user() if row else None
```

The table is described once, every column is typed, and the query is one call.
Both versions keep SQLAlchemy inside the repository: callers get a plain `User`
either way, and `UserRow` never leaves the module.

Sometimes the tool cannot express what you need: a conflict clause, a collation,
a query the planner only gets right by hand. Drop to raw SQL for that one query,
on purpose, and [say why](../comments/#comment-where-you-break-the-norm). That
is different from never having picked the tool up.
