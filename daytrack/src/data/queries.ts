/**
 * Typed read/write helpers for categories and entries in SQLite.
 *
 * Row shapes use snake_case to match SQL columns; mapRow helpers convert
 * to the camelCase models the UI already uses.
 */

import type { SQLiteDatabase } from "expo-sqlite";

import type { Category, Entry } from "@/types/models";
import type { RowColor } from "@/theme";

type CategoryRow = {
  id: string;
  name: string;
};

type EntryRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  description: string;
  category_id: string | null;
  row_color: string;
  created_at: string;
  updated_at: string;
};

function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name };
}

function mapEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    description: row.description,
    categoryId: row.category_id,
    rowColor: row.row_color as RowColor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Loads every category and entry from disk (small local dataset). */
export async function loadAll(
  db: SQLiteDatabase,
): Promise<{ categories: Category[]; entries: Entry[] }> {
  const categoryRows = await db.getAllAsync<CategoryRow>(
    "SELECT id, name FROM categories ORDER BY name COLLATE NOCASE ASC",
  );
  const entryRows = await db.getAllAsync<EntryRow>(
    `SELECT id, date, start_time, end_time, description,
            category_id, row_color, created_at, updated_at
     FROM entries`,
  );

  return {
    categories: categoryRows.map(mapCategory),
    entries: entryRows.map(mapEntry),
  };
}

export async function insertCategory(db: SQLiteDatabase, category: Category) {
  await db.runAsync(
    "INSERT INTO categories (id, name) VALUES (?, ?)",
    category.id,
    category.name,
  );
}

export async function insertEntry(db: SQLiteDatabase, entry: Entry) {
  await db.runAsync(
    `INSERT INTO entries (
      id, date, start_time, end_time, description,
      category_id, row_color, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    entry.id,
    entry.date,
    entry.startTime,
    entry.endTime,
    entry.description,
    entry.categoryId,
    entry.rowColor,
    entry.createdAt,
    entry.updatedAt,
  );
}

export async function updateEntryRow(db: SQLiteDatabase, entry: Entry) {
  await db.runAsync(
    `UPDATE entries SET
      date = ?,
      start_time = ?,
      end_time = ?,
      description = ?,
      category_id = ?,
      row_color = ?,
      updated_at = ?
     WHERE id = ?`,
    entry.date,
    entry.startTime,
    entry.endTime,
    entry.description,
    entry.categoryId,
    entry.rowColor,
    entry.updatedAt,
    entry.id,
  );
}

export async function deleteEntryRow(db: SQLiteDatabase, id: string) {
  await db.runAsync("DELETE FROM entries WHERE id = ?", id);
}
