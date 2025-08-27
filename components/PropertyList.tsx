import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Property } from "@/types/property";
import PropertyCard from "./PropertyCard";
import PropertySkeleton from "./PropertySkeleton";
import ErrorBoundary from "./ErrorBoundary";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  emptyMessage?: string;
  headerComponent?: React.ReactElement;
}

const PropertyList = React.memo<PropertyListProps>(function PropertyList({
  properties,
  isLoading = false,
  emptyMessage = "No properties found",
  headerComponent,
}: PropertyListProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme];

  const handlePropertyPress = useCallback((property: Property) => {
    router.push({
      pathname: "/property/[id]" as const,
      params: { id: property.id },
    });
  }, [router]);

  const renderPropertyCard = useCallback(({ item }: { item: Property }) => (
    <ErrorBoundary
      fallback={
        <View style={[styles.errorCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Unable to load property
          </Text>
        </View>
      }
    >
      <PropertyCard property={item} onPress={handlePropertyPress} />
    </ErrorBoundary>
  ), [colors.card, colors.text, handlePropertyPress]);

  const renderSkeleton = () => (
    <View style={styles.listContainer}>
      {headerComponent}
      {Array.from({ length: 5 }).map((_, index) => (
        <PropertySkeleton key={`skeleton-${index}`} />
      ))}
    </View>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  if (properties.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        {headerComponent}
        <View style={styles.emptyContent}>
          <Text style={[styles.emptyText, { color: colors.text }]}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderPropertyCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={headerComponent}
        testID="property-list"
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        // Remove getItemLayout for better error handling
      />
    </ErrorBoundary>
  );
});

export default PropertyList;

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
});