# Traceability Matrix: AVIIHAI HOA Management System

Every automated case, the module it covers, the type of check it performs, and
the defect it is tied to where one exists.

Cases marked **Expected fail** assert the correct behaviour of a known open
defect. They are annotated `test.fail()` in the suite, so the pipeline stays
green while the defect is open and reports an unexpected pass the moment it is
fixed.

Plan: [`../../docs/TEST-PLAN.md`](../../docs/TEST-PLAN.md).
Defects: [`../../docs/DEFECT-LOG.md`](../../docs/DEFECT-LOG.md).

## Authentication

| Case | Scenario | Type | Priority | Result | Defect |
|---|---|---|---|---|---|
| TC-AUTH-001 | The application loads and renders the sign in form | Smoke | High | Pass | |
| TC-AUTH-002 | The root path sends an unauthenticated visitor to the login view | Security | High | Pass | |
| TC-AUTH-003 | Rejected credentials keep the user on the login page | Negative | High | Pass | |
| TC-AUTH-004 | A protected route is not shown to a visitor without a session | Security | High | Pass | |
| TC-AUTH-005 | A valid demo account reaches the officer home | Smoke | High | Pass | |
| TC-AUTH-006 | The session survives a page reload | Functional | Medium | Pass | |
| TC-AUTH-007 | Signing out ends the session and closes the protected routes | Security | High | Pass | |
| TC-AUTH-009 | A deep link resolves to the application | Availability | Critical | Expected fail | DEF-111 |

## Login page, field level

| Case | Scenario | Type | Priority | Result | Defect |
|---|---|---|---|---|---|
| TC-LOGIN-001 | Renders the email field, password field and submit control | Smoke | High | Pass | |
| TC-LOGIN-002 | Marks both credentials fields as required | Functional | High | Pass | |
| TC-LOGIN-003 | Masks the password field | Security | High | Pass | |
| TC-LOGIN-004 | Sets a page title | Functional | Low | Pass | |
| TC-LOGIN-005 | Blocks submission when both fields are empty | Negative | High | Pass | |
| TC-LOGIN-006 | Rejects a malformed email address | Negative | Medium | Pass | |
| TC-LOGIN-007 | Blocks submission when the password is empty | Negative | Medium | Pass | |
| TC-LOGIN-008 | Rejects an unknown account and stays on the login route | Negative | High | Pass | |
| TC-LOGIN-009 | Signs a valid officer in and leaves the login route | Smoke | High | Pass | |
| TC-LOGIN-010 | Keeps the session across a reload | Functional | Medium | Pass | |

## Accessibility, login page

| Case | Scenario | Standard | Result | Defect |
|---|---|---|---|---|
| TC-A11Y-101 | Declares a document language | SC 3.1.1 | Pass | |
| TC-A11Y-102 | Exposes exactly one level one heading | SC 1.3.1 | Pass | |
| TC-A11Y-103 | Gives every button an accessible name | SC 4.1.2 | Pass | |
| TC-A11Y-104 | Gives every image an alt attribute | SC 1.1.1 | Pass | |
| TC-A11Y-105 | Programmatically labels every form control | SC 1.3.1, SC 4.1.2 | Expected fail | DEF-101 |
| TC-A11Y-106 | Declares autocomplete on the credentials fields | SC 1.3.5 | Expected fail | DEF-102 |
| TC-A11Y-107 | Exposes a main landmark | SC 1.3.1 | Expected fail | DEF-103 |
| TC-TEST-101 | Exposes stable automation hooks | Testability | Expected fail | DEF-104 |

## Officer home

| Case | Scenario | Type | Priority | Result | Defect |
|---|---|---|---|---|---|
| TC-HOME-001 | The officer home identifies the signed in account | Smoke | High | Pass | |
| TC-HOME-002 | All three module cards are present with their descriptions | UI | High | Pass | |
| TC-HOME-003 | Both backup actions are offered | UI | Medium | Pass | |
| TC-HOME-004 | The officer home loads without console errors | Health | Medium | Pass | |
| TC-HOME-005 | The officer home exposes a main landmark | Accessibility | Medium | Expected fail | DEF-107 |

## Navigation and cross route structure

| Case | Scenario | Type | Priority | Result | Defect |
|---|---|---|---|---|---|
| TC-NAV-001 | Every authenticated route loads and renders exactly one h1 | Smoke | High | Pass | |
| TC-NAV-002 | `/clearance` redirects to the clearance add form | Routing | Medium | Pass | |
| TC-NAV-003 | The module cards route to the right modules | Navigation | High | Pass | |
| TC-NAV-004 | The Add and History tabs switch between the payment views | Navigation | High | Pass | |
| TC-NAV-005 | The Add and History tabs switch between the clearance views | Navigation | High | Pass | |
| TC-NAV-006 | The document language is declared on every route | Accessibility | Medium | Pass | |
| TC-NAV-007 | Each route sets a distinct document title | Accessibility | High | Expected fail | DEF-105 |
| TC-NAV-008 | Every route exposes a main landmark | Accessibility | Medium | Expected fail | DEF-107 |
| TC-NAV-009 | Every button exposes an accessible name | Accessibility | Medium | Expected fail | DEF-108 |
| TC-NAV-010 | Stable automation hooks exist on the main routes | Testability | Low | Expected fail | DEF-104 |

