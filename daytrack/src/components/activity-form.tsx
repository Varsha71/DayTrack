/**
 * Inline create/edit form for a time entry on the Day screen.
 *
 * Collects start/end time, description, optional category, and row color.
 * End time can be cleared ("Set later") for an open-ended entry. Validates
 * that description is non-empty and end is after start before calling onSave.
 */

import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppIcon } from "@/components/app-icon";
import { colors, radius, spacing, typography, type RowColor } from "@/theme";
import type { Category, Entry } from "@/types/models";
import type { EntryInput } from "@/data/store";
import {
  addMinutesToTime,
  entryDurationMinutes,
  formatDuration,
  nowTimeString,
  parseTimeToMinutes,
} from "@/utils/time";

/** Swatch options shown in the "Row color" picker. */
const ROW_COLORS: RowColor[] = ["none", "green", "lavender", "peach", "blue"];

type ActivityFormProps = {
  /** Calendar day this entry belongs to (YYYY-MM-DD). */
  date: string;
  /** Available categories for the chip picker. */
  categories: Category[];
  /** Existing entry when editing; omit/null when creating. */
  initial?: Entry | null;
  /** Preferred start time for new entries (e.g. previous entry's end). */
  defaultStartTime?: string;
  /** Called with validated form values when the user taps the checkmark. */
  onSave: (input: EntryInput) => void;
  /** Closes the form without saving. */
  onCancel: () => void;
  /** Shown only when editing; removes the entry. */
  onDelete?: () => void;
};

/** Rounds the current time up to the next 30-minute mark for default start. */
function nextHalfHour(from = nowTimeString()): string {
  const minutes = parseTimeToMinutes(from);
  const rounded = Math.ceil(minutes / 30) * 30;
  return addMinutesToTime("00:00", rounded % (24 * 60));
}

/** Lavender "New activity" / "Edit activity" card from the mocks. */
export function ActivityForm({
  date,
  categories,
  initial,
  defaultStartTime,
  onSave,
  onCancel,
  onDelete,
}: ActivityFormProps) {
  const initialStart = initial?.startTime ?? defaultStartTime ?? nextHalfHour();
  const [startTime, setStartTime] = useState(initialStart);
  // null endTime means an ongoing / "Set later" entry.
  const [endTime, setEndTime] = useState<string | null>(
    initial ? initial.endTime : addMinutesToTime(initialStart, 30),
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    initial?.categoryId ?? categories[0]?.id ?? null,
  );
  const [rowColor, setRowColor] = useState<RowColor>(initial?.rowColor ?? "lavender");
  const [error, setError] = useState<string | null>(null);

  const durationLabel = useMemo(() => {
    if (!endTime) return "Finish when you're done.";
    const minutes = entryDurationMinutes(startTime, endTime);
    if (minutes == null) return "End time must be after start.";
    return `Starts now · ${formatDuration(minutes)}.`;
  }, [startTime, endTime]);

  /** Adjusts start or end by ±15 minutes via the stepper buttons. */
  const bumpTime = (field: "start" | "end", deltaMinutes: number) => {
    if (field === "start") {
      setStartTime((current) => addMinutesToTime(current, deltaMinutes));
      return;
    }
    setEndTime((current) =>
      addMinutesToTime(current ?? addMinutesToTime(startTime, 30), deltaMinutes),
    );
  };

  /** Validates required fields, then hands data to the parent via onSave. */
  const handleSave = () => {
    const trimmed = description.trim();
    if (!trimmed) {
      setError("Description is required.");
      return;
    }
    if (endTime && parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    onSave({
      date,
      startTime,
      endTime,
      description: trimmed,
      categoryId,
      rowColor,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{initial ? "Edit activity" : "New activity"}</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={onCancel}
            style={styles.iconButtonGhost}
          >
            <AppIcon name="close" size={16} color={colors.inkMuted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save activity"
            onPress={handleSave}
            style={styles.iconButton}
          >
            <AppIcon name="checkmark" size={18} color={colors.inkOnDark} />
          </Pressable>
        </View>
      </View>

      {/* Start / end steppers; end can show "Set later" when cleared */}
      <View style={styles.timeRow}>
        <TimeField
          label="Start time"
          value={startTime}
          onMinus={() => bumpTime("start", -15)}
          onPlus={() => bumpTime("start", 15)}
        />
        <TimeField
          label="End time"
          value={endTime ?? "Set later"}
          muted={!endTime}
          onMinus={() => bumpTime("end", -15)}
          onPlus={() => bumpTime("end", 15)}
        />
      </View>

      <Text style={styles.helper}>{durationLabel}</Text>
      <Pressable
        onPress={() => setEndTime(endTime ? null : addMinutesToTime(startTime, 30))}
      >
        <Text style={styles.link}>
          {endTime ? "Clear end time." : "Set end time."}
        </Text>
      </Pressable>

      <TextInput
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          setError(null);
        }}
        placeholder="What did you do?"
        placeholderTextColor={colors.inkSoft}
        style={styles.input}
      />

      <Text style={styles.fieldLabel}>Category</Text>
      <View style={styles.chips}>
        <Chip
          label="None"
          selected={categoryId == null}
          onPress={() => setCategoryId(null)}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            selected={categoryId === category.id}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Row color</Text>
      <View style={styles.swatches}>
        {ROW_COLORS.map((color) => (
          <Pressable
            key={color}
            accessibilityRole="button"
            accessibilityLabel={`Row color ${color}`}
            onPress={() => setRowColor(color)}
            style={[
              styles.swatch,
              { backgroundColor: colors.row[color] },
              rowColor === color && styles.swatchSelected,
            ]}
          >
            {rowColor === color ? (
              <AppIcon name="checkmark" size={14} color={colors.ink} />
            ) : null}
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.footerHint}>
        {endTime
          ? "Tap the checkmark to save this activity."
          : "An open-ended entry. Add the end time later."}
      </Text>

      {onDelete ? (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete activity</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Compact start/end control with − / + steppers. */
function TimeField({
  label,
  value,
  muted,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  muted?: boolean;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.timeField}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeControls}>
        <Pressable onPress={onMinus} hitSlop={8} style={styles.stepButton}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.timeValueWrap}>
          <AppIcon name="clock" size={14} color={colors.inkMuted} />
          <Text style={[styles.timeValue, muted && styles.timeValueMuted]}>{value}</Text>
        </View>
        <Pressable onPress={onPlus} hitSlop={8} style={styles.stepButton}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Selectable category pill (None / Work / Personal / …). */
function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLavender,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonGhost: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: "rgba(30,61,51,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  timeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  timeField: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  timeLabel: {
    ...typography.tiny,
    color: colors.inkMuted,
  },
  timeControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeValue: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  timeValueMuted: {
    color: colors.inkSoft,
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  stepText: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: "600",
  },
  helper: {
    ...typography.caption,
    color: colors.inkMuted,
  },
  link: {
    ...typography.caption,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.ink,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.inkOnDark,
  },
  swatches: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  footerHint: {
    ...typography.caption,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  deleteText: {
    ...typography.caption,
    color: colors.danger,
  },
});
