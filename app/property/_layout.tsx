import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import Colors from "@/constants/colors";

export default function PropertyLayout() {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}