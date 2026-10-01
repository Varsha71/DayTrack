---
name: DayTracker Design Doc
overview: "Create a product design / requirements document for DayTracker v1: a local-only mobile app for logging daily time entries with start/end times, descriptions, and category tags—explicitly scoping cloud sync and other features to later versions."
todos:
  - id: write-design-doc
    content: Write docs/DESIGN.md with overview, in/out scope, data model, UX, NFRs, acceptance criteria
    status: pending
  - id: add-readme
    content: Add README.md pointing to the design doc and summarizing DayTracker v1 scope
    status: pending
isProject: false
---

# DayTracker v1 Design Document

## Deliverable

Create a single markdown design doc at [`docs/DESIGN.md`](docs/DESIGN.md) (plus a short pointer in [`README.md`](README.md)) that defines product goals, in-scope requirements, out-of-scope items, data model, and UX flows for **DayTracker v1**.

No app code in this pass—requirements only, so implementation can follow without scope creep.

## Product decisions (locked)

- **Storage:** Local-only on device; no accounts or cloud in v1
- **Core objects:** Daily time entries + category tags
- **Later (explicitly out of v1):** Cross-device sync, cloud backup, accounts

## Document structure

### 1. Overview
- One-paragraph problem/solution: log what you did and when, day by day
- Goals: fast entry, clear day view, categorize activities locally
- Non-goals for v1 (sync, collaboration, billing, social)

### 2. Personas & primary use cases
- Individual tracking their day (work blocks, personal tasks, habits)
- Use cases: add entry for a time range; tag with category; edit/delete; browse a selected day

### 3. In-scope functional requirements (v1)

**Time entries**
- Create entry with start time, end time, description, and optional category
- Edit and delete entries
- View entries for a selected calendar day (default: today)
- Validate: end after start; same-day entries for v1 (no multi-day spans)
- Overlap policy: allow overlapping entries (document this; no auto-merge)

**Category tags**
- Create, rename, delete categories (user-managed list)
- Assign at most one category per entry in v1 (simple tagging model)
- Entries can be uncategorized
- Deleting a category leaves entries uncategorized (no cascade delete of entries)

**Day navigation**
- Move between days (previous/next and/or date picker)
- Empty state when a day has no entries

**Persistence**
- Persist all data locally across app restarts
- No network required

### 4. Explicitly out of scope (v1)
- Accounts, auth, cloud sync/backup
- Live/running timer (“start now”)
- Reports, charts, export/import
- Recurring entries, templates, reminders/notifications
- Multi-day entries, calendars integration, widgets
- Multi-category per entry, nested categories, colors as required UX (optional later)

Call out as **v2+ candidates**: sync, cloud backup, reports/export, live timer.

### 5. Data model (logical)
- `Entry`: id, date, startTime, endTime, description, categoryId (nullable), createdAt, updatedAt
- `Category`: id, name, createdAt, updatedAt
- Constraints and validation rules matching §3

### 6. UX / screens (lightweight)
- Day list (entries for selected day, sorted by start time)
- Entry create/edit form
- Category management screen or sheet
- No hero marketing UI—app shell only

### 7. Non-functional requirements
- Mobile (phone-first); platform-agnostic in the doc (implementation stack TBD)
- Offline-first by definition (local store)
- Privacy: data stays on device in v1
- Performance: day views load instantly for typical volumes (e.g. tens of entries/day)

### 8. Acceptance criteria checklist
- Bullet checklist mapped to each in-scope requirement so “done” is unambiguous for implementation and QA

### 9. Open questions / deferred
- Target platform(s) and stack (React Native, Flutter, native)—deferred until implementation
- Whether category colors are in v1 polish—default **no** unless needed for usability

## Approach notes

- Requirements written as **must / should** so scope is testable
- Prefer short, concrete language over speculative architecture
- Keep tech stack out of the design doc except “local persistence required”