## Payments

| Case | Scenario | Type | Priority | Result | Defect |
|---|---|---|---|---|---|
| TC-PAY-001 | The new payment form renders its heading and every control | Smoke | High | Pass | |
| TC-PAY-002 | The amount field is numeric and the name field is text | Functional | Medium | Pass | |
| TC-PAY-003 | The street list offers the six subdivision streets | Data | High | Pass | |
| TC-PAY-004 | Payer name and amount are required, notes are optional | Functional | High | Pass | |
| TC-PAY-005 | An empty form fails constraint validation before submit | Negative | High | Pass | |
| TC-PAY-006 | A filled form passes constraint validation, without submitting | Functional | High | Pass | |
| TC-PAY-007 | The amount field rejects non numeric text | Negative | Medium | Pass | |
| TC-PAY-008 | The records view renders heading, filter, search and exports | Smoke | High | Pass | |
| TC-PAY-009 | The records view shows a collected total | Functional | Medium | Pass | |
| TC-PAY-010 | A search with no match shows the empty state, not an error | Negative | Medium | Pass | |
| TC-PAY-011 | The records view loads without console errors | Health | Medium | Pass | |

## Business clearance

| Case | Scenario | Type | Priority | Result | Defect |
|---|---|---|---|---|---|
| TC-CLR-001 | The new clearance form renders its heading and every control | Smoke | High | Pass | |
| TC-CLR-002 | The form exposes three select lists | UI | Medium | Pass | |
| TC-CLR-003 | The permit type list offers new, renewal and others | Data | High | Pass | |
| TC-CLR-004 | The building type list offers rented and owned | Data | Medium | Pass | |
| TC-CLR-005 | The ownership list offers the three legal structures | Data | Medium | Pass | |
| TC-CLR-006 | Business name and owner are required | Functional | High | Pass | |
| TC-CLR-007 | Address and capitalization are required on a permit record | Functional | Medium | Expected fail | DEF-109 |
| TC-CLR-008 | Capitalization accepts a numeric amount | Functional | Medium | Pass | |
| TC-CLR-009 | The history view renders heading, search and bulk select | Smoke | High | Pass | |
| TC-CLR-010 | A search with no match shows the empty state, not an error | Negative | Medium | Pass | |
| TC-CLR-011 | Both list modules use one empty state pattern | Consistency | Low | Expected fail | DEF-110 |

## Settings

| Case | Scenario | Type | Priority | Result | Defect |
|---|---|---|---|---|---|
| TC-SET-001 | The settings route renders its three sections | Smoke | High | Pass | |
| TC-SET-002 | Every officer role has its own field | Functional | High | Pass | |
| TC-SET-003 | The contacts section captures a label and a number | Functional | Medium | Pass | |
| TC-SET-004 | The save control is present and reachable | UI | Medium | Pass | |
| TC-SET-005 | Officer fields accept input | Functional | Medium | Pass | |
| TC-SET-006 | Every settings field has a programmatic label | Accessibility | High | Expected fail | DEF-106 |
| TC-SET-007 | The settings route loads without console errors | Health | Medium | Pass | |

## Evidence capture

These specs exist to produce the screenshots in
`manual-testing/screenshots`. CI commits the output back to the repository on
every push, so the evidence is regenerated from the live application rather
than pasted in by hand.

| Case | Capture | Viewport |
|---|---|---|
| EV-001 | Login page, default state | Desktop |
| EV-002 | Login page, native validation on empty submit | Desktop |
| EV-003 | Login page, rejected credentials | Desktop |
| EV-004 | Officer home | Desktop |
| EV-005 | New payment form | Desktop |
| EV-006 | New payment form, constraint validation on an empty form | Desktop |
| EV-007 | Payment records, empty state | Desktop |
| EV-008 | New clearance form | Desktop |
| EV-009 | Clearance history, empty state | Desktop |
| EV-010 | Settings, officer roster | Desktop |
| EV-011 | Login page | Mobile, Pixel 7 |
| EV-012 | New payment form | Mobile, Pixel 7 |

## External

| Case | Scenario | Type |
|---|---|---|
| TC-SMOKE-001 | The portfolio homepage responds and renders | Smoke |

## Deferred scope

Reasons and unblocking conditions are in
[`../../docs/TEST-PLAN.md`](../../docs/TEST-PLAN.md), section 7.

| Module | Deferred scenario | Blocker |
|---|---|---|
| Payments | Create, edit, delete a payment record | Live demo database |
| Payments | Excel and PDF export file contents | Download handling and file parsing |
| Clearance | Create a clearance, generate and reprint the PDF | Live demo database, download handling |
| Settings | Persist officer, director and contact changes | Would overwrite the live roster on every run |
| Offline sync | Capture offline, sync on reconnect | Network state manipulation |
| Security | PIN protected edits and deletes | No admin PIN on the demo account |
