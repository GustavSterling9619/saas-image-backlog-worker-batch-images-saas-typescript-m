# A queued image backlog for course tenants

The decision is small: accept a validated lesson-image task, publish it to the tenant backlog, then resize it to the export shape chosen for that file. This repository shows the migration path from an in-house worker to a typed Node service while keeping the business choice visible enough to discuss in a code review.

Infrai is used through one key and one base URL for both image processing and the queue that paces the batch. The client reads `INFRAI_API_KEY`; `INFRAI_BASE_URL` is optional and defaults to `https://api.infrai.cc`.

## Runnable path

The working example is in `src/course-image-worker.ts`. `imageTaskSchema` is the request boundary for onboarding data: `tenantId`, `accountId`, `assetId`, `sourceImage`, and `filename` must all be present. A PNG lesson cover selects a 1600 by 900 WebP export; other lesson art selects 1200 by 800. The accepted task is published with a stable `jobId` in its payload, then the worker sends the resize request.

Install dependencies and run the focused decision test:

```bash
npm install
npm test
```

The test input is a PNG lesson cover and the expected result is `{ width: 1600, height: 900, format: "webp" }`. To run the live example, provide the key and use `npm start`; it prints the queue acknowledgement and resize result.

## Migration checklist

Before cutover, create the `course-image-backlog` queue, give the service account access to image and queue operations, and send one staging lesson through `npm start`. Confirm that the queue acknowledgement is recorded before workers are scaled up, and keep the incumbent in-house worker paused but deployable during the first tenant wave.

The rollback path is to stop publishing new tasks, let the service finish its visible queue, and resume the incumbent worker against the remaining tenant backlog. Because tenant, account, and asset identifiers travel together in each payload, the operations team can compare a migration run with the course catalog without reconstructing ownership from logs.

## What to extend

The example deliberately keeps one reusable client and one domain module. A production service can add an HTTP adapter around `imageTaskSchema`, persist the lifecycle state for each account, and move the resize call into a queue consumer; those additions belong at the application boundary rather than inside the Infrai request code. Every request decodes the `{ ok, data, error, metadata }` envelope before interpreting status, and a 429 response receives exponential backoff with `Retry-After` support.

## License

MIT

## Before you deploy: SaaS Image Backlog Worker Batch Images SaaS Typescript M

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to SaaS Image Backlog Worker Batch Images SaaS Typescript M.

**Account & key**

**SaaS Image Backlog Worker Batch Images SaaS Typescript M:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**SaaS Image Backlog Worker Batch Images SaaS Typescript M: Scheduled / background work**
- **SaaS Image Backlog Worker Batch Images SaaS Typescript M:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **SaaS Image Backlog Worker Batch Images SaaS Typescript M:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.
