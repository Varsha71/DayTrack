/**
 * Day screen — activity log for one calendar day.
 *
 * File name [date].tsx is an Expo Router dynamic route: the URL segment becomes
 * a param (e.g. /day/2026-11-18 → params.date === "2026-11-18").
 *
 * Shows the date header, summary bar, activity list (or empty state), and an
 * inline create/edit form when compose mode is open. FAB opens create mode;
 * Home can also deep-link here with ?compose=1 to start a new entry.
 */

import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityCard } from "@/components/activity-card";
import { ActivityForm } from "@/components/activity-form";
import { AppIcon } from "@/components/app-icon";
import { DaySummaryBar } from "@/components/day-summary-bar";
import { EmptyDay } from "@/components/empty-day";
import { Fab } from "@/components/fab";
import { useStore, type EntryInput } from "@/data/store";
import { colors, radius, spacing, typography } from "@/theme";
import type { Entry } from "@/types/models";
import {
  formatLongDate,
  todayKey,
  weekdayLong,
} from "@/utils/date";

/** Whether the inline activity form is hidden, creating, or editing. */
type ComposeMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; entryId: string };

export default function DayScreen() {
  const insets = useSafeAreaInsets();
  // date comes from the [date] path segment; compose is an optional query flag
  const params = useLocalSearchParams<{ date: string; compose?: string }>();
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const date = dateParam ?? todayKey();
  const composeParam = Array.isArray(params.compose)
    ? params.compose[0]
    : params.compose;

  const {
    categories,
    getEntriesForDate,
    getDaySummary,
    getCategoryById,
    addEntry,
    updateEntry,
    deleteEntry,
  } = useStore();

  const [compose, setCompose] = useState<ComposeMode>(() =>
    composeParam === "1" ? { type: "create" } : { type: "closed" },
  );

  const entries = getEntriesForDate(date);
  const summary = getDaySummary(date);
  const isToday = date === todayKey();
  const editingEntry =
    compose.type === "edit"
      ? entries.find((entry) => entry.id === compose.entryId) ?? null
      : null;

  // New entries default to starting where the previous one ended (design E10).
  const defaultStartTime = useMemo(() => {
    const last = entries[entries.length - 1];
    if (last?.endTime) return last.endTime;
    return undefined;
  }, [entries]);

  const openCreate = () => setCompose({ type: "create" });
  const openEdit = (entry: Entry) =>
    setCompose({ type: "edit", entryId: entry.id });
  const closeCompose = () => setCompose({ type: "closed" });

  const handleSave = (input: EntryInput) => {
    if (compose.type === "edit") {
      updateEntry(compose.entryId, input);
    } else {
      addEntry(input);
    }
    closeCompose();
  };

  const handleDelete = () => {
    if (compose.type === "edit") {
      deleteEntry(compose.entryId);
      closeCompose();
    }
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <Link href="/" asChild>
        <Pressable style={styles.backRow} accessibilityRole="button">
          <AppIcon name="chevron-left" size={18} color={colors.ink} />
          <Text style={styles.backText}>All days</Text>
        </Pressable>
      </Link>

      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={styles.weekday}>{weekdayLong(date)}</Text>
          <Text style={styles.date}>{formatLongDate(date)}</Text>
        </View>
        {isToday ? (
          <View style={styles.todayPill}>
            <Text style={styles.todayText}>Today</Text>
          </View>
        ) : null}
      </View>

      <DaySummaryBar
        totalMinutes={summary.totalMinutes}
        activityCount={summary.activityCount}
      />

      {/* Inline new/edit form (matches the lavender "New activity" mock) */}
      {compose.type !== "closed" ? (
        <View style={styles.composeSection}>
          <View style={styles.sectionRow}>
            <Text style={styles.section}>
              {compose.type === "edit" ? "Edit entry" : "New entry"}
            </Text>
            <Text style={styles.sectionMeta}>
              {compose.type === "edit" ? "Editing" : "Creating"}
            </Text>
          </View>
          <ActivityForm
            date={date}
            categories={categories}
            initial={editingEntry}
            defaultStartTime={defaultStartTime}
            onSave={handleSave}
            onCancel={closeCompose}
            onDelete={compose.type === "edit" ? handleDelete : undefined}
          />
        </View>
      ) : null}

      {entries.length > 0 ? (
        <View style={styles.sectionRow}>
          <Text style={styles.section}>Activities</Text>
          <Text style={styles.sectionMeta}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: weekdayLong(date) }} />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: 120,
            flexGrow: 1,
          },
        ]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          // Hide empty state while the create form is open on a blank day
          compose.type === "closed" ? EmptyDay : undefined
        }
        renderItem={({ item }) => (
          <ActivityCard
            entry={item}
            categoryName={getCategoryById(item.categoryId)?.name}
            onEdit={() => openEdit(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <Text style={styles.footer}>
            {entries.length === 0
              ? "Start with one activity."
              : "One activity at a time."}
          </Text>
        }
      />
      {/* FAB only when not already composing */}
      {compose.type === "closed" ? (
        <Fab onPress={openCreate} accessibilityLabel="Add activity" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
  headerBlock: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-start",
  },
  backText: {
    ...typography.meta,
    color: colors.ink,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  weekday: {
    ...typography.hero,
    color: colors.ink,
  },
  date: {
    ...typography.meta,
    color: colors.inkMuted,
  },
  todayPill: {
    backgroundColor: colors.todayPill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  todayText: {
    ...typography.caption,
    color: colors.ink,
  },
  composeSection: {
    gap: spacing.sm,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: {
    ...typography.section,
    color: colors.inkSoft,
  },
  sectionMeta: {
    ...typography.caption,
    color: colors.inkSoft,
  },
  separator: {
    height: spacing.sm,
  },
  footer: {
    ...typography.caption,
    color: colors.inkSoft,
    marginTop: spacing.xxl,
  },
});
