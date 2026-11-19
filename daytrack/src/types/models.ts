import type { RowColor } from "@/theme";

export type Category = {
  id: string;
  name: string;
};

export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string | null; // HH:mm or null for ongoing
  description: string;
  categoryId: string | null;
  rowColor: RowColor;
  createdAt: string;
  updatedAt: string;
};

export type DaySummary = {
  date: string;
  totalMinutes: number;
  activityCount: number;
};
