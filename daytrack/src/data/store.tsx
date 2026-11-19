/**
 * In-memory app store for DayTrack.
 *
 * store.tsx is the app’s in-memory data layer. 
 * Holds categories and time entries in React state and exposes helpers to
 * read/update them from any screen via StoreProvider + useStore().
 * Data starts from seed.ts and currently resets when the app reloads
 * (no disk/cloud persistence yet).
 */

import {
  createContext,
  use,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createSeedEntries, seedCategories } from "@/data/seed";
import type { Category, Entry, DaySummary } from "@/types/models";
import type { RowColor } from "@/theme";
import { recentDateKeys, todayKey } from "@/utils/date";
import { entryDurationMinutes } from "@/utils/time";

/** Fields needed to create or update a time entry. */
export type EntryInput = {
  date: string;
  startTime: string;
  endTime: string | null;
  description: string;
  categoryId: string | null;
  rowColor: RowColor;
};

/** Shape of the value shared through StoreContext. */
type StoreValue = {
  categories: Category[];
  entries: Entry[];
  getEntriesForDate: (date: string) => Entry[];
  getDaySummary: (date: string) => DaySummary;
  getRecentDaySummaries: (count?: number) => DaySummary[];
  getCategoryById: (id: string | null) => Category | undefined;
  addEntry: (input: EntryInput) => Entry;
  updateEntry: (id: string, input: EntryInput) => void;
  deleteEntry: (id: string) => void;
  addCategory: (name: string) => Category | null;
};

const StoreContext = createContext<StoreValue | null>(null);

/** Totals logged minutes and activity count for one calendar day. */
function summarizeDay(date: string, entries: Entry[]): DaySummary {
  const dayEntries = entries.filter((entry) => entry.date === date);
  const totalMinutes = dayEntries.reduce((sum, entry) => {
    const duration = entryDurationMinutes(entry.startTime, entry.endTime);
    return sum + (duration ?? 0);
  }, 0);

  return {
    date,
    totalMinutes,
    activityCount: dayEntries.length,
  };
}

/** Provides store state and actions to the React tree. Wrap the app root in this. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [entries, setEntries] = useState<Entry[]>(() => createSeedEntries());

  const value = useMemo<StoreValue>(() => {
    /** Entries for one day, sorted by start time. */
    const getEntriesForDate = (date: string) =>
      entries
        .filter((entry) => entry.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    /** Summary stats for one day (total time + activity count). */
    const getDaySummary = (date: string) => summarizeDay(date, entries);

    /** Summaries for the most recent days (used on the Home screen). */
    const getRecentDaySummaries = (count = 7) =>
      recentDateKeys(count).map((date) => summarizeDay(date, entries));

    /** Looks up a category by id, or undefined if none / uncategorized. */
    const getCategoryById = (id: string | null) =>
      categories.find((category) => category.id === id);

    /** Creates a new entry and adds it to state. */
    const addEntry = (input: EntryInput) => {
      const now = new Date().toISOString();
      const entry: Entry = {
        id: `entry-${Date.now()}`,
        ...input,
        description: input.description.trim(),
        createdAt: now,
        updatedAt: now,
      };
      setEntries((current) => [...current, entry]);
      return entry;
    };

    /** Replaces fields on an existing entry. */
    const updateEntry = (id: string, input: EntryInput) => {
      const now = new Date().toISOString();
      setEntries((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                ...input,
                description: input.description.trim(),
                updatedAt: now,
              }
            : entry,
        ),
      );
    };

    /** Removes an entry by id. */
    const deleteEntry = (id: string) => {
      setEntries((current) => current.filter((entry) => entry.id !== id));
    };

    /** Adds a new category if the name is non-empty and not a duplicate. */
    const addCategory = (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const exists = categories.some(
        (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
      );
      if (exists) return null;
      const category: Category = {
        id: `cat-${Date.now()}`,
        name: trimmed,
      };
      setCategories((current) => [...current, category]);
      return category;
    };

    return {
      categories,
      entries,
      getEntriesForDate,
      getDaySummary,
      getRecentDaySummaries,
      getCategoryById,
      addEntry,
      updateEntry,
      deleteEntry,
      addCategory,
    };
  }, [categories, entries]);

  return <StoreContext value={value}>{children}</StoreContext>;
}

/** Hook for screens/components to read and update store data. */
export function useStore() {
  const store = use(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return store;
}

/** Convenience helper that returns today's YYYY-MM-DD key. */
export function useTodayKey() {
  return todayKey();
}
