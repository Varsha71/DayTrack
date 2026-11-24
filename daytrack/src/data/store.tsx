/**
 * App store for DayTrack — React state backed by on-device SQLite.
 *
 * StoreProvider loads categories/entries from the database once, keeps them in
 * memory for fast UI reads, and writes every create/update/delete through to
 * SQLite so data survives app restarts.
 */

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import {
  deleteEntryRow,
  insertCategory,
  insertEntry,
  loadAll,
  updateEntryRow,
} from "@/data/queries";
import type { Category, Entry, DaySummary } from "@/types/models";
import type { RowColor } from "@/theme";
import { colors } from "@/theme";
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

/** Logs a failed disk write without blocking the UI update that already happened. */
function persist(label: string, work: Promise<unknown>) {
  void work.catch((error) => {
    console.error(`[DayTrack] Failed to persist ${label}`, error);
  });
}

/** Provides store state and actions to the React tree. Wrap the app root in this. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate React state from SQLite after the provider finishes onInit.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadAll(db);
      if (cancelled) return;
      setCategories(data.categories);
      setEntries(data.entries);
      setReady(true);
    })().catch((error) => {
      console.error("[DayTrack] Failed to load store from SQLite", error);
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

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

    /** Creates a new entry in memory and on disk. */
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
      persist("addEntry", insertEntry(db, entry));
      return entry;
    };

    /** Replaces fields on an existing entry in memory and on disk. */
    const updateEntry = (id: string, input: EntryInput) => {
      const existing = entries.find((entry) => entry.id === id);
      if (!existing) return;
      const updated: Entry = {
        ...existing,
        ...input,
        description: input.description.trim(),
        updatedAt: new Date().toISOString(),
      };
      setEntries((current) =>
        current.map((entry) => (entry.id === id ? updated : entry)),
      );
      persist("updateEntry", updateEntryRow(db, updated));
    };

    /** Removes an entry by id from memory and disk. */
    const deleteEntry = (id: string) => {
      setEntries((current) => current.filter((entry) => entry.id !== id));
      persist("deleteEntry", deleteEntryRow(db, id));
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
      persist("addCategory", insertCategory(db, category));
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
  }, [categories, entries, db]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
