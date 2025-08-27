import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bed, Bath, Car, Heart, MapPin, Phone, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { useProperty } from "@/hooks/useProperties";
import { useFavorites } from "@/hooks/useFavorites";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme];
  
  // Safely get params and extract id with proper error handling
  const rawParams = useLocalSearchParams();
  const params = rawParams || {};
  
  // Handle both string and array cases for id parameter
  let id: string | null = null;
  try {
    if (params.id) {
      id = Array.isArray(params.id) ? params.id[0] : params.id;
      // Ensure id is a string
      id = typeof id === 'string' ? id : String(id);
    }
  } catch (error) {
    console.error('Error parsing property ID:', error);
    id = null;
  }
  
  const { data: property, isLoading } = useProperty(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleBack = () => {
    router.back();
  };

  const handleFavoritePress = async () => {
    if (!property) return;
    
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    toggleFavorite(property.id);
  };

  const handleContactAgent = () => {
    // In a real app, this would open a contact form or initiate a call
    console.log("Contact agent");
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading property details...</Text>
      </View>
    );
  }

  if (!id || !property) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Property not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatPrice = () => {
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(newIndex);
            }}
          >
            {property.media.map((media, index) => (
              <Image
                key={media.id}
                source={{ uri: media.url }}
                style={styles.image}
                contentFit="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicators}>
            {property.media.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      index === currentImageIndex ? colors.primary : "rgba(255, 255, 255, 0.5)",
                  },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.backIconButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteIconButton} onPress={handleFavoritePress}>
            <Heart
              size={24}
              color="#FFFFFF"
              fill={isFavorite(property.id) ? Colors.light.error : "transparent"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.price, { color: colors.text }]}>{formatPrice()}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{property.title}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.primary} />
              <Text style={[styles.location, { color: colors.text }]}>
                {property.location.address}, {property.location.suburb}, {property.location.state}{" "}
                {property.location.postcode}
              </Text>
            </View>
          </View>

          <View style={[styles.featuresContainer, { backgroundColor: colors.card }]}>
            <View style={styles.featureItem}>
              <Bed size={24} color={colors.primary} />
              <Text style={[styles.featureValue, { color: colors.text }]}>
                {property.features.bedrooms}
              </Text>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Bedrooms</Text>
            </View>
            <View style={styles.featureItem}>
              <Bath size={24} color={colors.primary} />
              <Text style={[styles.featureValue, { color: colors.text }]}>
                {property.features.bathrooms}
              </Text>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Bathrooms</Text>
            </View>
            <View style={styles.featureItem}>
              <Car size={24} color={colors.primary} />
              <Text style={[styles.featureValue, { color: colors.text }]}>
                {property.features.parkingSpaces}
              </Text>
              <Text style={[styles.featureLabel, { color: colors.text }]}>Parking</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.text }]}>{property.description}</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Property Details</Text>
            <View style={styles.detailsGrid}>
              <DetailItem
                label="Property Type"
                value={property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                colors={colors}
              />
              <DetailItem
                label="Land Size"
                value={property.features.landSize ? `${property.features.landSize} m²` : "N/A"}
                colors={colors}
              />
              <DetailItem
                label="Building Size"
                value={property.features.buildingSize ? `${property.features.buildingSize} m²` : "N/A"}
                colors={colors}
              />
              <DetailItem
                label="Year Built"
                value={property.features.yearBuilt ? property.features.yearBuilt.toString() : "N/A"}
                colors={colors}
              />
              <DetailItem
                label="Air Conditioning"
                value={property.features.hasAirConditioning ? "Yes" : "No"}
                colors={colors}
              />
              <DetailItem
                label="Pool"
                value={property.features.hasPool ? "Yes" : "No"}
                colors={colors}
              />
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Agent</Text>
            <View style={[styles.agentContainer, { backgroundColor: colors.card }]}>
              <Image
                source={{ uri: property.agent.profileImage }}
                style={styles.agentImage}
                contentFit="cover"
              />
              <View style={styles.agentInfo}>
                <Text style={[styles.agentName, { color: colors.text }]}>{property.agent.name}</Text>
                <Text style={[styles.agentAgency, { color: colors.text }]}>
                  {property.agent.agency}
                </Text>
                <View style={styles.agentContactContainer}>
                  <TouchableOpacity
                    style={[styles.agentContactButton, { backgroundColor: colors.primary }]}
                    onPress={handleContactAgent}
                  >
                    <Phone size={16} color="#FFFFFF" />
                    <Text style={styles.agentContactButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.agentContactButton, { backgroundColor: colors.secondary }]}
                    onPress={handleContactAgent}
                  >
                    <Mail size={16} color="#FFFFFF" />
                    <Text style={styles.agentContactButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: colors.primary }]}
          onPress={handleContactAgent}
        >
          <Text style={styles.footerButtonText}>Contact Agent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  colors: any;
}

function DetailItem({ label, value, colors }: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <Text style={[styles.detailLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width,
    height: 300,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backIconButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteIconButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold" as const,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  featureItem: {
    alignItems: "center",
  },
  featureValue: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginTop: 8,
    marginBottom: 4,
  },
  featureLabel: {
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  agentContainer: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
  },
  agentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  agentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  agentAgency: {
    fontSize: 14,
    marginBottom: 12,
  },
  agentContactContainer: {
    flexDirection: "row",
    gap: 12,
  },
  agentContactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  agentContactButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});