# Academic Postman Coverage

## Source and disclosure boundary

These collections were created by Destine April Fortaliza for ten academic API
activities. The original API projects are no longer available, so the
historical collections are not presented as currently executable tests.

The portfolio copies under `postman/academic-sanitized` retain the original
request structures while removing test credentials, tokens, OTP values, and
personal email addresses. The original 92-page response documentation is kept
private because it contains those values.

## Original collection inventory

| Activity | API | Requests in export | Coverage demonstrated |
| --- | --- | ---: | --- |
| 1 | To-Do | 6 | Root health and task CRUD |
| 2 | Notes | 9 | Registration, login, bearer token, CRUD, soft delete and restore |
| 3 | Bookshelf | 17 | Authors, categories, books, borrow workflow and CRUD |
| 4 | Weather | 2 | Query parameters, current conditions and forecast payloads |
| 5 | Social | 6 | Registration, login, token handoff and post CRUD |
| 6 | Movie Reviews | 8 | Movie and review CRUD, nested resource lookup |
| 7 | Project Tracker | 9 | Health, users, projects, task filtering and status updates |
| 8 | Chatrooms | 6 | Rooms, nested messages and deletion |
| 9 | E-Commerce | 8 | Products, users, cart, order creation and status changes |
| 10 | Events | 10 | OTP, registration, login, events, attendance and organizer actions |
| **Total** | **10 APIs** | **81 requests** | **GET, POST, PUT, PATCH and DELETE workflows** |

The response document contains 82 documented requests because it includes a
book-return request that is absent from the exported Activity 3 collection.
That discrepancy is retained here instead of silently changing the historical
count.

## What the original work proves

- Postman request construction across all common HTTP methods.
- Headers, JSON bodies, path variables and query parameters.
- Response-code, response-time and response-body inspection.
- Multi-request workflows such as register, login, create, retrieve, update and
  delete.
- Bearer-token use and one scripted collection-variable handoff.

## What it does not prove

The original exports contain no assertion suite and the original localhost
backends cannot be rerun. They prove manual API exploration and workflow
validation, not a current automated API regression run.

The runnable `QA Portfolio API Regression` collection was added separately to
demonstrate the next step: automated assertions, positive and negative cases,
schema checks, dynamic variable chaining, deterministic setup, Postman CLI
execution, and CI reporting.
