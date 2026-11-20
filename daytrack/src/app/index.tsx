/**
 * Home screen — "Your days".
 *
 * Lists recent day summaries (today first). Tapping a card opens that day's
 * activity log. The FAB jumps to today with the new-entry form already open
 * (compose=1).
 */

import { FlatList, StyleSheet, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DaySummaryCard } from "@/components/day-summary-card";
import { Fab } from "@/components/fab";
import { useStore } from "@/data/store";
import { colors, spacing, typography } from "@/theme";
import { monthLong, todayKey } from "@/utils/date";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { getRecentDaySummaries } = useStore();
  const summaries = getRecentDaySummaries(7);
  const today = todayKey();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "daytrack" }} />
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.date}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: 120 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.brand}>daytrack</Text>
            <Text style={styles.tagline}>A little more intentional, every day.</Text>
            <Text style={styles.title}>Your days</Text>
            <Text style={styles.subtitle}>A record of where your time goes.</Text>
            <View style={styles.sectionRow}>
              <Text style={styles.section}>Recent days</Text>
              <Text style={styles.month}>{monthLong(today)}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <DaySummaryCard summary={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <Text style={styles.footer}>Make time visible.</Text>
        }
      />
      <Fab
        accessibilityLabel="Add activity for today"
        onPress={() =>
          router.push({
            pathname: "/day/[date]",
            params: { date: today, compose: "1" },
          })
        }
      />
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
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  brand: {
    ...typography.brand,
    color: colors.ink,
  },
  tagline: {
    ...typography.meta,
    color: colors.inkMuted,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.hero,
    color: colors.ink,
  },
  subtitle: {
    ...typography.meta,
    color: colors.inkMuted,
    marginBottom: spacing.xl,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  section: {
    ...typography.section,
    color: colors.inkSoft,
  },
  month: {
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
