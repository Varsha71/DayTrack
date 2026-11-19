/**
 * One row on the Home "Your days" list.
 *
 * Shows a day badge (e.g. WED, 18), a label (Today / Yesterday / weekday),
 * total time logged, and activity count. Today's card uses the dark green
 * style from the mocks; tapping navigates to that day's activity screen.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

import { AppIcon } from "@/components/app-icon";
import { colors, radius, spacing, typography } from "@/theme";
import type { DaySummary } from "@/types/models";
import {
  dayLabel,
  dayNumber,
  monthLong,
  todayKey,
  weekdayShort,
} from "@/utils/date";
import { formatDuration } from "@/utils/time";

type DaySummaryCardProps = {
  /** Totals for one calendar day (date, minutes, activity count). */
  summary: DaySummary;
  /** When true, show the month name next to the title (used on the first/top card). */
  showMonth?: boolean;
};

/** Renders a tappable day summary card for the Home screen. */
export function DaySummaryCard({ summary, showMonth }: DaySummaryCardProps) {
  const isToday = summary.date === todayKey();
  const label = dayLabel(summary.date);
  // Link asChild (Slot) rejects style arrays on web SSR — flatten first.
  const cardStyle = StyleSheet.flatten([
    styles.card,
    isToday ? styles.cardToday : styles.cardDefault,
  ]);

  return (
    <Link
      href={{ pathname: "/day/[date]", params: { date: summary.date } }}
      asChild
    >
      <Pressable style={cardStyle}>
        {/* Left date badge: short weekday + day number */}
        <View style={[styles.badge, isToday ? styles.badgeToday : styles.badgeDefault]}>
          <Text style={[styles.badgeWeekday, isToday && styles.textOnDark]}>
            {weekdayShort(summary.date)}
          </Text>
          <Text style={[styles.badgeDay, isToday && styles.textOnDark]}>
            {dayNumber(summary.date)}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isToday && styles.textOnDark]}>{label}</Text>
            {showMonth ? (
              <Text style={[styles.month, isToday && styles.textOnDarkMuted]}>
                {monthLong(summary.date)}
              </Text>
            ) : null}
          </View>
          {/* e.g. "4h 45m  ·  6 activities" */}
          <Text style={[styles.meta, isToday && styles.textOnDarkMuted]}>
            {formatDuration(summary.totalMinutes)}
            {"  ·  "}
            {summary.activityCount}{" "}
            {summary.activityCount === 1 ? "activity" : "activities"}
          </Text>
        </View>

        <AppIcon
          name="chevron-right"
          size={18}
          color={isToday ? colors.inkOnDarkMuted : colors.inkSoft}
        />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  cardToday: {
    backgroundColor: colors.primary,
  },
  cardDefault: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeToday: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  badgeDefault: {
    backgroundColor: colors.surfaceMuted,
  },
  badgeWeekday: {
    ...typography.tiny,
    color: colors.inkMuted,
  },
  badgeDay: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  month: {
    ...typography.caption,
    color: colors.inkSoft,
  },
  meta: {
    ...typography.meta,
    color: colors.inkMuted,
  },
  textOnDark: {
    color: colors.inkOnDark,
  },
  textOnDarkMuted: {
    color: colors.inkOnDarkMuted,
  },
});
