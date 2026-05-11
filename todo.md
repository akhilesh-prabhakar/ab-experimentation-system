# Todo / Known Gaps

These are things I would add given more time, roughly in priority order.

## High Priority

### Hot-reload for experiment config
Currently, any change to `experiments.json` requires a container restart. A file watcher (e.g. `fs.watch`) could reload the config in-place without downtime. The main risk is a brief window where in-flight requests see the old config while new ones see the new config — acceptable for most A/B use cases, but worth documenting.

### Exposure tracking endpoint
The service assigns variants but has no way to record that a user was actually exposed to an experiment. A `POST /exposure` endpoint that accepts `{ user_id, experiment, variant }` and writes to a local log or append-only file would close this gap without adding external dependencies.

### Per-variant `splitPercent` weights
The current model uses a single `splitPercent` for the control variant and divides remaining traffic evenly across treatments. A more flexible model would allow per-variant weights (e.g. `[50, 30, 20]`), which is how most production experimentation systems work.

## Medium Priority

### Input sanitisation on `user_id`
Currently any non-empty string is accepted. In practice, very long strings or strings with special characters could be used to probe the system. A max-length check and character allowlist would be a cheap defensive measure.

### Structured error codes as an enum
Error codes like `INVALID_USER_ID` and `EXPERIMENT_NOT_FOUND` are currently plain strings scattered across the controller. Centralising them as a TypeScript enum or const object would make them easier to document and test against.

### Integration / smoke test
The unit tests cover the hash utilities. A lightweight integration test that spins up the Express app and fires real HTTP requests (using `supertest`) would give confidence that the routing, validation, and response shape are all wired correctly end-to-end.

## Lower Priority

### Admin API
A `GET /experiments` endpoint to list all loaded experiments (names, enabled status, variant names) would make it easier to inspect the running config without shelling into the container.

### Metrics endpoint
A `GET /metrics` endpoint exposing request counts and assignment distribution per experiment (in Prometheus text format) would make it easy to verify that traffic is splitting as expected without needing a full observability stack.

### Bucket distribution verification
The MD5-based bucketing is assumed to be uniform across 0–99. A small offline script that samples a large number of user IDs and plots the bucket distribution would verify this empirically and catch any skew.
