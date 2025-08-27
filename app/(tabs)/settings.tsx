import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle, 
  LogOut,
  Plug
} from 'lucide-react-native';

const settingsOptions = [
  {
    id: 'profile',
    title: 'Profile Settings',
    subtitle: 'Manage your account information',
    icon: User,
    route: '/settings/profile',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    subtitle: 'Connect your favorite apps and services',
    icon: Plug,
    route: '/settings/integrations',
    highlight: true,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Configure alerts and updates',
    icon: Bell,
    route: '/settings/notifications',
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    subtitle: 'Control your data and security settings',
    icon: Shield,
    route: '/settings/privacy',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    subtitle: 'Customize your app experience',
    icon: Palette,
    route: '/settings/appearance',
  },
  {
    id: 'help',
    title: 'Help & Support',
    subtitle: 'Get help and contact support',
    icon: HelpCircle,
    route: '/settings/help',
  },
];

interface SettingsItemProps {
  option: typeof settingsOptions[0];
}

function SettingsItem({ option }: SettingsItemProps) {
  const Icon = option.icon;

  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 bg-white rounded-xl mb-3 shadow-sm ${
        option.highlight ? 'border-2 border-blue-500' : 'border border-gray-100'
      }`}
      onPress={() => router.push(option.route as any)}
    >
      <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${
        option.highlight ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        <Icon 
          size={20} 
          color={option.highlight ? '#3B82F6' : '#6B7280'} 
        />
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {option.title}
        </Text>
        <Text className="text-sm text-gray-500">
          {option.subtitle}
        </Text>
      </View>

      {option.highlight && (
        <View className="bg-blue-500 px-2 py-1 rounded-full">
          <Text className="text-xs text-white font-medium">New</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center mb-2">
            <Settings size={24} color="#1F2937" />
            <Text className="text-2xl font-bold text-gray-900 ml-3">
              Settings
            </Text>
          </View>
          <Text className="text-base text-gray-600">
            Customize your Haus Platform experience
          </Text>
        </View>

        {/* Settings Options */}
        <View className="mb-8">
          {settingsOptions.map((option) => (
            <SettingsItem key={option.id} option={option} />
          ))}
        </View>

        {/* User Actions */}
        <View className="border-t border-gray-200 pt-6">
          <TouchableOpacity
            className="flex-row items-center p-4 bg-white rounded-xl mb-3 shadow-sm border border-gray-100"
            onPress={() => {
              // Handle logout
            }}
          >
            <View className="w-10 h-10 rounded-lg bg-red-100 items-center justify-center mr-4">
              <LogOut size={20} color="#EF4444" />
            </View>
            
            <View className="flex-1">
              <Text className="text-base font-semibold text-red-600">
                Sign Out
              </Text>
              <Text className="text-sm text-gray-500">
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-sm text-gray-400">
            Haus Platform v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}