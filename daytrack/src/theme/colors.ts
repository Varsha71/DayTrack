export const colors = {
  background: "#F5F6F0",
  surface: "#FFFFFF",
  surfaceMuted: "#EDF1E8",
  surfaceLavender: "#EEE8F5",
  surfaceGreen: "#E6F0E4",
  surfacePeach: "#F6E6DB",
  surfaceBlue: "#E4EEF6",
  surfaceYellow: "#F5F0D8",

  ink: "#1E3D33",
  inkMuted: "#6B7A72",
  inkSoft: "#9AA79F",
  inkOnDark: "#F5F6F0",
  inkOnDarkMuted: "#C5D2CB",

  primary: "#1E3D33",
  primarySoft: "#DDE6DC",
  border: "#E2E7DF",
  todayPill: "#D7E8D2",
  danger: "#B42318",

  row: {
    none: "#FFFFFF",
    green: "#E6F0E4",
    lavender: "#EEE8F5",
    peach: "#F6E6DB",
    blue: "#E4EEF6",
    yellow: "#F5F0D8",
  },

  category: {
    Work: "#EEE8F5",
    Personal: "#E6F0E4",
  },
} as const;

export type RowColor = keyof typeof colors.row;
