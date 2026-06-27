# AVIIHAI Automation Coverage Matrix

## Project

AVIIHAI HOA Administrative System

## Automation Scope - Version 1

This coverage matrix identifies the first set of test scenarios selected for Playwright automation. The initial automation scope focuses on authentication, protected route behavior, and dashboard navigation because these are high-priority workflows that are stable, repeatable, and important for smoke and regression testing.

## Coverage Matrix

| Test ID  | Requirement Source | Module               | Test Scenario                                                                   | Priority | Test Type          | Automation Status | Playwright File                   | Notes                                                                  |
| -------- | ------------------ | -------------------- | ------------------------------------------------------------------------------- | -------- | ------------------ | ----------------- | --------------------------------- | ---------------------------------------------------------------------- |
| AUTH-001 | US-A1              | Authentication       | Verify that the login page loads successfully                                   | High     | Smoke              | Passed           | `tests/aviihai-auth.spec.js`      | Checks if the login page opens and required login elements are visible |
| AUTH-002 | US-A1              | Authentication       | Verify that a user can log in using valid demo credentials                      | High     | Smoke / Functional | Passed           | `tests/aviihai-auth.spec.js`      | Uses demo account credentials stored in `.env`                         |
| AUTH-003 | US-A1              | Authentication       | Verify that invalid login credentials show an error message                     | High     | Negative           | Passed           | `tests/aviihai-auth.spec.js`      | Confirms that the system rejects invalid credentials                   |
| AUTH-004 | Business Rule 1    | Access Control       | Verify that unauthenticated users are redirected when opening a protected route | High     | Security / Routing | Planned           | `tests/aviihai-auth.spec.js`      | Confirms that protected pages cannot be accessed without login         |
| AUTH-005 | US-A2              | Authentication       | Verify that a logged-in user can log out successfully                           | Medium   | Functional         | Planned           | `tests/aviihai-auth.spec.js`      | Confirms that logout returns the user to the login page                |
| DASH-001 | US-B1              | Dashboard            | Verify that the dashboard loads after successful login                          | High     | Smoke              | Planned           | `tests/aviihai-dashboard.spec.js` | Confirms that the user reaches the dashboard after login               |
| DASH-002 | US-B1              | Dashboard            | Verify that dashboard navigation cards or module links are visible              | High     | Smoke / UI Check   | Planned           | `tests/aviihai-dashboard.spec.js` | Checks for Payments, Clearances, and Settings access points            |
| DASH-003 | US-B1              | Dashboard Navigation | Verify that the user can navigate to the Payments module                        | Medium   | Navigation         | Planned           | `tests/aviihai-dashboard.spec.js` | Confirms that the Payments module can be opened from dashboard         |
| DASH-004 | US-B1              | Dashboard Navigation | Verify that the user can navigate to the Business Clearances module             | Medium   | Navigation         | Planned           | `tests/aviihai-dashboard.spec.js` | Confirms that the Clearances module can be opened from dashboard       |
| DASH-005 | US-B1              | Dashboard Navigation | Verify that the user can navigate to the Settings module                        | Medium   | Navigation         | Planned           | `tests/aviihai-dashboard.spec.js` | Confirms that the Settings module can be opened from dashboard         |

## Deferred Automation Scope

The following areas are included in the system requirements but are not part of the first automation batch because they require more test data, deeper setup, or advanced validation.

| Module              | Deferred Scenario                                            | Reason                                                          |
| ------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Payments            | Create, edit, delete, search, and export payment records     | Requires stable test data and cleanup strategy                  |
| Business Clearances | Create clearance, generate PDF, reprint, and bulk export     | Requires form data planning and file validation                 |
| Settings            | Update officers, directors, contacts, and layout coordinates | Requires admin PIN and careful data reset                       |
| Offline Sync        | Save offline payment and sync after reconnect                | More advanced browser/network state testing                     |
| Security Controls   | PIN-protected edits and deletes                              | Requires admin PIN handling and positive/negative test coverage |
| Reporting           | Excel and PDF file validation                                | Requires download handling and file content verification        |

## Automation Priority

1. Login page smoke test
2. Valid login test
3. Invalid login test
4. Protected route redirect test
5. Dashboard visibility test
6. Dashboard module navigation tests
7. Payment creation test
8. Search and filter tests
9. PIN-protected action tests
10. Export and file validation tests

## Notes

* Credentials should be stored in a `.env` file and excluded from GitHub using `.gitignore`.
* Playwright tests should use stable locators such as labels, roles, button names, placeholders, and meaningful text.
* The first automation batch should focus on simple smoke and navigation tests before moving to data creation, exports, offline sync, and PIN-protected workflows.
* Failed tests should be reviewed to confirm whether the issue is caused by a real application bug, incorrect test data, unstable locator, or wrong expected result.
* Real application bugs found during automation should be documented separately in Jira with steps to reproduce, actual result, expected result, environment, and evidence.
