# Manual QA Evidence

This folder contains executed manual testing work, not placeholder templates.
The main sample is a complete functional and accessibility test cycle for the
ECL Operations Hub.

## Start with the ECL case study

| Evidence | Open |
| --- | --- |
| Professional manual QA scope and confidentiality boundary | [`PROFESSIONAL-SCOPE.md`](./PROFESSIONAL-SCOPE.md) |
| Case-study walkthrough and findings | [`case-studies/ecl-operations-hub/README.md`](./case-studies/ecl-operations-hub/README.md) |
| Downloadable Excel test report | [`ECL-Hub-Test-Report-Cycle1.xlsx`](./case-studies/ecl-operations-hub/ECL-Hub-Test-Report-Cycle1.xlsx) |
| Selected defect records in GitHub-readable format | [`SELECTED-DEFECT-RECORDS.md`](./case-studies/ecl-operations-hub/SELECTED-DEFECT-RECORDS.md) |
| Execution summary preview | [`execution-summary.png`](./case-studies/ecl-operations-hub/evidence/execution-summary.png) |
| Test-case preview | [`test-cases.png`](./case-studies/ecl-operations-hub/evidence/test-cases.png) |
| Defect-log preview | [`defect-log.png`](./case-studies/ecl-operations-hub/evidence/defect-log.png) |

## What the manual cycle demonstrates

- Scope definition, exclusions, entry conditions, and test method
- Functional, UI, navigation, empty-state, and accessibility testing
- Test cases with preconditions, numbered steps, expected results, and actual results
- Severity and priority assignment backed by user impact
- Reproducible defects with environment and standards references
- Retesting and closure of a false positive after identifying a test-environment artifact
- Non-destructive testing against live data
- Front-end timing checks using browser APIs instead of stopwatch estimates

## Results at a glance

| Metric | Result |
| --- | ---: |
| Test cases designed | 26 |
| Test cases executed | 21 |
| Passed | 17 |
| Failed | 4 |
| Not run, with reasons documented | 5 |
| Defects raised | 5 |
| Open defects | 4 |
| Closed as not a defect after re-test | 1 |

## Other evidence in this folder

[`screenshots/`](./screenshots/) contains AVIIHAI application screenshots
captured by the Playwright evidence spec and refreshed by CI. Those files
support the automated test suite and are separate from the ECL manual cycle.

## Privacy and evidence handling

The ECL application is an internal operations system. The public case study
therefore includes sanitized test records and rendered report previews. It does
not publish credentials, private URLs, customer data, or proprietary records.
