import { useTheme as useNextTheme } from "next-themes";
import { useThemeColor } from "@/components/theme-color-provider";

export function useTheme() {
  const nextTheme = useNextTheme();
  const themeColor = useThemeColor();

  return {
    ...nextTheme,
    ...themeColor,
  };
}
