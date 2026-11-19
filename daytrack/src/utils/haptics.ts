/** Light tap feedback for button presses (iOS only; no-ops elsewhere). */
export async function softHaptic() {
  if (process.env.EXPO_OS !== "ios") return;
  try {
    const Haptics = await import("expo-haptics");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Dev builds without the native module can ignore haptics.
  }
}
