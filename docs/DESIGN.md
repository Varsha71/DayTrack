# DayTracker v1 Design Document

## 1. Overview

DayTracker is a productivity mobile app for logging how time was spent each day. Users create entries with a start time, end time, and a description of the activity (or activities) performed in that duration, and may optionally tag each entry with a category.

**v1 goals**

- Fast creation and editing of daily time entries
- Clear view of entries for a selected day
- Simple category tags to classify activity type
- Fully local storage—no network or account required

**v1 non-goals**

- Cross-device sync, cloud backup, or accounts
- Collaboration, sharing, billing, or social features
- Analytics dashboards, export pipelines, or calendar integrations

---



## 2. Personas and primary use cases

**Persona:** An individual who wants a lightweight record of how their day was spent (work blocks, personal tasks, habits, or mixed activities). Useful tool for people with ADD/ADHD and other attention related issues that helps with time blindness by allowing to be more intentional about time spent on diferent activities and helps develop a sense of how much time different types of tasks take by consistently tracking them.

**Primary use cases**

1. Add a time entry for a range within a day, with a description and optional category. Calculates and displays the totla time per activity based on the time ragnes inputted.
2. Edit or delete an existing entry
3. Browse entries for today or another selected day
4. Create and manage category tags used when logging entries

---



## 3. In-scope functional requirements (v1)

Requirements use **must** (required for release) and **should** (expected unless blocked).

### 3.1 Time entries


| ID  | Requirement                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------ |
| E0  | The app **must** show a list of all the day entries and clicking each should go into that day's time entries.                  |
| E1  | The app **must** allow creating an entry with start time, end time, description, and optional category.                        |
| E2  | The app **must** allow editing all fields of an existing entry.                                                                |
| E3  | The app **must** allow deleting an entry.                                                                                      |
| E4  | The app **must** show entries for a selected calendar day; the default day **must** be today.                                  |
| E5  | The app **must** reject save when end time is not after start time.                                                            |
| E6  | Entries **must** be same-day only; multi-day spans are not supported. time must be withing the same 24 hours day (00:00-23:59) |
| E7  | Overlapping entries on the same day **must** be allowed; the app **must not** auto-merge or block overlaps.                    |
| E8  | Description **must** be required and non-empty after trim.                                                                     |
| E9 | Entries for a day **should** be displayed sorted by start time ascending.                                                      |
| E10 | Start time should have default vlue of the end time of the previous time entry(if none, current time is default). End time default 30mins from start                                                     |





### 3.2 Category tags


| ID  | Requirement                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------ |
| C1  | The app **must** allow creating, renaming, and deleting categories.                                          |
| C2  | Category names **must** be unique (case-insensitive) and non-empty after trim.                               |
| C3  | An entry **must** support at most one category (or none).                                                    |
| C4  | Entries **must** be allowed without a category (uncategorized).                                              |
| C5  | Deleting a category **must** leave previously tagged entries uncategorized; entries **must not** be deleted. |




### 3.3 Day navigation


| ID  | Requirement |
| --- | ----------- |


| D1  | When a day has no entries, the app **must** show a clear empty state.       |         

### 3.4 Persistence


| ID  | Requirement                                                                      |
| --- | -------------------------------------------------------------------------------- |
| P1  | All entries and categories **must** persist locally across app restarts.         |
| P2  | Core create/read/update/delete flows **must** work with no network connectivity. |


---



## 4. Out of scope (v1)

The following are **not** part of v1:

- Accounts, authentication, cloud sync, or cloud backup
- Live / running timer (“start now”)
- Reports, charts, summaries, export, or import
- Reminders or notifications
- home-screen widgets
- Multiple categories per entry, nested categories

### v2+ candidates

- Cross-device sync and cloud backup
- Reminders or notifications
- Pie charts / Reports / export
- Live timer with notification after 30mins/1 hr with stop option in the notification(must enter the description prior to starting the timer)

---



## 5. Data model (logical)



### Entry


| Field         | Type          | Notes                                              |
| ------------- | ------------- | -------------------------------------------------- |
| `id`          | string (UUID) | Stable identifier                                  |
| `date`        | date          | Calendar day the entry belongs to (local timezone) |
| `startTime`   | time          | Local time on `date`                               |
| `endTime`     | time          | Local time on `date`; must be after `startTime`    |
| `description` | string        | Required; non-empty after trim                     |
| `categoryId`  | string        | null                                               |
| `createdAt`   | datetime      | Set on create                                      |
| `updatedAt`   | datetime      | Updated on edit                                    |




### Category


| Field       | Type          | Notes                             |
| ----------- | ------------- | --------------------------------- |
| `id`        | string (UUID) | Stable identifier                 |
| `name`      | string        | Required; unique case-insensitive |
| `createdAt` | datetime      | Set on create                     |
| `updatedAt` | datetime      | Updated on rename                 |




### Constraints

- `endTime > startTime` on the same `date`
- At most one `categoryId` per entry
- On category delete: set `categoryId` to `null` for affected entries
- Overlapping time ranges for the same `date` are valid

---



## 6. UX / screens

v1 is an app shell only (no marketing hero). Phone-first layouts.

### Days list (home)
- Shows a list of Day entries denoted by the dates as the titles. Clicking into each date opens the Day Entry for the date.
- Shows a "+" icon to create a new day entry. Cannot create multiple day entried for the same date.

### Day Entry

- Shows selected day and its entries sorted by start time
- Each row: time range, description, category (if any)
- Affordance to add a new entry(a "+" sign icon at the bottom of the list of time entries)
- Empty state when the day has no entries(Maybe say something like click "+" to add an entry)



### Entry create / edit

- Fields: start time, end time, description, category (optional picker)
- Save and cancel; delete available when editing
- Inline validation for required fields and end-after-start



### Category management

- Screen or sheet listing categories
- Create, rename, delete
- Confirm before delete; explain that entries become uncategorized

---



## 7. Non-functional requirements


| ID  | Requirement                                                                                        |
| --- | -------------------------------------------------------------------------------------------------- |
| N1  | Phone-first mobile UI; platform and stack are deferred to implementation.                          |
| N2  | Offline-first: local persistence is the system of record in v1.                                    |
| N3  | Privacy: user data stays on device; no telemetry of entry content required for v1.                 |
| N4  | Day views **should** feel immediate for typical volumes (on the order of tens of entries per day). |


---



## 8. Acceptance criteria checklist

Use this checklist to mark v1 “done.”

**Time entries**

- [ ] Create entry with start, end, description, optional category
- [ ] Edit and save changes to an existing entry
- [ ] Delete an entry
- [ ] Default day is today; entries for that day are listed
- [ ] Cannot save when end ≤ start
- [ ] Cannot create multi-day spans
- [ ] Overlapping entries on the same day are allowed
- [ ] Empty description is rejected
- [ ] Entries sorted by start time on the day list

**Categories**

- [ ] Create, rename, and delete categories
- [ ] Duplicate category names (case-insensitive) rejected
- [ ] Entry has zero or one category
- [ ] Uncategorized entries allowed
- [ ] Deleting a category does not delete entries; those entries become uncategorized

**Day navigation & persistence**

- [ ] Navigate to other days; empty state shown when needed
- [ ] Data survives app restart
- [ ] CRUD works with airplane mode / no network

---



## 9. Open questions / deferred


| Topic                                                             | Decision for now                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| Target platform(s) and stack (e.g. React Native, Flutter, native) | Deferred until implementation                          |
| Category colors in v1                                             | **No**—not required for v1                             |
| Exact local storage technology                                    | Deferred; any durable on-device store that meets P1–P2 |


