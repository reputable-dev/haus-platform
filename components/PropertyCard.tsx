import { Image } from "expo-image";
import { Heart, MapPin, Bed, Bath, Car } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Property } from "@/types/property";
import Colors from "@/constants/colors";
import { useFavorites } from "@/hooks/useFavorites";
import { useTheme } from "@/providers/ThemeProvider";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface PropertyCardProps {
  property: Property;
  onPress: (property: Property) => void;
}

export default function PropertyCard({ property, onPress }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme } = useTheme();
  const colors = Colors[theme];

  const handleFavoritePress = async () => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    toggleFavorite(property.id);
  };

  const formatPrice = (property: Property) => {
    if (property.price.type === "contact") {
      return "Price on Application";
    } else if (property.price.type === "range") {
      return `$${(property.price.minAmount || 0).toLocaleString()} - $${(property.price.maxAmount || 0).toLocaleString()}`;
    } else if (property.listingType === "rent" && property.price.rentalPeriod) {
      return `$${property.price.amount.toLocaleString()}/${property.price.rentalPeriod === "weekly" ? "week" : "month"}`;
    } else {
      return `$${property.price.amount.toLocaleString()}`;
    }
  };

  const getListingTypeLabel = (property: Property) => {
    switch (property.listingType) {
      case "sale":
        return "For Sale";
      case "rent":
        return "For Rent";
      case "auction":
        return "Auction";
      case "offmarket":
        return "Off Market";
      default:
        return "";
    }
  };

  const isBlurred = property.isExclusive && property.listingType === "offmarket";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress(property)}
      activeOpacity={0.9}
      testID={`property-card-${property.id}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.media[0]?.url }}
          style={[styles.image, isBlurred && styles.blurredImage]}
          contentFit="cover"
          transition={200}
        />
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: colors.background }]}
          onPress={handleFavoritePress}
        >
          <Heart
            size={20}
            color={isFavorite(property.id) ? Colors.light.error : colors.text}
            fill={isFavorite(property.id) ? Colors.light.error : "transparent"}
          />
        </TouchableOpacity>
        <View style={styles.badgeContainer}>
          {property.isNew && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  property.listingType === "sale"
                    ? colors.primary
                    : property.listingType === "rent"
                    ? colors.success
                    : property.listingType === "auction"
                    ? colors.warning
                    : colors.secondary,
              },
            ]}
          >
            <Text style={styles.badgeText}>{getListingTypeLabel(property)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.price, { color: colors.text }]}>{formatPrice(property)}</Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.locationContainer}>
          <MapPin size={14} color={colors.primary} />
          <Text style={[styles.location, { color: colors.text }]} numberOfLines={1}>
            {property.location.suburb}, {property.location.state} {property.location.postcode}
          </Text>
        </View>
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Bed size={16} color={colors.text} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              {property.features.bedrooms}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Bath size={16} color={colors.text} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              {property.features.bathrooms}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Car size={16} color={colors.text} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              {property.features.parkingSpaces}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  blurredImage: {
    opacity: 0.7,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  contentContainer: {
    padding: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featureText: {
    fontSize: 14,
  },
});