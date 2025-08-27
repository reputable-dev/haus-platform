import { Filter } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";

interface FilterButtonProps {
  onPress: () => void;
  activeFilters?: number;
}

export default function FilterButton({ onPress, activeFilters = 0 }: FilterButtonProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      testID="filter-button"
    >
      <Filter size={18} color={colors.text} />
      <Text style={[styles.text, { color: colors.text }]}>Filters</Text>
      {activeFilters > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{activeFilters}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});