# Test Plan: AVIIHAI HOA Management System

| Field | Value |
|---|---|
| Document ID | QA-AVI-PLAN-001 |
| Version | 1.0 |
| Author | Destine April Fortaliza |
| Application | AVIIHAI HOA Management System |
| Build under test | v1.5 |
| Environment | https://aviihai.vercel.app |
| Status | Active |

---

## 1. Purpose

This plan defines what is tested in the AVIIHAI application, how it is tested,
what is deliberately excluded, and the conditions under which a build is
considered releasable.

AVIIHAI is a homeowners association back office used by association officers to
record dues payments and to issue business clearance permits. Two things follow
from that:

1. The records it produces are financial and quasi legal, so data integrity
   matters more than visual polish.
2. The officers who use it are not full time computer users, so accessibility
   and error prevention are functional requirements, not nice to have.

## 2. Scope

### In scope

| Module | Routes | Coverage |
|---|---|---|
| Authentication | `/login` | Field presence, constraint validation, credential rejection, session persistence, sign out, access control on protected routes |
| Officer home | `/` | Module launcher, backup actions, console health |
| Payments | `/payments/add`, `/payments/records` | Form structure, required fields, street reference list, numeric input handling, records view, filter, search, empty state, export controls |
| Business clearance | `/clearance/add`, `/clearance/records` | Form structure, three reference lists, required fields, history view, search, empty state |
| Settings | `/settings` | Officer roster, board of directors, contacts, save control, field input |
| Cross cutting | all routes | Heading structure, landmarks, document titles, accessible names, document language, automation hooks |

### Out of scope

| Area | Reason |
|---|---|
| Record creation, edit and delete | The only available environment is a live demo database. Automated writes on every push would pollute it and make results non repeatable. |
| Excel and PDF export file contents | Requires download handling and file parsing. Planned for cycle 2. |
| Offline capture and sync | Requires network state manipulation. Planned for cycle 3. |
| PIN protected administrative actions | Requires an admin PIN that is not available to the demo account. |
| Backup payments and backup clearances | Both trigger a file write. Deferred with the export cases. |
| Load, stress and security penetration testing | Out of remit for a functional cycle. |

## 3. Approach

### 3.1 Non destructive automation

The suite runs against a live application on every push. No spec submits a form
or writes a record.

Required field behaviour is still verified, through the Constraint Validation
API rather than through a submit attempt. The suite reads
`form.checkValidity()` and each control's `validity.valueMissing`, which is
exactly what the browser itself consults before allowing a submit. The
assertion is equivalent, and nothing reaches the database.

The limitation is stated rather than hidden: this proves the browser will block
an invalid submit. It does not prove the server rejects one. Server side
validation is listed in section 7 as the first thing a seeded environment would
unlock.

### 3.2 Known defects and the build badge

A defect that has been found, reproduced and documented should not keep failing
a pipeline as if it were news. Cases that assert the correct behaviour of a
known open defect are marked `test.fail()`. Playwright treats them as expected
failures, so:

- The build stays green while the defect is open.
- The test still runs, so the moment the defect is fixed the case starts
  passing and Playwright reports it as an unexpected pass.

In other words, the suite tells the team when a bug is fixed rather than
requiring someone to remember to re enable a test.

### 3.3 Flaky cases are defects in the suite

A case that fails on one run and passes on the next teaches the team to ignore
the pipeline, which costs more than the case was ever worth. Retries are off in
this suite for that reason: a retry hides the instability instead of reporting
it.

The suite failed two or three random cases per run when it was first assembled.
The causes were found and removed rather than papered over:

| Cause | Why it produced a random failure | Fix |
|---|---|---|
| The wait after a route change looked for the level one heading | That heading is the module name, so it reads the same on both payment views and on both clearance views. The wait passed against the heading left over from the previous route and the assertions ran against a view that had not swapped yet. | Wait for the level two heading, which is unique per route. |
| Route changes were driven through the History API | The router settled at its own pace and a fixed sleep was sometimes short. | Reach every route by clicking the module card and the Add or History tab, the way an officer does. It removes the race and tests the navigation on the way past. |
| Sign out was clicked the moment the control appeared | The click sometimes landed before the handler was attached, so the session survived and the next assertion saw an address still inside the application. | Wait for the control and for the network to go quiet before clicking. |
| Sign out was exercised by two cases | The second one repeated the whole flow just to build its own precondition, giving one journey two chances to fail. | Merged into one case that signs out and then checks the protected route. |

