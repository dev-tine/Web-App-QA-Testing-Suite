# API Testing with Postman CLI

[![Postman API Tests](https://github.com/dev-tine/Web-App-QA-Testing-Suite/actions/workflows/api-tests.yml/badge.svg)](https://github.com/dev-tine/Web-App-QA-Testing-Suite/actions/workflows/api-tests.yml)

This section contains two deliberately separate bodies of evidence.

1. **Academic Postman work:** sanitized exports from ten school API activities,
   covering 81 saved requests across CRUD, authentication, OTP, nested
   resources, filtering and workflow transitions. The original localhost
   backends are no longer available, so these files are historical evidence,
   not claimed as a runnable regression suite.
2. **Runnable QA case study:** a deterministic task API, a Postman collection
   with positive and negative assertions, and the supported Postman CLI in CI.

## Start here

| Evidence | Location |
| --- | --- |
| Academic scope and limitations | [`docs/ACADEMIC-COVERAGE.md`](./docs/ACADEMIC-COVERAGE.md) |
| API test plan | [`docs/TEST-PLAN.md`](./docs/TEST-PLAN.md) |
| Case-to-requirement traceability | [`docs/TRACEABILITY-MATRIX.md`](./docs/TRACEABILITY-MATRIX.md) |
| Runnable Postman collection | [`postman/qa-showcase.postman_collection.json`](./postman/qa-showcase.postman_collection.json) |
| Safe local environment | [`postman/local.postman_environment.json`](./postman/local.postman_environment.json) |
| Sanitized academic exports | [`postman/academic-sanitized/`](./postman/academic-sanitized/) |
| Deterministic mock service | [`mock-api/server.js`](./mock-api/server.js) |

## Runnable coverage

| Latest verified local run | Result |
| --- | ---: |
| Requests | 13 passed, 0 failed |
| Assertions | 64 passed, 0 failed |
| Repeatability check | 2 clean runs, including an alternate local port |

The regression collection covers:

- service health and response metadata;
- valid and invalid login;
- bearer-token authorization and a missing-token negative case;
- list, create, retrieve, update and delete operations;
- invalid payload and missing-resource error contracts;
- JSON schema, value, type, header and response-time assertions;
- collection variables for token and resource-ID chaining;
- teardown verification that the deleted resource is no longer retrievable.

The mock API exists only to make the test suite reproducible. It is not listed
as a software-development project and it does not replace the original school
systems.

## Run locally

```bash
cd api-testing
npm ci
npm run test:api
```

The runner starts the isolated API, waits for readiness, executes the
collection, writes `reports/postman-cli-report.json`, and shuts the API down.

To use another free local port:

```bash
BASE_URL=http://127.0.0.1:4020 npm run test:api
```

You can also import the collection and environment under `postman/` into the
Postman desktop application and run them with Collection Runner.

## Evidence policy

- Synthetic credentials only.
- No original access token, OTP, password, password hash or personal email is
  committed.
- Historical collection structure is preserved, but results are not invented.
- CI output is the source of truth for the runnable collection.
