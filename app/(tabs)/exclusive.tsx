import React, { useState } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Lock, Star } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";
import { useOffMarketProperties } from "@/hooks/useProperties";
import PropertyList from "@/components/PropertyList";

export default function ExclusiveScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { data: offMarketProperties, isLoading } = useOffMarketProperties();
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  const handleUnlockPress = () => {
    // In a real app, this would open a subscription modal or navigate to a payment screen
    setIsPremiumUser(true);
  };

  if (!isPremiumUser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.premiumContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1153&q=80" }}
            style={styles.backgroundImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
            style={styles.gradient}
          />
          <View style={styles.contentOverlay}>
            <View style={styles.iconContainer}>
              <Star size={32} color={Colors.light.accent} />
              <Lock size={32} color={Colors.light.accent} />
            </View>
            <Text style={styles.premiumTitle}>Exclusive Off-Market Properties</Text>
            <Text style={styles.premiumDescription}>
              Gain access to our exclusive collection of off-market properties not available on any other platform.
            </Text>
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
              <View style={styles.benefitItem}>
                <Star size={16} color={Colors.light.accent} />
                <Text style={styles.benefitText}>Hidden luxury properties</Text>
              </View>
              <View style={styles.benefitItem}>
                <Star size={16} color={Colors.light.accent} />
                <Text style={styles.benefitText}>Early access to new listings</Text>
              </View>
              <View style={styles.benefitItem}>
                <Star size={16} color={Colors.light.accent} />
                <Text style={styles.benefitText}>Direct contact with premium agents</Text>
              </View>
              <View style={styles.benefitItem}>
                <Star size={16} color={Colors.light.accent} />
                <Text style={styles.benefitText}>Personalized property alerts</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.unlockButton, { backgroundColor: colors.primary }]}
              onPress={handleUnlockPress}
            >
              <Lock size={18} color="#FFFFFF" />
              <Text style={styles.unlockButtonText}>Unlock Premium Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PropertyList
        properties={offMarketProperties || []}
        isLoading={isLoading}
        emptyMessage="No exclusive properties available at the moment"
        headerComponent={
          <View style={styles.headerComponent}>
            <Text style={[styles.title, { color: colors.text }]}>Exclusive Off-Market Properties</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Browse our curated collection of premium off-market properties
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
    fontWeight: "bold" as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  premiumContainer: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  premiumDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  benefitText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  unlockButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});