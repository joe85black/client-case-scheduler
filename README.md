# Client Case Scheduler

A Google Sheets–based case/task scheduler for tracking client casework through an immigration-services pipeline: due dates, payment and delivery milestones, rush-fee flags, task/deal status, and a secondary follow-up sub-tracker — plus a bound Apps Script that color-codes a calendar view by case category.

> All names, dates, and notes in this repo are fabricated sample data used to demonstrate the sheet's structure and functions. Case-category labels are genericized (see [Case Category Key](#case-category-key)); the underlying scheduling logic and Apps Script are otherwise unchanged from the working sheet.

## What it's for

This sheet is the daily task board for a small case-management team: each row is one case moving through intake → processing → delivery, with due dates, who's responsible, whether a rush fee applies, and free-text notes. A second, script-driven `Task Calendar` tab renders the same cases on a calendar grid, with each entry colored by case category so the team can scan a week at a glance.

## Sheet structure

### Main tab — case pipeline

| Column | Purpose |
|---|---|
| Name | Case/client identifier |
| Service Type | Case category (see key below) |
| Person Responsible | Staff member assigned |
| Due Date | Internal due date for this task |
| Pagamento (Payment Date) | Date payment was received |
| Delivery Date | Date the finished work was delivered |
| Rush Fee | Blank, or "Rush Fee" if a rush fee applies |
| Task Status | `Task Open` / `Task Completed` |
| Deal Status | `Deal Completed`, etc. |
| Days Remaining | Countdown/status indicator — shows `Closed` once a case wraps up, otherwise a day count |
| Notes / Observations | Free-text case notes |
| Due Date Month | Month name derived from Due Date |

A second, smaller block further along the same tab tracks follow-up requests separately, keyed by the same case name:

| Column | Purpose |
|---|---|
| Name | Case/client identifier |
| Type of Request | Category of the follow-up request |
| Online or mail? | Submission method |
| Obs | Notes |
| Docs Deadline | Internal document deadline |
| Government Deadline | Externally-imposed deadline |

A final reference column holds a static list of company holidays for the year, used when scheduling around days off.

### Second tab — `Task Calendar`

A calendar-style view of the same cases (structure not included as sample data here — see [`colorCalendarTasks.gs`](./colorCalendarTasks.gs) for exactly how it's read/written). Each cell can hold multiple lines of text, one per case shown that day, e.g.:

```
Sample Client 07 — Category B (Complete)
Sample Client 40 — Category F
```

The bound script recolors each line by matching case-category keywords against the patterns in `colorCalendarTasks.gs`.

## Apps Script — `colorCalendarTasks.gs`

Bound to the sheet; run manually or on a trigger. Scans the `Task Calendar` tab starting at cell C2, and for every line of text in every cell, matches it against an ordered list of case-category patterns and recolors that line's text accordingly.

See [`colorCalendarTasks.gs`](./colorCalendarTasks.gs) for the full script.

## Case Category Key

Case-type codes are genericized consistently with the rest of this account's Google Sheets repos ([Google-Sheets-Formulas](https://github.com/joe85black/Google-Sheets-Formulas), [Harden-Google-Sheet](https://github.com/joe85black/Harden-Google-Sheet)):

| Placeholder | Stands in for |
|---|---|
| Category A (Complete / Economic / Petition) | Green-card-track case |
| Category B (Complete / Economic) | Removal-of-conditions case |
| Category C | Visitor-visa case |
| Category D | Student-visa case |
| Category C/D (Dependents) | Visitor/student visa filed with dependents |
| Category E / Category E (Delivery) | Citizenship case, incl. delivery stage |
| Category F | RFE (Request for Evidence) or other misc. filing |
| Category G | Student services case |
| Category H | Ancillary filing with a physical printing/mailing step |
| Category I | Re-entry permit case |

## Sample data

[`sample-data/client-scheduling-sample.csv`](./sample-data/client-scheduling-sample.csv) contains 50 fabricated rows covering every case category, staff assignment, and status combination the sheet supports, so you can see how the columns and script interact without any real case data.

## Setup

1. Create a new Google Sheet with a main tab matching the columns above, plus a `Task Calendar` tab.
2. Import [`sample-data/client-scheduling-sample.csv`](./sample-data/client-scheduling-sample.csv) into the main tab to see the structure populated.
3. Extensions > Apps Script, paste in [`colorCalendarTasks.gs`](./colorCalendarTasks.gs).
4. Run `colorCalendarTasks` once to authorize it, then re-run whenever the calendar tab is updated (or wire it to a trigger).
