# Room viewing and deposit workflow

## Policy

- All timestamps are persisted as UTC. The UI renders them in the browser's local timezone.
- A viewing must be requested at least two hours in advance.
- The server-calculated deposit is one month of the room's `BasePrice`; client amounts are validated against it.
- A room may be held for 1–30 days.
- `TransactionId` is optional, unique when supplied, and makes repeated payment requests idempotent.

## State transitions

Viewing bookings follow `Pending -> Approved | Rescheduled | Rejected | Cancelled`,
`Rescheduled -> Approved | Rejected | Cancelled`, and
`Approved -> Completed | NoShow | Cancelled`.

Deposits are created as `Holding`. Owner confirmation changes them to `Active` and changes the
room to `Deposited`. Refund, forfeiture, expiry, or release ends the hold. The expiry worker runs
every five minutes and does not release a room that already has an Active or Pending contract.

## Endpoints

Tenant endpoints are under `/api/tenant/viewing-bookings` and `/api/tenant/deposits`.
Owner endpoints are under `/api/owner/viewing-bookings` and `/api/owner/deposits`.
Every endpoint derives the actor from the JWT name-identifier claim and applies room/booking ownership checks.

Important transitions create both an `AuditLog` and a user `Notification`. Workflow errors use the
common `{ success: false, message, errors }` response shape; invalid transitions and conflicts return HTTP 409.

## Operations

Apply migration `AddRoomViewingAndDepositWorkflow` before enabling the feature. The hosted expiry
worker is registered with the API process, so multiple API instances may observe the same candidates;
row-version concurrency and terminal status predicates keep processing idempotent.
