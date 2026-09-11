# Selected Defect Records

These records are taken from Cycle 1 of the ECL Operations Hub manual test
report. The complete log is available in
[`ECL-Hub-Test-Report-Cycle1.xlsx`](./ECL-Hub-Test-Report-Cycle1.xlsx).

## DEF-001: Browser tab title is identical on every route

| Field | Detail |
| --- | --- |
| Module | Navigation |
| Severity | Major |
| Priority | Medium |
| Status | Open |
| Related test | TC-NAV-003 |
| Environment | Chrome 140 on macOS, 1512 x 797 viewport |
| Standard | WCAG 2.1 SC 2.4.2 Page Titled, Level A |

### Steps to reproduce

1. Sign in.
2. Visit `/dashboard` and read the browser tab title.
3. Visit `/people` and read the browser tab title.
4. Visit `/tasks` and read the browser tab title.
5. Visit `/consultation-requests` and read the browser tab title.
6. Compare the four titles.

### Expected result

Each route sets a title naming the current page, such as `Tasks | ECL
Operations Hub`.

### Actual result

All four routes report the identical title, `ECL Operations Hub`. A user with
several tabs open cannot tell them apart, browser history and bookmarks are
indistinguishable, and a screen reader receives no page-specific title after
navigation.

### Scope of verification

Reproduced on four routes. Classified as Major because a documented Level A
accessibility requirement is not met, although navigation remains usable.

---

## DEF-005: Organizations list did not render

| Field | Detail |
| --- | --- |
| Module | Organizations |
| Initial severity | Critical |
| Priority | High |
| Final status | Closed, not a defect |
| Related test | TC-ORG-001 |
| Environment | Chrome 140 on macOS, automated background browser session and foreground re-test |

### First observation

The Organizations view remained in a loading state with zero rendered rows at
35, 102, and 139 seconds. The underlying data request had already returned
HTTP 200 at 2.31 seconds. Because a core list appeared unusable with no visible
workaround, the issue was initially raised as Critical.

### Investigation and re-test

1. Repeated the same navigation in a normal foreground session.
2. Confirmed that all organization records and expected columns rendered.
3. Compared the failing and passing environments.
4. Found `document.visibilityState` was `hidden` and
   `document.hasFocus()` was `false` during the failing runs.
5. Identified browser timer throttling in the background session as the source
   of the delayed render.

### Resolution

The finding did not reproduce under normal user conditions. It was closed as a
test-environment artifact, and TC-ORG-001 was re-run and passed. The record was
retained to show the evidence and reasoning behind the closure.

### QA decision

Keeping a Critical label after the foreground re-test would have overstated
product risk. Closing it prevented a false product defect from entering the
backlog while preserving a complete audit trail.
