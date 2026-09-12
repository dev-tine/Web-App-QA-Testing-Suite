# Defect Log: AVIIHAI HOA Management System

| Field | Value |
|---|---|
| Document ID | QA-AVI-DEF-001 |
| Build under test | v1.5 |
| Environment | https://aviihai.vercel.app, Chromium 1440 x 900 |
| Raised by | Destine April Fortaliza |
| Last updated | September 2026 |

## Severity definitions

| Severity | Definition |
|---|---|
| Critical | Core function unusable and no workaround exists. Blocks release. |
| Major | Function behaves incorrectly, or a documented standard is not met. A workaround exists. |
| Minor | Cosmetic or consistency issue. Does not block the user from completing a task. |

## Summary

| ID | Title | Severity | Standard | Status | Covered by |
|---|---|---|---|---|---|
| DEF-101 | Login fields are not programmatically labelled | Major | WCAG 2.1 SC 1.3.1, SC 4.1.2 | Open | TC-A11Y-105 |
| DEF-102 | Credentials fields declare no autocomplete | Minor | WCAG 2.1 SC 1.3.5 | Open | TC-A11Y-106 |
| DEF-103 | Login page exposes no main landmark | Minor | WCAG 2.1 SC 1.3.1 | Open | TC-A11Y-107 |
| DEF-104 | No automation hooks anywhere in the application | Minor | Testability | Open | TC-TEST-101, TC-NAV-010 |
| DEF-105 | Every route sets the same document title | Major | WCAG 2.1 SC 2.4.2 | Open | TC-NAV-007 |
| DEF-106 | Settings fields are not programmatically labelled | Major | WCAG 2.1 SC 1.3.1, SC 4.1.2 | Open | TC-SET-006 |
| DEF-107 | Landmark structure is inconsistent between routes | Minor | WCAG 2.1 SC 1.3.1 | Open | TC-NAV-008, TC-HOME-005 |
| DEF-108 | Header control has no accessible name | Minor | WCAG 2.1 SC 4.1.2 | Open | TC-NAV-009 |
| DEF-109 | A clearance can be recorded without an address or capitalization | Minor | Specification question | Open, awaiting decision | TC-CLR-007 |
| DEF-110 | Two list modules describe an empty result two different ways | Minor | Consistency | Open | TC-CLR-011 |
| DEF-111 | Every deep link and page refresh returns a 404 | Critical | Availability | Open | TC-AUTH-009 |
| DEF-112 | A failed logout request leaves the officer session open | Major | Session security | Open, intermittent dependency failure | TC-AUTH-007 |

---

## DEF-105, Major

**Title.** Every route sets the same document title.

**Severity.** Major.
**Standard.** WCAG 2.1 SC 2.4.2 Page Titled, Level A.

**Steps to reproduce.**

1. Sign in as an officer.
2. Open `/payments/add` and read the browser tab title.
3. Open `/clearance/add` and read the browser tab title.
4. Open `/settings` and read the browser tab title.
5. Compare the three titles.

**Expected result.** Each route sets a title that names the current view, for
example "New Payment, AVIIHAI".

**Actual result.** All six routes set the title "AVIIHAI".

**Impact.** A user with several tabs open cannot tell them apart. Browser
history entries and bookmarks are indistinguishable. A screen reader announces
no page change on navigation, so the user has no confirmation that the route
changed.

**Evidence.** Verified on `/`, `/payments/add`, `/payments/records`,
`/clearance/add`, `/clearance/records` and `/settings`.

---

## DEF-106, Major

**Title.** Settings fields are not programmatically labelled.

**Severity.** Major.
**Standard.** WCAG 2.1 SC 1.3.1 Info and Relationships, SC 4.1.2 Name, Role,
Value.

**Steps to reproduce.**

1. Sign in as an officer.
2. Open `/settings`.
3. Observe that a visible label sits beside every field.
4. Inspect any field and check for a `for` attribute, a wrapping label element
   or an `aria-label`.
5. Repeat for the payments and clearance forms.

**Expected result.** Every visible label is associated with its control, so
assistive technology announces the field name.

**Actual result.** No association exists on any control in the application.
Eleven fields on Settings, four on the payment form, eight on the clearance
form and two on the login form return an empty `labels` collection and carry no
`aria-label`.

**Impact.** A screen reader announces eleven fields on Settings as "edit text,
blank" with no indication of which office each one belongs to. Clicking a
visible label also fails to move focus into its field, which affects every user,
not only screen reader users.

**Fix.** Give each input an `id` and each label a matching `for`, or wrap the
input in its label element.

---

## DEF-107, Minor

**Title.** Landmark structure is inconsistent between routes.

**Severity.** Minor.
**Standard.** WCAG 2.1 SC 1.3.1 Info and Relationships.

**Steps to reproduce.**

1. Sign in as an officer.
2. Open `/payments/add` and inspect the document for `main` and `nav` elements.
3. Open `/settings` and inspect the document for the same elements.
4. Open `/` and inspect the document for the same elements.

**Expected result.** Every route exposes the same landmark skeleton.

**Actual result.** `/payments/add`, `/payments/records`, `/clearance/add` and
`/clearance/records` render both `main` and `nav`. The officer home and
`/settings` render neither.

**Impact.** Landmark navigation is unreliable. A user who learns to jump to the
main region on one screen finds the shortcut silently unavailable on another.

---

## DEF-108, Minor

**Title.** Header control has no accessible name.

