# Backend-Controlled A/B Experimentation System

A stateless, backend-driven A/B experimentation service. Given a `user_id`, it deterministically assigns that user to a variant for each active experiment and returns the configuration a frontend needs to render the correct experience.

The core property is **determinism without state**: the same `user_id` + experiment name always produces the same variant, across repeated requests and container restarts, because assignment is computed via a hash — nothing is stored.

---

## Build

```bash
docker build -t ab-experimentation .
```

## Run

```bash
docker run --rm -p 8080:8080 ab-experimentation
```

Or with Docker Compose (mounts `experiments.json` as a read-only volume):

```bash
docker compose up
```

The service listens on HTTP port `8080`.

---

## Trigger the core functionality

Required test command:

```bash
curl "localhost:8080/experiment?user_id=42"
```

Returns assignments for all enabled experiments:

```json
{
  "status": "success",
  "data": [
    {
      "user_id": "42",
      "experiment": "checkout-button-color",
      "variant": "control",
      "config": {
        "button_color": "blue",
        "button_text": "Buy Now"
      }
    },
    {
      "user_id": "42",
      "experiment": "homepage-banner",
      "variant": "control",
      "config": {
        "banner_text": "Welcome back!",
        "show_discount": false
      }
    }
  ]
}
```

To query a single experiment:

```bash
curl "localhost:8080/experiment?user_id=42&experiment=checkout-button-color"
```

To verify determinism: run the same curl multiple times, then stop and restart the container and run it again. The variant for the same `user_id` must be identical every time.

Health check:

```bash
curl "localhost:8080/health"
```

---

## Architecture

```
src/
├── index.ts                    # Entry point — starts server, handles SIGTERM
├── app.ts                      # Express wiring: middleware, routes, 404, error handler
├── config/
│   └── experiments.config.ts   # Loads and validates experiments.json at startup (fail-fast)
├── controllers/
│   └── experiment.controller.ts # HTTP layer: validates query params, formats responses
├── services/
│   └── experiment.service.ts   # Assignment logic
├── models/
│   └── experiment.model.ts     # TypeScript interfaces
├── routes/
│   └── experiment.routes.ts    # Route definitions
├── middlewares/
│   ├── requestLogger.ts        # Structured JSON request logging
│   └── errorHandler.ts         # Global error handler
└── utils/
    └── hash.ts                 # Deterministic bucketing (+ hash.test.ts)
experiments.json                # Experiment definitions
```

**Why file-backed config?** The assignment rules out external services. Loading config once at startup keeps request handling predictable, avoids disk I/O on every request, and fails loudly at boot if the config is malformed — rather than silently at request time.

**Why stateless hashing?** No database writes on assignment, no session state, no coordination between instances. The hash function is the source of truth. Horizontal scaling is safe — any instance returns the same result for the same input.

---

## Assignment logic

For each enabled experiment:

1. Build a stable key: `experimentName:userId`
2. Hash it with MD5 (Node's built-in `crypto` — no external dependency)
3. Convert the first 8 hex chars to an integer, mod 100 → bucket `0–99`
4. Map the bucket to a variant using `splitPercent`

`splitPercent` is the share of traffic going to the first variant (control). Remaining traffic is split evenly across all other variants. Supports N variants, not just A/B.

MD5 is used only as a deterministic bucketing function — not for security or cryptography.

---

## Environment variables

| Variable   | Default       | Description              |
|------------|---------------|--------------------------|
| `PORT`     | `8080`        | HTTP port to listen on   |
| `NODE_ENV` | `development` | Runtime environment      |

A `.env` file is used to load these at startup via `dotenv`. Technically the service could read `process.env.PORT` directly without it, but using `dotenv` follows standard 12-factor app practice and makes local configuration explicit and portable.

---

## Running tests

```bash
npm install
npm test
```

Tests cover the hash utilities (`getBucket`, `resolveVariantIndex`) including edge cases: `splitPercent=0`, `splitPercent=100`, single-variant experiments, and 3-variant distribution.

---

## Local development without Docker

```bash
npm install
npm run build
npm start
```

---

## What's included

- Dockerized local execution (single-stage build, multi-stage Dockerfile)
- `GET /health` liveness endpoint
- Structured JSON request and error logs
- Graceful shutdown on `SIGTERM`
- Startup validation for `experiments.json` (fail-fast)
- Multi-variant support (not just A/B)
- Unit tests for core bucketing logic
- `assumptions.md` — design assumptions made during implementation
- `todo.md` — known gaps and next steps

## Constraints

- Runs locally with Docker
- No cloud services or external SaaS dependencies
- No Kubernetes
- Core HTTP functionality exposed on port `8080`

---

## Acknowledgements

Built with Node.js, TypeScript, Express, and Node's built-in `crypto` module.

I used LLMs (Claude, ChatGPT) throughout — for scaffolding, review, and wording. All architecture decisions, trade-offs, and logic are my own.
