import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { useProperties } from "@/hooks/useProperties";
import { useFilteredProperties } from "@/hooks/useProperties";
import PropertyList from "@/components/PropertyList";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import SearchFiltersModal from "@/components/SearchFiltersModal";
import { PropertyType, ListingType } from "@/types/property";

export default function SearchScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { data: properties, isLoading } = useProperties();
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    propertyTypes: PropertyType[];
    listingTypes: ListingType[];
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    suburbs: string[];
    states: string[];
  }>({
    propertyTypes: [],
    listingTypes: [],
    suburbs: [],
    states: [],
  });

  const filteredProperties = useFilteredProperties(properties, {
    search: searchQuery,
    ...filters,
  });

  const activeFilterCount = 
    (filters.propertyTypes?.length || 0) +
    (filters.listingTypes?.length || 0) +
    (filters.suburbs?.length || 0) +
    (filters.states?.length || 0) +
    (filters.minBedrooms !== undefined ? 1 : 0) +
    (filters.maxBedrooms !== undefined ? 1 : 0) +
    (filters.minBathrooms !== undefined ? 1 : 0) +
    (filters.maxBathrooms !== undefined ? 1 : 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0);

  const handleFilterPress = () => {
    setShowFiltersModal(true);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const SearchHeader = () => (
    <View style={styles.searchHeader}>
      <Text style={[styles.title, { color: colors.text }]}>Find Your Perfect Property</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Search across thousands of listings in Australia
      </Text>
      <View style={styles.searchContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search suburbs, properties, or postcodes"
          />
        </View>
        <FilterButton onPress={handleFilterPress} activeFilters={activeFilterCount} />
      </View>
      {filteredProperties.length > 0 && (
        <Text style={[styles.resultsText, { color: colors.text }]}>
          {filteredProperties.length} properties found
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PropertyList
        properties={filteredProperties}
        isLoading={isLoading}
        emptyMessage={
          searchQuery || activeFilterCount > 0
            ? "No properties match your search criteria"
            : "No properties available"
        }
        headerComponent={<SearchHeader />}
      />
      
      <SearchFiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  searchBarContainer: {
    flex: 1,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "500" as const,
    opacity: 0.8,
  },
});