import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolView, type SFSymbol } from "expo-symbols";

import { colors } from "@/theme";

type IconName =
  | "chevron-left"
  | "chevron-right"
  | "plus"
  | "pencil"
  | "clock"
  | "checkmark"
  | "close";

const SF_NAMES: Record<IconName, SFSymbol> = {
  "chevron-left": "chevron.left",
  "chevron-right": "chevron.right",
  plus: "plus",
  pencil: "pencil",
  clock: "clock",
  checkmark: "checkmark",
  close: "xmark",
};

const MD_NAMES: Record<IconName, keyof typeof MaterialIcons.glyphMap> = {
  "chevron-left": "chevron-left",
  "chevron-right": "chevron-right",
  plus: "add",
  pencil: "edit",
  clock: "schedule",
  checkmark: "check",
  close: "close",
};

type AppIconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

export function AppIcon({
  name,
  size = 18,
  color = colors.ink,
}: AppIconProps) {
  if (process.env.EXPO_OS === "ios") {
    return (
      <SymbolView
        name={SF_NAMES[name]}
        tintColor={color}
        size={size}
        weight="medium"
      />
    );
  }

  return <MaterialIcons name={MD_NAMES[name]} size={size} color={color} />;
}
