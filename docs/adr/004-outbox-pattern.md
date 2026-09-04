# ADR-004: Outbox Pattern

- Status: Accepted

## Decision
- Any state change that needs external side effect (ZATCA, webhook) writes to `outbox_events` in same transaction
- Relay worker reads PENDING with `FOR UPDATE SKIP LOCKED` and delivers
- `processed_consumer_events` ensures idempotency for consumers

## Rationale
Prevents dual-write problem: order saved but ZATCA failed without trace.
