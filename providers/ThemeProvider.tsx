import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeType = "light" | "dark";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme() as ThemeType | null;
  const [theme, setTheme] = useState<ThemeType>("light");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        } else if (systemColorScheme) {
          setTheme(systemColorScheme);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const updateTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  return {
    theme,
    updateTheme,
    isLoading,
  };
});