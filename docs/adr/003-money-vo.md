# ADR-003: Money Value Object

- Status: Accepted

## Decision
- No `number` for money in domain or DB.
- DB: BIGINT minor units
- Domain: `Money` VO with `add, subtract, multiply, allocate`
- `allocate` is penny-safe (distributes remainder)

## Consequences
- Prevents floating point errors, currency mismatch
- All financial calculations auditable
