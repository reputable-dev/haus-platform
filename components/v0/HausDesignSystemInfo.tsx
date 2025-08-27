import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Palette, Layout, Type, Zap } from 'lucide-react-native';

export default function HausDesignSystemInfo() {
  const colorPalette = [
    { name: 'Primary', color: '#3366FF', usage: 'Main brand, buttons, links' },
    { name: 'Secondary', color: '#FF6B6B', usage: 'Accents, highlights' },
    { name: 'Success', color: '#06D6A0', usage: 'Success states, rent badges' },
    { name: 'Warning', color: '#FFD166', usage: 'Warnings, auction badges' },
    { name: 'Error', color: '#EF476F', usage: 'Errors, validation' },
    { name: 'Neutral', color: '#073B4C', usage: 'Text, dark elements' },
  ];

  const componentPatterns = [
    {
      name: 'Property Card',
      description: '200px image, price at 18px bold, bed/bath/car icons',
      icon: '🏠'
    },
    {
      name: 'Metric Widget',
      description: 'Trend icons, card background, responsive sizing',
      icon: '📊'
    },
    {
      name: 'Filter Button',
      description: 'Outlined style, count badge, 8px radius',
      icon: '🔍'
    },
    {
      name: 'Navigation Tab',
      description: 'Primary color active, 60% opacity inactive',
      icon: '🧭'
    }
  ];

  const typographyScale = [
    { name: 'Title', size: '24px', weight: '700', usage: 'Page headers' },
    { name: 'Subtitle', size: '18px', weight: '600', usage: 'Section headers' },
    { name: 'Body', size: '16px', weight: '400', usage: 'Standard text' },
    { name: 'Small', size: '14px', weight: '500', usage: 'Helper text' },
    { name: 'Caption', size: '12px', weight: '600', usage: 'Badges, labels' },
  ];

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          HAUS Design System
        </Text>
        <Text className="text-gray-600 mb-4">
          All v0 AI generations follow these design guidelines for brand consistency
        </Text>
      </View>

      {/* Colors */}
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <Palette size={20} color="#3366FF" />
          <Text className="text-lg font-semibold text-gray-800 ml-2">
            Color Palette
          </Text>
        </View>
        
        <View className="space-y-3">
          {colorPalette.map((color, index) => (
            <View key={index} className="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <View 
                className="w-12 h-12 rounded-lg mr-3"
                style={{ backgroundColor: color.color }}
              />
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{color.name}</Text>
                <Text className="text-sm text-gray-600">{color.color}</Text>
                <Text className="text-xs text-gray-500">{color.usage}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Typography */}
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <Type size={20} color="#3366FF" />
          <Text className="text-lg font-semibold text-gray-800 ml-2">
            Typography Scale
          </Text>
        </View>
        
        <View className="space-y-3">
          {typographyScale.map((type, index) => (
            <View key={index} className="p-3 bg-gray-50 rounded-lg">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-gray-800">{type.name}</Text>
                <Text className="text-sm text-gray-600">{type.size} / {type.weight}</Text>
              </View>
              <Text className="text-xs text-gray-500 mb-2">{type.usage}</Text>
              <Text 
                className="text-gray-800"
                style={{ 
                  fontSize: parseInt(type.size), 
                  fontWeight: type.weight as any 
                }}
              >
                Sample Text
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Component Patterns */}
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <Layout size={20} color="#3366FF" />
          <Text className="text-lg font-semibold text-gray-800 ml-2">
            Component Patterns
          </Text>
        </View>
        
        <View className="space-y-3">
          {componentPatterns.map((pattern, index) => (
            <View key={index} className="p-3 bg-gray-50 rounded-lg">
              <View className="flex-row items-center mb-2">
                <Text className="text-lg mr-2">{pattern.icon}</Text>
                <Text className="font-semibold text-gray-800">{pattern.name}</Text>
              </View>
              <Text className="text-sm text-gray-600">{pattern.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Key Principles */}
      <View className="mb-8">
        <View className="flex-row items-center mb-4">
          <Zap size={20} color="#3366FF" />
          <Text className="text-lg font-semibold text-gray-800 ml-2">
            Key Principles
          </Text>
        </View>
        
        <View className="space-y-3">
          {[
            {
              title: '4px Grid System',
              description: 'All spacing uses multiples of 4px for visual consistency'
            },
            {
              title: '12px Border Radius',
              description: 'Cards and major containers use 12px, buttons use 8px'
            },
            {
              title: 'Lucide Icons Only',
              description: 'All icons must be from Lucide React Native library'
            },
            {
              title: 'Real Estate Focus',
              description: 'Components prioritize property, agent, and real estate workflows'
            },
            {
              title: 'Theme Support',
              description: 'All components support light and dark themes with useTheme hook'
            },
            {
              title: 'Responsive Design',
              description: 'Breakpoint at 768px for tablet/desktop adaptations'
            }
          ].map((principle, index) => (
            <View key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Text className="font-semibold text-blue-800 mb-1">{principle.title}</Text>
              <Text className="text-sm text-blue-700">{principle.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Usage Note */}
      <View className="bg-green-50 border border-green-200 rounded-lg p-4">
        <Text className="font-semibold text-green-800 mb-2">✨ AI Generation Benefits</Text>
        <Text className="text-sm text-green-700">
          When you use v0 AI generation, all these guidelines are automatically applied. 
          Your generated components will match HAUS branding, use the correct colors, 
          follow spacing rules, and include appropriate real estate patterns.
        </Text>
      </View>
    </ScrollView>
  );
}