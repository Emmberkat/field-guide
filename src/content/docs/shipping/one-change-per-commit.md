---
title: "One change per commit"
description: "Every commit is one complete change that builds, passes its tests, and is safe to deploy on its own."
sidebar:
  order: 1
---

A commit is one complete change. Not a feature plus the refactor it
needed plus a formatting sweep you did along the way: one of those. And
every commit, on its own, builds, passes the tests, and is safe to
deploy. No half-done code.

## Why it matters

A history of complete, single-purpose commits is a tool. A history of
whatever you had at 5pm is a log.

- Reverting is safe. Reverting a commit removes exactly one change and
  leaves code that worked before. Reverting one that also carried an
  unrelated fix removes the fix too.
- Bisecting works. `git bisect` can only find the change that broke
  something if every commit along the way builds and runs. One broken
  commit in the middle and bisect can no longer tell you anything about
  that stretch of history.
- Review stays focused. A reviewer can hold one change in their head.
  Mix three, and they will review the most obvious one carefully and
  skim the other two, which is exactly where the bug will be.
- Any commit can ship. If every commit is safe to deploy, nobody has to
  ask whether the one about to go out is in the middle of something.
- The history explains itself. A year from now, `git blame` on a line
  should land on a commit whose message says why that line exists, not
  on "WIP" or "fix tests".

## Separate mechanical changes from behavior changes

A rename, a file move, a reformat, or a dependency bump touches a lot of
lines and changes no behavior. On its own it is easy to review, because
the reviewer only has to confirm that it is mechanical. Mixed into a
behavior change, it buries the dozen lines that matter under hundreds
that do not. Move a file and edit it in the same commit, and the diff
may show a delete and an add instead of a change, which hides the edit
completely.

So refactor in one commit and change behavior in the next. If a change
is hard to make, first make the code easy to change, ship that, and then
make the change.

## Big changes are a sequence of small complete ones

One change per commit does not mean a big feature lands in one enormous
commit. It means it arrives as a sequence of commits, each complete in
itself:

1. Refactors that make room, with no change in behavior.
2. The new path alongside the old one, with its tests, used by one real
   caller.
3. The remaining callers, moved over.
4. The old path, deleted.

Every step builds, passes, and is safe to deploy. At no point is there
code that is half-written, or written and waiting for a caller that has
not arrived yet. That second kind is just [speculative
code](../../design/build-only-what-has-a-use/) with extra steps.

That sequence is for replacing something, where the old code gives you
callers to move over. A brand-new feature has no caller except its
users, so the first slice has to be something a user can actually use:
a landing page, one endpoint, one step of a flow, the narrowest version
that works end to end. It does not need to be feature complete, but it
has to work, build, and pass its tests, and then each later commit adds
to something that already runs. What it must never be is code that sits
completely dead on `main`, waiting for the rest of the feature to arrive
before anything can reach it.

Tests go in the same commit as the code they test. Code without its
tests is not a complete change, and a separate "add tests" commit
afterwards means the commit before it shipped untested. The [testing
chapter](../../testing/shaping-code/#write-the-code-and-the-test-together)
has more on writing them together.

## Feature flags are for rollout, not for hiding unfinished code

A flag that controls who can see a feature is fine. Turn it on for an
internal alpha deployment, for staff, or for a few percent of customers,
and leave it off for everyone else. The code behind it is still live: it
runs, people use it, and you find out whether it works. It is dead to
external customers, not dead in the code.

A flag that hides code nobody can reach is the thing to avoid. If the
flag is off everywhere, so nothing exercises the new path except, maybe,
a test that turns the flag on, the feature is not being built
incrementally. It is being built on a branch that happens to live on
`main`. And every flag doubles the paths through the code it guards:
the on path and the off path both have to be tested, kept working, and
understood, where without the flag there would be one. A few of those
interacting and nobody knows which combinations actually run in
production.

So keep flags few and short-lived:

- Ship the first usable slice behind a rollout flag, to an audience that
  will actually use it, and grow it from there.
- Turn it on for more people as it earns trust, not when it is
  "finished".
- Delete the flag as soon as the feature is on for everyone, so there is
  one code path again. Deleting it is part of shipping the feature, not
  cleanup for later.

How thin the first slice can be, and who it goes to, depends on the
feature. That is a judgment call every time. The part that does not
change is that it runs somewhere real.

## One commit per pull request

A pull request is reviewed as a unit, merged as a unit, and reverted as
a unit, so it should be one change as well: one commit, squashed if the
work took several. If it needs several commits to be reviewable, it is
several pull requests. Stack them and land them in order.

The commits you made while working ("fix typo", "address review", "try
again") are a record of your afternoon, not of the change. Squash them
before merging. Nobody needs them in the history, and they break the
rule that every commit is complete.

## Messages say why

The diff already says what changed. The subject line names the change in
a phrase that makes sense in `git log --oneline`. The body says why it
was needed, what you considered, and anything a future reader would
otherwise have to rediscover.

"Fix bug" says nothing. "Retry uploads on 503 from the storage API" says
what. A body that adds "the storage API returns 503 during its nightly
compaction, so without a retry the 2am export fails every night" says
why, and saves the next person an investigation.
