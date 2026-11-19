/**
 * Root layout for Expo Router.
 *
 * Wraps every screen in StoreProvider (shared categories/entries state) and
 * defines the navigation stack: Home (index) and Day (day/[date]). Native
 * headers are hidden because each screen draws its own UI chrome.
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { StoreProvider } from "@/data/store";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        {/* Home — "Your days" list */}
        <Stack.Screen name="index" />
        {/* Day detail — activities for one YYYY-MM-DD date */}
        <Stack.Screen name="day/[date]" />
      </Stack>
    </StoreProvider>
  );
}
