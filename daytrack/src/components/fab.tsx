/**
 * Floating Action Button (FAB).
 *
 * The dark green circular "+" button fixed at the bottom-right of Home and Day
 * screens. Tapping it runs the caller's onPress (e.g. open the new-entry form)
 * and triggers a light haptic on iOS when available.
 */

import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/app-icon";
import { colors, radius, spacing } from "@/theme";
import { softHaptic } from "@/utils/haptics";

type FabProps = {
  /** Called when the user taps the button. */
  onPress: () => void;
  /** Spoken label for screen readers. */
  accessibilityLabel?: string;
};

/** Renders the floating "+" button, inset above the home indicator / nav bar. */
export function Fab({ onPress, accessibilityLabel = "Add activity" }: FabProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={async () => {
        await softHaptic();
        onPress();
      }}
      style={[styles.fab, { bottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}
    >
      <AppIcon name="plus" size={28} color={colors.inkOnDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.screen,
    width: 56,
    height: 56,
    borderRadius: radius.fab,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
