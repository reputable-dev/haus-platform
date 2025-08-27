import { Image } from "expo-image";
import { Bell, ChevronRight, Heart, HelpCircle, LogOut, Settings, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/providers/ThemeProvider";

export default function ProfileScreen() {
  const { theme, updateTheme } = useTheme();
  const colors = Colors[theme];

  const toggleTheme = () => {
    updateTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>John Smith</Text>
            <Text style={[styles.profileEmail, { color: colors.text }]}>john.smith@example.com</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => console.log("Edit profile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <MenuItem
            icon={<User size={22} color={colors.primary} />}
            title="Personal Information"
            onPress={() => console.log("Personal Information")}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem
            icon={<Bell size={22} color={colors.primary} />}
            title="Notifications"
            onPress={() => console.log("Notifications")}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem
            icon={<Heart size={22} color={colors.primary} />}
            title="Saved Properties"
            onPress={() => console.log("Saved Properties")}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <MenuItem
            icon={<Settings size={22} color={colors.primary} />}
            title="App Settings"
            onPress={toggleTheme}
            rightElement={
              <Text style={{ color: colors.text }}>
                {theme === "light" ? "Light Mode" : "Dark Mode"}
              </Text>
            }
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          <MenuItem
            icon={<HelpCircle size={22} color={colors.primary} />}
            title="Help & Support"
            onPress={() => console.log("Help & Support")}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem
            icon={<LogOut size={22} color={colors.error} />}
            title="Log Out"
            titleColor={colors.error}
            onPress={() => console.log("Log Out")}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text }]}>HAUS v1.0.0</Text>
        <Text style={[styles.footerText, { color: colors.text }]}>© 2025 HAUS Realty</Text>
      </View>
    </View>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  titleColor?: string;
  colors: any;
}

function MenuItem({ icon, title, onPress, rightElement, titleColor, colors }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={[styles.menuItemTitle, { color: titleColor || colors.text }]}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {rightElement || <ChevronRight size={20} color={colors.text} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold" as const,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});