import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { useAllProperties } from "@/hooks/useProperties";
import { useFavorites, useFavoriteProperties } from "@/hooks/useFavorites";
import PropertyList from "@/components/PropertyList";

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { data: allProperties, isLoading: isLoadingProperties } = useAllProperties();
  const { isLoading: isLoadingFavorites } = useFavorites();
  
  const favoriteProperties = useFavoriteProperties(allProperties || []);
  const isLoading = isLoadingProperties || isLoadingFavorites;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PropertyList
        properties={favoriteProperties}
        isLoading={isLoading}
        emptyMessage="You haven't saved any favorites yet"
        headerComponent={
          <View style={styles.headerComponent}>
            <Text style={[styles.title, { color: colors.text }]}>Your Favorites</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Properties you've saved for later
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerComponent: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
});