**Severity.** Minor.
**Standard.** WCAG 2.1 SC 4.1.2 Name, Role, Value.

**Steps to reproduce.**

1. Sign in as an officer.
2. Inspect the icon only control in the application header.
3. Check for text content, `aria-label` or `title`.
4. Repeat on any other authenticated route.

**Expected result.** The control is announced by its purpose, for example
"Sign out".

**Actual result.** The control carries an icon and no accessible name, so it is
announced as "button". One such control is present on every authenticated
route.

**Impact.** A screen reader user cannot tell what the control does without
activating it. Since the control signs the user out, activating it to find out
is a destructive way to explore.

---

## DEF-109, Minor, awaiting decision

**Title.** A clearance can be recorded without an address or capitalization.

**Severity.** Minor.
**Type.** Specification question rather than a code defect.

**Steps to reproduce.**

1. Sign in as an officer.
2. Open `/clearance/add`.
3. Inspect the required state of each field.

**Expected result.** To be confirmed with the association. A business permit is
a legal record, so address, business type, capitalization, building type and
ownership would normally be mandatory.

**Actual result.** Only business name and owner are required. The remaining
five fields are optional, so a clearance can be issued against an incomplete
record.

**Impact.** Incomplete permit records. The correct behaviour needs confirming
before the rule is changed in either direction, which is why this is logged as
a question and not as a code fix.

---

## DEF-110, Minor

**Title.** Two list modules describe an empty result two different ways.

**Severity.** Minor.
**Type.** Consistency.

**Steps to reproduce.**

1. Sign in as an officer.
2. Open `/payments/records` and read the empty state text.
3. Open `/clearance/records` and read the empty state text.
4. Compare the two.

**Expected result.** One empty state pattern across the application.

**Actual result.** Payments shows "No records found for this date." Clearance
shows "No clearances found". One explains why the list is empty, the other does
not, and only one ends in a full stop.

**Impact.** Cosmetic. Recorded because inconsistent empty states are the point
at which a user starts wondering whether the screen is broken or simply empty.

---

---

## DEF-111, Critical

**Title.** Every deep link and page refresh returns a 404.

**Severity.** Critical.
**Type.** Availability and deployment configuration.

**Steps to reproduce.**

1. Open a new browser tab.
2. Paste the address of any route other than the site root, for example the settings route.
3. Press Enter.
4. Alternatively, sign in, navigate to any module, and press the browser refresh button.

**Expected result.** The application loads and shows the requested view, or
the login view when there is no session.

**Actual result.** The hosting provider answers with its own 404 page. The
document title is "404: NOT_FOUND" and the application never boots. Zero
inputs, zero headings and zero buttons render.

**Impact.** Bookmarks do not work. Links shared between officers do not work.
Pressing refresh on any screen but the first throws the user out of the
application entirely and shows an error page with no way back. For an
application used to record payments, losing the screen on a refresh means
losing whatever was being typed.

**Why it survived to production.** It is invisible to anyone clicking through
the application, because in-app navigation is handled by the router and never
requests a new document. It only appears on a fresh request, which is exactly
what a bookmark, a shared link and a refresh all are.

**Found by.** The automated preflight, not by a person reading the screen. The
suite reported the document title it actually received rather than only that a
locator was missing, and the title named the cause.

**Fix.** Add a rewrite that serves index.html for all unmatched paths. On
Vercel that is a `vercel.json` with a rewrite from `/(.*)` to `/`.

**Workaround in the suite.** Every spec enters at the site root and moves
between routes inside the running application. That workaround is temporary and
should be removed once the rewrite is deployed.

---

## DEF-112, Major

**Title.** A failed logout request leaves the officer session open.

**Severity.** Major.
**Type.** Session security and external dependency handling.

**Steps to reproduce.**

1. Sign in as an officer.
2. Select the icon-only sign-out control in the application header.
3. Observe the request to the Supabase `/auth/v1/logout` endpoint.
4. Reproduce while that request is blocked or returns an unsuccessful response.

**Expected result.** The local officer session is cleared and the user returns
to the login view even when global server-side revocation cannot complete. The
application may also show that global logout was not confirmed.

**Actual result.** When the logout request was blocked by CORS in the GitHub
Actions environment, the application stayed on the officer home and retained
the authenticated session for at least 25 seconds.

**Impact.** A user who selected sign out can leave the device believing the
session ended when it remains usable. Refreshing the page still exposes the
authenticated application.

**Evidence.** Playwright run `34678903382` captured the failed network request,
browser CORS error, retained root URL, screenshot, video and trace. The issue is
intermittent because the same path has completed successfully in other runs.

**Fix.** Handle the logout promise explicitly. Clear the local session and
return to the login view even when global revocation fails, then record or show
the dependency error separately. Confirm that the Supabase project permits the
production origin for logout requests.

**Automation handling.** TC-AUTH-007 still requires the correct logout
behaviour. It becomes an expected failure only when the logout endpoint is
observed failing and the session remains open. A successful logout passes, while
an unexplained retained session still fails the build.

## Note on a finding that was retracted

A previous cycle against a different application raised a Critical rendering
defect that turned out to be an artefact of driving a background browser tab,
where the browser throttles the timers the render path depends on. It was
retracted and closed as not a defect, and the reasoning was kept in the record.

The practice that came out of it is applied here: no timing or rendering
observation is raised as a defect without a foreground re test. Details are in
`manual-testing/case-studies/ecl-operations-hub/README.md`.
