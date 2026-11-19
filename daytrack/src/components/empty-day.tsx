import { StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { colors, radius, spacing, typography } from "@/theme";

export function EmptyDay() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <AppIcon name="clock" size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>A fresh day.{"\n"}A blank page.</Text>
      <Text style={styles.subtitle}>
        Tap + to log your first activity.{"\n"}Small moments count, too.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 38,
  },
  subtitle: {
    ...typography.meta,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
