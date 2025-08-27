import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { X, Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { PropertyType, ListingType } from "@/types/property";

interface SearchFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
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
  };
  onFiltersChange: (filters: any) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "rural", label: "Rural" },
  { value: "commercial", label: "Commercial" },
];

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "auction", label: "Auction" },
  { value: "offmarket", label: "Off Market" },
];

const AUSTRALIAN_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"];

export default function SearchFiltersModal({
  visible,
  onClose,
  filters,
  onFiltersChange,
}: SearchFiltersModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      propertyTypes: [],
      listingTypes: [],
      suburbs: [],
      states: [],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const togglePropertyType = (type: PropertyType) => {
    setLocalFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const toggleListingType = (type: ListingType) => {
    setLocalFilters(prev => ({
      ...prev,
      listingTypes: prev.listingTypes.includes(type)
        ? prev.listingTypes.filter(t => t !== type)
        : [...prev.listingTypes, type],
    }));
  };

  const toggleState = (state: string) => {
    setLocalFilters(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state],
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Property Type</Text>
            <View style={styles.chipContainer}>
              {PROPERTY_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: localFilters.propertyTypes.includes(type.value)
                        ? colors.primary
                        : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => togglePropertyType(type.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: localFilters.propertyTypes.includes(type.value)
                          ? "#FFFFFF"
                          : colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                  {localFilters.propertyTypes.includes(type.value) && (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Listing Type</Text>
            <View style={styles.chipContainer}>
              {LISTING_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: localFilters.listingTypes.includes(type.value)
                        ? colors.primary
                        : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => toggleListingType(type.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: localFilters.listingTypes.includes(type.value)
                          ? "#FFFFFF"
                          : colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                  {localFilters.listingTypes.includes(type.value) && (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bedrooms</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Min</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={localFilters.minBedrooms?.toString() || ""}
                  onChangeText={text =>
                    setLocalFilters(prev => ({
                      ...prev,
                      minBedrooms: text ? parseInt(text) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Max</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={localFilters.maxBedrooms?.toString() || ""}
                  onChangeText={text =>
                    setLocalFilters(prev => ({
                      ...prev,
                      maxBedrooms: text ? parseInt(text) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bathrooms</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Min</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={localFilters.minBathrooms?.toString() || ""}
                  onChangeText={text =>
                    setLocalFilters(prev => ({
                      ...prev,
                      minBathrooms: text ? parseInt(text) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Max</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={localFilters.maxBathrooms?.toString() || ""}
                  onChangeText={text =>
                    setLocalFilters(prev => ({
                      ...prev,
                      maxBathrooms: text ? parseInt(text) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Range (AUD)</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Min</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={localFilters.minPrice?.toString() || ""}
                  onChangeText={text =>
                    setLocalFilters(prev => ({
                      ...prev,
                      minPrice: text ? parseInt(text) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Max</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                  value={localFilters.maxPrice?.toString() || ""}
                  onChangeText={text =>
                    setLocalFilters(prev => ({
                      ...prev,
                      maxPrice: text ? parseInt(text) : undefined,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={colors.tabIconDefault}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>States</Text>
            <View style={styles.chipContainer}>
              {AUSTRALIAN_STATES.map(state => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: localFilters.states.includes(state)
                        ? colors.primary
                        : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => toggleState(state)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: localFilters.states.includes(state) ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    {state}
                  </Text>
                  {localFilters.states.includes(state) && <Check size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  clearText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  rangeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});