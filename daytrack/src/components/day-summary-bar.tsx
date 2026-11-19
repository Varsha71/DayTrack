/**
 * Summary strip at the top of the Day screen.
 *
 * Shows total time logged for that day (or "No time logged yet") on the left
 * and the activity count on the right — matching the light green bar in the mocks.
 */

import { StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { colors, radius, spacing, typography } from "@/theme";
import { formatDuration } from "@/utils/time";

type DaySummaryBarProps = {
  /** Sum of completed entry durations for the day, in minutes. */
  totalMinutes: number;
  /** Number of activities logged that day. */
  activityCount: number;
};

/** Renders the day totals bar under the date header. */
export function DaySummaryBar({ totalMinutes, activityCount }: DaySummaryBarProps) {
  const timeLabel =
    totalMinutes > 0 ? `${formatDuration(totalMinutes)} logged` : "No time logged yet";

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <AppIcon name="clock" size={16} color={colors.inkMuted} />
        <Text style={styles.text}>{timeLabel}</Text>
      </View>
      <Text style={styles.text}>
        {activityCount} {activityCount === 1 ? "activity" : "activities"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    ...typography.meta,
    color: colors.inkMuted,
  },
});