Verified by three consecutive green runs on identical code, two of them started
by hand with no commit in between. One green run proves nothing about a suite
that fails intermittently, which is the trap this section exists to record.

### 3.4 Missing credentials

The authenticated suite skips, with a readable reason, when `DEMO_EMAIL` and
`DEMO_PASSWORD` are absent. A missing secret on a fork or a pull request
produces a skip, not a false failure. Credentials are never committed.

### 3.5 Selector strategy

The application exposes no `data-testid`, `id` or `name` attributes on its
controls, recorded as DEF-104. Selectors therefore use, in order of preference:

1. Accessible role and name, `getByRole`.
2. Heading level.
3. Placeholder text.
4. Input type.

Placeholder based selectors break when copy changes. That fragility is a
consequence of DEF-104 and is the argument for fixing it.

## 4. Environments

| Item | Value |
|---|---|
| Application | https://aviihai.vercel.app, production demo build |
| Browsers | Chromium desktop at 1440 x 900, and Pixel 7 mobile emulation |
| Runner | GitHub Actions, ubuntu-latest, Node 20 |
| Framework | Playwright Test |
| Retries | 1 in CI, 0 locally |
| Workers | 1, so the shared demo database is never hit concurrently |
| Artifacts | HTML report, trace, video and screenshot retained on failure |

## 5. Entry criteria

- The application is reachable and returns a login page.
- Demo credentials are present in the environment.
- Dependencies install and Playwright browsers are provisioned.

## 6. Exit criteria

A cycle is complete when:

- Every planned case has been executed or has a documented reason for not being
  executed.
- Every failure is either an open defect with a reproduction, or a documented
  environment artefact.
- No new Critical or Major defect is open without a decision recorded against
  it.
- The CI run is green, with expected failures accounted for in the defect log.

## 7. Deferred scope and what would unlock it

| Deferred area | Blocker | Unlocked by |
|---|---|---|
| Payment creation, edit, delete | Live demo database | A seeded staging environment with per run teardown |
| Server side validation | Cannot submit safely | The same seeded environment |
| Clearance PDF generation | File download handling | Playwright download fixtures against a staging build |
| Excel and PDF export contents | File parsing | A parser step in CI, plus a staging build |
| Offline sync | Network state manipulation | Playwright network interception, cycle 3 |
| PIN protected actions | No admin PIN for the demo account | A dedicated automation account |

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Testing against a live demo database | A careless write corrupts real demonstration data | No spec submits a form. The rule is enforced by review, and stated at the top of every spec file. |
| Placeholder based selectors | Copy changes break the suite | Documented as DEF-104. Selector strategy is centralised in the page objects so a fix is a single file change. |
| Background tab throttling in automated browsers | False timing and rendering defects | Learned the hard way on a previous cycle. See the retraction note in the ECL Operations Hub case study. Timing observations are not raised as defects without a foreground re test. |
| Single test account | No role based coverage | Accepted for this cycle. Recorded as a gap. |

## 8a. Open questions

Things that are known, reproducible in one environment, and not yet explained.
They are recorded here rather than raised as defects, because a finding that
has not been reproduced under normal conditions is not yet a finding. The
reason that rule exists is written up in the ECL Operations Hub case study.

| Question | What is known | Status |
|---|---|---|
| The sign in form intermittently fails to render inside forty seconds at the Pixel 7 viewport on the CI runner | The same code renders reliably at the desktop viewport in the same run, and the mobile evidence captures at the same viewport succeed. Both projects share one build, one network path and one account. | Under investigation. The mobile project is scoped to the responsive evidence captures until it is understood, so that an unexplained environment behaviour does not redden every run. |
| Deep links return a 404 | Fully reproduced and understood | Raised as DEF-111, Critical |

The mobile scoping is a deliberate, reversible decision recorded in
`playwright.config.js`. Full mobile coverage returns the moment the render
behaviour is explained.

## 9. Deliverables

- Playwright suite under `automation-tests/tests`.
- Environment preflight at `automation-tests/global-setup.js`, which reports why a run did not execute.
- Traceability matrix at `automation-tests/docs/aviihai-coverage-matrix.md`.
- Defect log at `docs/DEFECT-LOG.md`.
- Evidence screenshots, regenerated by CI, at `manual-testing/screenshots`.
- HTML report published as a CI artifact on every run.
