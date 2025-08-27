import { Tabs } from "expo-router";
import { Home, Search, Star, User, BarChart3, Bot } from "lucide-react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { FavoritesProvider } from "@/hooks/useFavorites";

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.tabIconDefault,
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
          }}
        >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
            headerTitle: "HAUS",
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color }) => <Search color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="exclusive"
          options={{
            title: "Exclusive",
            tabBarIcon: ({ color }) => <Star color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color }) => <Star color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="v0"
          options={{
            title: "V0 AI",
            tabBarIcon: ({ color }) => <Bot color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
        </Tabs>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}