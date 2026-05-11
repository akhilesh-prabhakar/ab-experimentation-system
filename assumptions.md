# Assumptions

## User Identity

- `user_id` is treated as an opaque string. The service does not validate its format, length, or uniqueness — that is the caller's responsibility.
- Any non-empty string is a valid `user_id`. Numeric IDs like `42` and UUIDs like `abc-123` are both accepted.

## Experiment Configuration

- Experiments are defined statically in `experiments.json` and loaded once at startup. There is no runtime API to create, update, or delete experiments.
- A change to `experiments.json` requires a container restart to take effect.
- `splitPercent` represents the percentage of traffic routed to the **first variant** (conventionally `control`). Remaining traffic is split evenly across all other variants.
- `splitPercent` must be between 0 and 99 inclusive. A value of 100 is rejected at startup because it makes all treatment variants permanently unreachable.
- Every experiment must have at least two variants. A single-variant experiment is a no-op and is rejected at startup.
- Disabled experiments (`"enabled": false`) are silently excluded from assignment results. No error is returned for them.

## Determinism

- The same `user_id` and experiment name will always produce the same variant, regardless of when or how many times the request is made, and regardless of container restarts.
- This guarantee holds as long as the experiment's `name`, `splitPercent`, and `variants` array order remain unchanged. Reordering variants or renaming an experiment will change assignments for existing users.

## Hashing

- MD5 is used purely as a deterministic bucketing function. It is not used for security, authentication, or any cryptographic purpose.
- The bucket space is 0–99 (100 buckets), which gives 1% granularity for traffic splits.

## Environment Configuration

- `dotenv` is used to load environment variables from `.env` at startup. While the service could read `process.env.PORT` directly without it, using `dotenv` is included to follow standard 12-factor app practices and make local development explicit.
- The `.env` file is not committed with secrets. It only contains `PORT` and `NODE_ENV`.

## Scope

- This service handles **variant assignment only**. It does not track exposures, record analytics, or store any user data.
- There is no authentication or rate limiting on the API. It is assumed to run in a trusted internal network or behind a gateway that handles those concerns.
- The service is stateless. Horizontal scaling is safe — any instance will return the same result for the same input.
