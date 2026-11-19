/**
 * One activity row on the Day screen.
 *
 * Displays a time entry's range, duration, description, optional category
 * pill, and an edit (pencil) button. Background uses the entry's row color
 * from the design mocks (lavender, green, peach, etc.).
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { colors, radius, spacing, typography } from "@/theme";
import type { Entry } from "@/types/models";
import { entryDurationMinutes, formatDuration } from "@/utils/time";

type ActivityCardProps = {
  /** The time entry to display. */
  entry: Entry;
  /** Resolved category label (e.g. "Work"); omit when uncategorized. */
  categoryName?: string;
  /** Opens the edit form for this entry. */
  onEdit: () => void;
};

/** Renders a single activity card in the day's activity list. */
export function ActivityCard({ entry, categoryName, onEdit }: ActivityCardProps) {
  const duration = entryDurationMinutes(entry.startTime, entry.endTime);
  // Show an open range when end time hasn't been set yet.
  const timeLabel = entry.endTime
    ? `${entry.startTime} – ${entry.endTime}`
    : `${entry.startTime} – …`;

  return (
    <View style={[styles.card, { backgroundColor: colors.row[entry.rowColor] }]}>
      <View style={styles.topRow}>
        <Text style={styles.time}>{timeLabel}</Text>
        <View style={styles.topRight}>
          {duration != null ? (
            <Text style={styles.duration}>{formatDuration(duration)}</Text>
          ) : (
            <Text style={styles.duration}>Ongoing</Text>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit activity"
            hitSlop={8}
            onPress={onEdit}
            style={styles.editButton}
          >
            <AppIcon name="pencil" size={14} color={colors.inkMuted} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>{entry.description}</Text>

      {categoryName ? (
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{categoryName}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  time: {
    ...typography.caption,
    color: colors.inkMuted,
  },
  duration: {
    ...typography.caption,
    color: colors.inkMuted,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,61,51,0.06)",
  },
  title: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(30,61,51,0.08)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  categoryText: {
    ...typography.tiny,
    color: colors.ink,
  },
});
