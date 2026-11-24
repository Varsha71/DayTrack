/**
 * First-run seed data for DayTrack.
 *
 * Written into SQLite once when the database is created (see database.ts).
 * Later launches load whatever is already on disk — this file is not re-applied.
 * Entries are anchored to "today" and a few prior days.
 */

import type { Category, Entry } from "@/types/models";
import { shiftDateKey, todayKey } from "@/utils/date";

/** Default categories shown in the app (Work, Personal). */
export const seedCategories: Category[] = [
  { id: "cat-work", name: "Work" },
  { id: "cat-personal", name: "Personal" },
];

/** Builds sample time entries for today and a few recent days. */
function buildSeedEntries(today: string): Entry[] {
  const now = new Date().toISOString();
  return [
    {
      id: "e1",
      date: today,
      startTime: "07:30",
      endTime: "08:00",
      description: "Breakfast & a slow start",
      categoryId: null,
      rowColor: "none",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e2",
      date: today,
      startTime: "08:00",
      endTime: "08:45",
      description: "Morning walk",
      categoryId: "cat-personal",
      rowColor: "green",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e3",
      date: today,
      startTime: "09:00",
      endTime: "10:30",
      description: "Deep work",
      categoryId: "cat-work",
      rowColor: "lavender",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e4",
      date: today,
      startTime: "10:30",
      endTime: "10:45",
      description: "Coffee break",
      categoryId: null,
      rowColor: "peach",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e5",
      date: today,
      startTime: "11:00",
      endTime: "12:00",
      description: "Project planning",
      categoryId: "cat-work",
      rowColor: "lavender",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e6",
      date: today,
      startTime: "12:00",
      endTime: "12:45",
      description: "Lunch & a little reading",
      categoryId: "cat-personal",
      rowColor: "green",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e7",
      date: shiftDateKey(today, -1),
      startTime: "09:00",
      endTime: "11:00",
      description: "Focus block",
      categoryId: "cat-work",
      rowColor: "lavender",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e8",
      date: shiftDateKey(today, -1),
      startTime: "14:00",
      endTime: "15:15",
      description: "Errands",
      categoryId: "cat-personal",
      rowColor: "green",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e9",
      date: shiftDateKey(today, -2),
      startTime: "10:00",
      endTime: "12:00",
      description: "Writing",
      categoryId: "cat-work",
      rowColor: "lavender",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e10",
      date: shiftDateKey(today, -3),
      startTime: "08:30",
      endTime: "09:00",
      description: "Stretch",
      categoryId: "cat-personal",
      rowColor: "green",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "e11",
      date: shiftDateKey(today, -3),
      startTime: "13:00",
      endTime: "16:00",
      description: "Client workshop",
      categoryId: "cat-work",
      rowColor: "lavender",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/** Returns seed entries relative to the current day. */
export function createSeedEntries(): Entry[] {
  return buildSeedEntries(todayKey());
}
