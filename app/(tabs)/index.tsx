import { Image } from "expo-image";
import { router } from "expo-router";
import { Home, Search, Star, Zap } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { useProperties } from "@/hooks/useProperties";
import PropertyList from "@/components/PropertyList";

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { data: properties, isLoading } = useProperties();

  const featuredProperties = properties?.filter(p => p.isPremium).slice(0, 3) || [];

  const handleSearchPress = () => {
    router.push("/search");
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.logoText, { color: colors.primary }]}>HAUS</Text>
      </View>

      <View style={styles.heroContainer}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Find Your Dream Australian Home</Text>
          <Text style={styles.heroSubtitle}>
            Discover exclusive properties with AI-powered matching
          </Text>
          <TouchableOpacity 
            style={[styles.heroButton, { backgroundColor: colors.primary }]}
            onPress={handleSearchPress}
          >
            <Search size={18} color="#FFFFFF" />
            <Text style={styles.heroButtonText}>Start Searching</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Choose HAUS</Text>
        <View style={styles.featuresGrid}>
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Zap size={32} color={colors.primary} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>AI-Powered Matching</Text>
            <Text style={[styles.featureDescription, { color: colors.text }]}>
              Find properties that match your preferences with our smart AI
            </Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Star size={32} color={colors.primary} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>Exclusive Listings</Text>
            <Text style={[styles.featureDescription, { color: colors.text }]}>
              Access off-market properties not available on other platforms
            </Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <Home size={32} color={colors.primary} />
            <Text style={[styles.featureTitle, { color: colors.text }]}>Local Expertise</Text>
            <Text style={[styles.featureDescription, { color: colors.text }]}>
              Australian market specialists with deep local knowledge
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.featuredContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Properties</Text>
        <PropertyList 
          properties={featuredProperties} 
          isLoading={isLoading}
          emptyMessage="No featured properties available"
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>HAUS in Numbers</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>50K+</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Properties Listed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>100+</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Australian Suburbs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>98%</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>AI Match Accuracy</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold" as const,
    letterSpacing: 2,
  },
  heroContainer: {
    position: "relative",
    height: 300,
    marginBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  featuresContainer: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  featureCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  featuredContainer: {
    padding: 16,
    marginBottom: 24,
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold" as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
});