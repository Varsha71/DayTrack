// Metro config — allow expo-sqlite's .wasm asset (needed when Expo Router
// server-renders web even if you only open the app on a phone).
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

module.exports = config;
