---
title: "Design"
description:
  "Keep code cheap to change: keep it simple, build only what has a use,
  abstract late, prefer immutable values, comment only the surprises, contain
  your dependencies, name things for what they are, and compose instead of
  inheriting."
sidebar:
  order: 0
  label: "Overview"
---

Most code that is painful to work with is not wrong. It is harder to change than
it needs to be: more moving parts than the problem has, features nobody uses,
abstractions shaped around guesses, and state that can change behind your back.
Changing code is most of what we do, so everything in this chapter is about
keeping that cheap.

1. [Keep it simple](./keep-it-simple/)
2. [Build only what has a use](./build-only-what-has-a-use/)
3. [Don't abstract early](./dont-abstract-early/)
4. [Prefer immutability](./prefer-immutability/)
5. [Comment the surprises](./comments/)
6. [Contain your dependencies](./contain-dependencies/)
7. [Name things for what they are](./naming/)
8. [Compose, don't inherit](./composition/)

The first is the principle. The rest are the places I most often see it broken.
