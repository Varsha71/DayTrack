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
import DateTimePicker from "@expo/ui/community/datetime-picker";

import { AppIcon } from "@/components/app-icon";
import { colors, radius, spacing, typography, type RowColor } from "@/theme";
import type { Category, Entry } from "@/types/models";
import type { EntryInput } from "@/data/store";
import {
  addMinutesToTime,
  dateToTimeString,
  entryDurationMinutes,
  formatDuration,
  nowTimeString,
  parseTimeToMinutes,
  timeStringToDate,
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

/** Create/edit activity card. Background matches the selected row color. */
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
  // Defaults to lavender for new entries and editing uses the entry's color.
  const [rowColor, setRowColor] = useState<RowColor>(initial?.rowColor ?? "lavender");
  const [error, setError] = useState<string | null>(null);

  const durationLabel = useMemo(() => {
    if (!endTime) return "Finish when you're done.";
    const minutes = entryDurationMinutes(startTime, endTime);
    if (minutes == null) return "End time must be after start.";
    return `Duration · ${formatDuration(minutes)}.`;
  }, [startTime, endTime]);

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
    // Match the background color of the ActivityCard while in edit mode.
    <View style={[styles.card, { backgroundColor: colors.row[rowColor] }]}>
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

      {/*  Tappable fields open a native time picker. End can show "Set later" when cleared */}
      <View style={styles.timeRow}>
        <TimeField
          label="Start time"
          dateKey={date}
          time={startTime}
          onChange={setStartTime}
        />
        <TimeField
          label="End time"
          dateKey={date}
          time={endTime}
          placeholder="Set later"
          onChange={setEndTime}
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

/**
 * Tappable time field that opens a native picker.
 * Android uses a dialog; iOS shows a spinner under the field until dismissed.
 */
function TimeField({
  label,
  dateKey,
  time,
  placeholder,
  onChange,
}: {
  label: string;
  dateKey: string;
  time: string | null;
  placeholder?: string;
  onChange: (time: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const fallbackTime = time ?? addMinutesToTime(nowTimeString(), 0);
  const pickerValue = timeStringToDate(dateKey, fallbackTime);
  const displayValue = time ?? placeholder ?? "Set later";
  const muted = time == null;

  const applyPickedTime = (selected: Date) => {
    onChange(dateToTimeString(selected));
    if (process.env.EXPO_OS === "android") {
      setShowPicker(false);
    }
  };

  return (
    <View style={styles.timeField}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${displayValue}`}
        onPress={() => setShowPicker((open) => !open)}
        style={styles.timeValueButton}
      >
        <AppIcon name="clock" size={14} color={colors.inkMuted} />
        <Text style={[styles.timeValue, muted && styles.timeValueMuted]}>
          {displayValue}
        </Text>
      </Pressable>

      {showPicker && process.env.EXPO_OS === "web" ? (
        <TextInput
          value={fallbackTime}
          onChangeText={(text) => {
            if (/^\d{2}:\d{2}$/.test(text)) {
              onChange(text);
            }
          }}
          placeholder="HH:mm"
          placeholderTextColor={colors.inkSoft}
          style={styles.webTimeInput}
          autoFocus
          onBlur={() => setShowPicker(false)}
        />
      ) : null}

      {showPicker && process.env.EXPO_OS !== "web" ? (
        <DateTimePicker
          mode="time"
          value={pickerValue}
          is24Hour
          display={process.env.EXPO_OS === "ios" ? "spinner" : "default"}
          presentation="dialog"
          accentColor={colors.primary}
          onValueChange={(_event, selectedDate) => {
            applyPickedTime(selectedDate);
          }}
          onDismiss={() => setShowPicker(false)}
        />
      ) : null}
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
    // backgroundColor set inline from colors.row[rowColor]
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
  timeValueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 28,
  },
  timeValue: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  timeValueMuted: {
    color: colors.inkSoft,
  },
  webTimeInput: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.ink,
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
