# Client Case Scheduler

A Google Sheets–based case/task scheduler for tracking client work through a service pipeline: due dates, payment and delivery milestones, rush-fee flags, task/deal status, and a secondary follow-up sub-tracker — plus a bound Apps Script that color-codes a calendar view by service package.

> All names and data in this repository are fictional examples.

## What it's for

This sheet is the daily task board for a small client-services team: each row is one case moving through intake → processing → delivery, with due dates, who's responsible, whether a rush fee applies, and free-text notes. A second, script-driven `Task Calendar` tab renders the same cases on a calendar grid, with each entry colored by service package so the team can scan a week at a glance.

## Sheet structure

### Main tab — case pipeline

| Column | Purpose |
|---|---|
| Name | Case/client identifier |
| Service Type | Service package (see [Package colors](#package-colors)) |
| Person Responsible | Staff member assigned |
| Due Date | Internal due date for this task |
| Payment Date | Date payment was received |
| Delivery Date | Date the finished work was delivered |
| Rush Fee | Blank, or "Rush Fee" if a rush fee applies |
| Task Status | `Task Open` / `Task Completed` |
| Deal Status | `Deal Completed`, etc. |
| Days Remaining | Countdown indicator — shows `Closed` once a case wraps up, otherwise a day count |
| Notes / Observations | Free-text case notes |
| Due Date Month | Month name derived from Due Date |

A second, smaller block further along the same tab tracks follow-up requests separately, keyed by the same case name:

| Column | Purpose |
|---|---|
| Name | Case/client identifier |
| Type of Request | Kind of follow-up request |
| Online or mail? | Submission method |
| Obs | Notes |
| Docs Deadline | Internal document deadline |
| External Deadline | Deadline set by a third party |

A final reference column holds a static list of company holidays for the year, used when scheduling around days off.

### Second tab — `Task Calendar`

A calendar-style view of the same cases (structure not included as sample data here — see [`colorCalendarTasks.gs`](./colorCalendarTasks.gs) for exactly how it's read/written). Each cell can hold multiple lines of text, one per case shown that day, e.g.:

```
Sample Client 07 — Business Plus Full
Sample Client 40 — Flex Option
```

The bound script recolors each line by matching package names against the patterns in `colorCalendarTasks.gs`.

## Apps Script — `colorCalendarTasks.gs`

Bound to the sheet; run manually or on a trigger. Scans the `Task Calendar` tab starting at cell C2, and for every line of text in every cell, matches it against an ordered list of package patterns and recolors that line's text accordingly. The first matching pattern wins, so longer names (e.g. `Quick Check Pro`) are checked before shorter names they contain (`Quick Check`).

See [`colorCalendarTasks.gs`](./colorCalendarTasks.gs) for the full script.

## Package colors

Package names the script recognizes, in the order they are checked:

| Package | Text color |
|---|---|
| Quick Check Family | `#7CB342` |
| Quick Check Pro | `#4285F4` |
| Quick Check | `#D29EB7` |
| Starter Lite | `#DB4437` |
| Starter Full | `#F4B400` |
| Starter Filing | `#795548` |
| Business Plus Lite | `#00BCD4` |
| Business Plus Full | `#E91E63` |
| Annual Review (Delivery) | `#9E9E9E` |
| Flex Option | `#F29900` |
| Growth Plan | `#26A69A` |
| Essentials Pack | `#673AB7` |
| Premier Plan | `#212121` |

Lines that match none of these (for example a plain `Starter`, `Business Plus`, or `Annual Review` entry) are left in the default text color.

## Sample data

[`sample-data/client-scheduling-sample.csv`](./sample-data/client-scheduling-sample.csv) contains 50 fictional rows covering the service packages, staff assignments, and status combinations the sheet supports, so you can see how the columns and script interact.

## Setup

1. Create a new Google Sheet with a main tab matching the columns above, plus a `Task Calendar` tab.
2. Import [`sample-data/client-scheduling-sample.csv`](./sample-data/client-scheduling-sample.csv) into the main tab to see the structure populated.
3. Extensions > Apps Script, paste in [`colorCalendarTasks.gs`](./colorCalendarTasks.gs).
4. Run `colorCalendarTasks` once to authorize it, then re-run whenever the calendar tab is updated (or wire it to a trigger).
