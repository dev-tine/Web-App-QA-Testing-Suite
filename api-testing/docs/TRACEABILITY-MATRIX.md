# API Regression Traceability Matrix

| Case | Requirement or risk | Method and endpoint | Expected result |
| --- | --- | --- | --- |
| API-SET-001 | Every run starts with known data | `POST /__reset` | State resets and the service confirms success |
| API-HLT-001 | Service exposes a stable health contract | `GET /health` | `200`, JSON response, `status: ok` |
| API-AUTH-001 | Valid credentials create an authenticated session | `POST /auth/login` | `200`, bearer token captured for later requests |
| API-AUTH-002 | Invalid credentials cannot authenticate | `POST /auth/login` | `401` with a structured error contract |
| API-AUTH-003 | Protected data cannot be read anonymously | `GET /tasks` | `401` when the bearer token is missing |
| API-TASK-001 | Reset removes stale test data | `GET /tasks` | `200` with an empty array |
| API-TASK-002 | A valid task can be created | `POST /tasks` | `201`, schema-valid task, ID captured for chaining |
| API-TASK-003 | The created task can be retrieved | `GET /tasks/:id` | `200` and returned values match the created record |
| API-TASK-004 | An existing task can be updated | `PATCH /tasks/:id` | `200` and changed fields are persisted |
| API-TASK-005 | Required fields are enforced | `POST /tasks` | `400` for an empty title with a useful field message |
| API-TASK-006 | Unknown resource IDs fail predictably | `GET /tasks/TASK-9999` | `404` with a structured error contract |
| API-TASK-007 | An existing task can be deleted | `DELETE /tasks/:id` | `204` with no response body |
| API-TASK-008 | Deletion removes the resource | `GET /tasks/:id` | `404` after deletion |

Collection-level checks also validate the JSON content type, parseable response
bodies, request ID format, and a one-second response-time contract for every
applicable response.
