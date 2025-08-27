import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import Colors from "@/constants/colors";

export default function PropertySkeleton() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [fadeAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Animated.View
        style={[
          styles.imageSkeleton,
          { backgroundColor: colors.border, opacity: fadeAnim },
        ]}
      />
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.textSkeleton,
            styles.priceSkeleton,
            { backgroundColor: colors.border, opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.textSkeleton,
            styles.titleSkeleton,
            { backgroundColor: colors.border, opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.textSkeleton,
            styles.locationSkeleton,
            { backgroundColor: colors.border, opacity: fadeAnim },
          ]}
        />
        <View style={styles.featuresContainer}>
          <Animated.View
            style={[
              styles.featureSkeleton,
              { backgroundColor: colors.border, opacity: fadeAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.featureSkeleton,
              { backgroundColor: colors.border, opacity: fadeAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.featureSkeleton,
              { backgroundColor: colors.border, opacity: fadeAnim },
            ]}
          />
        </View>
      </View>
    </View>
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
  imageSkeleton: {
    height: 200,
    width: "100%",
  },
  contentContainer: {
    padding: 16,
  },
  textSkeleton: {
    borderRadius: 4,
    marginBottom: 8,
  },
  priceSkeleton: {
    height: 20,
    width: "40%",
  },
  titleSkeleton: {
    height: 16,
    width: "80%",
  },
  locationSkeleton: {
    height: 14,
    width: "60%",
  },
  featuresContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  featureSkeleton: {
    height: 12,
    width: 40,
    borderRadius: 4,
  },
});