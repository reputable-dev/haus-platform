import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import V0Generator from '@/components/v0/V0Generator';
import V0ComponentGenerator from '@/components/v0/V0ComponentGenerator';
import V0Status from '@/components/v0/V0Status';
import HausDesignSystemInfo from '@/components/v0/HausDesignSystemInfo';

type TabType = 'generator' | 'components' | 'design-system' | 'status';

export default function V0Screen() {
  const [activeTab, setActiveTab] = useState<TabType>('generator');

  const tabs = [
    { id: 'generator' as TabType, label: 'Generator', icon: '🤖' },
    { id: 'components' as TabType, label: 'Components', icon: '⚛️' },
    { id: 'design-system' as TabType, label: 'Design System', icon: '🎨' },
    { id: 'status' as TabType, label: 'Status', icon: '📊' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'generator':
        return <V0Generator />;
      case 'components':
        return <V0ComponentGenerator />;
      case 'design-system':
        return <HausDesignSystemInfo />;
      case 'status':
        return (
          <ScrollView className="flex-1 p-4">
            <V0Status />
          </ScrollView>
        );
      default:
        return <V0Generator />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-200">
          <Text className="text-3xl font-bold text-gray-900">HAUS AI Studio</Text>
          <Text className="text-gray-600 mt-1">
            Generate content, components, and designs with HAUS design system
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            <Text className="text-sm text-gray-500">
              Powered by v0 AI with HAUS brand guidelines
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-gray-50 border-b border-gray-200">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 ${
                activeTab === tab.id
                  ? 'bg-white border-b-2 border-blue-500'
                  : ''
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-lg mr-2">{tab.icon}</Text>
                <Text
                  className={`font-medium ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View className="flex-1">
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}