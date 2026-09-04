# ADR-001: Modular Monolith

- Status: Accepted
- Date: 2026-09-04
- Deciders: Senior Architect

## Context
Need to choose between microservices vs monolith for cloud POS.

## Decision
Start as Modular Monolith with strict module boundaries enforced by lint.

## Consequences
- Single deployable, single DB, ACID transactions across modules.
- Each module can be extracted later as service if needed.
- Must enforce `no cross-domain imports` via ESLint rule.
