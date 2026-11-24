/**
 * SQLite schema setup for DayTrack.
 *
 * Opens once via SQLiteProvider's onInit. Creates tables on first launch,
 * seeds demo categories/entries, then bumps user_version so later launches
 * skip seeding and keep the user's data.
 */

import type { SQLiteDatabase } from "expo-sqlite";

import { createSeedEntries, seedCategories } from "@/data/seed";

/** Current schema version stored in SQLite's user_version pragma. */
export const SCHEMA_VERSION = 1;

/** Applies migrations and first-run seed data before the rest of the app renders. */
export async function initializeDatabase(db: SQLiteDatabase) {
  // WAL + foreign keys must be set outside the migration transaction.
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if (versionRow === null) {
    throw new Error("Could not read the database schema version");
  }

  const { user_version: current } = versionRow;
  if (current > SCHEMA_VERSION) {
    throw new Error("Database schema is newer than this app supports");
  }
  if (current === SCHEMA_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (current < 1) {
      await db.execAsync(`
        CREATE TABLE categories (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL
        );

        CREATE TABLE entries (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          description TEXT NOT NULL,
          category_id TEXT,
          row_color TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        CREATE INDEX entries_date_idx ON entries(date);
      `);

      // First install only — later launches keep whatever the user has saved.
      for (const category of seedCategories) {
        await db.runAsync(
          "INSERT INTO categories (id, name) VALUES (?, ?)",
          category.id,
          category.name,
        );
      }

      for (const entry of createSeedEntries()) {
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
    }

    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}
