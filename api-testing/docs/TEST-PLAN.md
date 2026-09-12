# API Test Plan: QA Portfolio Mock Service

| Field | Value |
| --- | --- |
| Document ID | QA-API-PLAN-001 |
| Author | Destine April Fortaliza |
| Test client | Postman collection executed by Postman CLI |
| Environment | Deterministic local Node.js mock service |
| Data policy | Synthetic data only, reset at the start of every run |

## Objective

Demonstrate a reproducible API regression workflow without relying on the ten
missing academic backends or inventing new results for them.

## In scope

- Health and service metadata.
- Valid and invalid authentication.
- Bearer-token enforcement.
- Task listing, creation, retrieval, update and deletion.
- Required-field validation and not-found handling.
- Status codes, JSON contracts, response headers, response time and data types.
- Dynamic token and resource-ID chaining.

## Out of scope

- Load, stress, penetration and concurrency testing.
- Real identity-provider behaviour or token cryptography.
- Database persistence beyond one isolated run.
- The unavailable academic backend implementations.

## Entry criteria

- Node.js 20 or later is installed.
- Dependencies install from `package-lock.json`.
- Port 4010 is available, or `BASE_URL` points to another local port.

## Exit criteria

- All requests execute.
- All assertions pass with zero failures.
- The JSON report is produced under `reports/` locally and uploaded by CI.
- No credential, token or personal data is committed.

## Risk controls

| Risk | Control |
| --- | --- |
| Test-order dependency | Reset state first, then chain only IDs created during the same run |
| Shared or stale test data | Start an isolated service process and reset it before assertions |
| Secret exposure | Use synthetic credentials and a disposable local token |
| False claim that school APIs still run | Keep sanitized historical collections separate from the runnable case study |
| Timing flakiness | Use a generous one-second contract for a local functional suite, not a performance claim |
