# Professional Manual QA Scope

The public case studies in this repository use applications and records that
can be shared safely. My larger professional QA work remains private, but its
aggregate scope and the testing method are documented here.

## Verified scope

- Authored 15 structured QA workbooks covering 5,209 planned scenarios
- Manually executed 615 test cases
- Logged 19 QA and UI defects and 36 smoke-test observations
- Tested admin, web, Android, and iOS surfaces across staged test cycles
- Performed functional, UI, validation, role-permission, regression, smoke, and UAT testing
- Worked with developers and project stakeholders to reproduce issues, clarify impact, and verify fixes

## High-impact finding

During role-permission testing, I found an access-control issue where changing
a record identifier allowed one authenticated user to reach another user's
request. I verified the behavior, documented the affected action and user
impact, and escalated it for investigation. The fix was applied across the
platform rather than only to the first affected form.

The underlying ticket and screenshots are not published because they contain
private product and team information.

## Testing workflow used

1. Break each module into scenarios and expected behavior.
2. Separate cases by platform and user role when behavior or permissions differ.
3. Record preconditions, steps, expected result, actual result, environment, and status.
4. Use explicit execution states: Passed, Failed, Blocked, Not Executed, and Not Testable.
5. Link failed cases to defect IDs, screenshots, and video evidence where available.
6. Summarize progress by module, platform, cycle, and status using formula-driven dashboards.
7. Retest fixes in the next cycle and preserve the original observation for traceability.

## Public evidence of the same method

The [ECL Operations Hub manual case study](./case-studies/ecl-operations-hub/)
shows the same habits in a publishable format: structured test cases, exact
actual results, status tracking, severity decisions, WCAG references, summary
charts, defect records, and documented re-test judgment.

The [AVIIHAI coverage matrix](../automation-tests/docs/aviihai-coverage-matrix.md)
shows how stable regression cases were translated into executable Playwright
checks without replacing the manual investigation behind the test design.

## Confidentiality boundary

No private employer workbook, internal URL, customer record, credential,
ticket screenshot, colleague name, or proprietary product detail is included
in this repository. Public samples are sanitized or recreated against
publishable applications.
