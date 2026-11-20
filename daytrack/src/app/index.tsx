/**
 * Home screen — "Your days".
 *
 * Lists recent day summaries (today first). Tapping a card opens that day's
 * activity log. The FAB jumps to today with the new-entry form already open
 * (compose=1).
 */

import { useCallback } from "react";
import { BackHandler, FlatList, StyleSheet, Text, View } from "react-native";
import { router, Stack, useFocusEffect } from "expo-router";
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

  // Android hardware back on Home should leave the app, not replay day history
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, []),
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "DayTrack" }} />
      {/* Sticky brand title — stays put while recent days scroll */}
      <View style={[styles.stickyBrand, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.brand}>DayTrack</Text>
      </View>
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
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
  stickyBrand: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 1,
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
