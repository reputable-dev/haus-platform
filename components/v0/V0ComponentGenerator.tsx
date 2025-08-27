import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useV0Component } from '@/hooks/useV0';

interface V0ComponentGeneratorProps {
  onGenerated?: (result: any) => void;
}

export default function V0ComponentGenerator({ onGenerated }: V0ComponentGeneratorProps) {
  const [description, setDescription] = useState('');
  const [componentType, setComponentType] = useState<'react' | 'vue' | 'svelte'>('react');
  const [framework, setFramework] = useState<'nextjs' | 'vite' | 'remix'>('nextjs');
  const [styling, setStyling] = useState<'tailwind' | 'css-modules' | 'styled-components'>('tailwind');
  const [useTypeScript, setUseTypeScript] = useState(true);

  const { generateComponent, isLoading, error, component, clearError, clearComponent } = useV0Component();

  const handleGenerate = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a component description');
      return;
    }

    try {
      const result = await generateComponent({
        description: description.trim(),
        componentType,
        framework,
        styling,
        typescript: useTypeScript
      });

      onGenerated?.(result);
      Alert.alert('Success', 'Component generated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to generate component');
    }
  };

  const handleClear = () => {
    setDescription('');
    clearComponent();
    clearError();
  };

  const renderOptionButtons = (
    options: string[],
    selectedValue: string,
    onSelect: (value: any) => void,
    title: string
  ) => (
    <View>
      <Text className="text-gray-700 font-medium mb-2">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            className={`px-4 py-2 rounded-lg border ${
              selectedValue === option
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`${
                selectedValue === option ? 'text-blue-700' : 'text-gray-700'
              } capitalize`}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-white">
      <ScrollView>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            V0 Component Generator
          </Text>
          <Text className="text-gray-600 mb-2">
            Generate components following HAUS design system
          </Text>
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Text className="text-blue-800 text-sm">
              ⚛️ Components use HAUS colors (#3366FF, #FF6B6B), 12px radius, Lucide icons, and real estate patterns
            </Text>
          </View>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <Text className="text-red-700 font-medium">Error</Text>
            <Text className="text-red-600 mt-1">{error}</Text>
            <TouchableOpacity
              onPress={clearError}
              className="mt-2 bg-red-100 rounded px-3 py-1 self-start"
            >
              <Text className="text-red-700">Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Component Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., A property card showing price, bedrooms, bathrooms, and location with a favorite button..."
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              style={{ textAlignVertical: 'top' }}
            />
            <View className="mt-2">
              <Text className="text-gray-500 text-xs mb-2">🏠 Real Estate Components:</Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "Property listing card with image and details",
                  "Search filter panel with price and location",
                  "Agent contact card with photo and rating", 
                  "Mortgage calculator with monthly payment",
                  "Property comparison table",
                  "Dashboard metric widget with trend"
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setDescription(suggestion)}
                    className="bg-gray-100 rounded-full px-3 py-1"
                  >
                    <Text className="text-gray-700 text-xs">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {renderOptionButtons(
            ['react', 'vue', 'svelte'],
            componentType,
            setComponentType,
            'Component Type'
          )}

          {renderOptionButtons(
            ['nextjs', 'vite', 'remix'],
            framework,
            setFramework,
            'Framework'
          )}

          {renderOptionButtons(
            ['tailwind', 'css-modules', 'styled-components'],
            styling,
            setStyling,
            'Styling'
          )}

          <View>
            <Text className="text-gray-700 font-medium mb-2">TypeScript</Text>
            <TouchableOpacity
              onPress={() => setUseTypeScript(!useTypeScript)}
              className={`flex-row items-center p-3 rounded-lg border ${
                useTypeScript ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <View
                className={`w-5 h-5 rounded border-2 mr-3 ${
                  useTypeScript ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                }`}
              >
                {useTypeScript && (
                  <Text className="text-white text-xs text-center leading-4">✓</Text>
                )}
              </View>
              <Text className={useTypeScript ? 'text-blue-700' : 'text-gray-700'}>
                Use TypeScript
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row space-x-3 mt-6">
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={isLoading || !description.trim()}
              className={`flex-1 rounded-lg py-3 px-4 ${
                isLoading || !description.trim()
                  ? 'bg-gray-300'
                  : 'bg-blue-600'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  isLoading || !description.trim()
                    ? 'text-gray-500'
                    : 'text-white'
                }`}
              >
                {isLoading ? 'Generating...' : 'Generate Component'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClear}
              className="bg-gray-200 rounded-lg py-3 px-4"
            >
              <Text className="text-gray-700 text-center font-medium">
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {component && (
          <View className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Generated Component: {component.component?.name || 'Untitled'}
              </Text>
              <TouchableOpacity
                onPress={clearComponent}
                className="bg-gray-200 rounded px-3 py-1"
              >
                <Text className="text-gray-600">Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96" nestedScrollEnabled>
              <View className="bg-gray-800 rounded-lg p-3">
                <Text className="text-gray-300 font-mono text-sm">
                  {component.component?.code || 'No code generated'}
                </Text>
              </View>
            </ScrollView>

            {component.component?.dependencies && component.component.dependencies.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Dependencies:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {component.component.dependencies.map((dep: string, index: number) => (
                    <View key={index} className="bg-gray-200 rounded px-2 py-1">
                      <Text className="text-xs text-gray-700">{dep}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {component.suggestions && component.suggestions.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Suggestions:</Text>
                {component.suggestions.map((suggestion: string, index: number) => (
                  <Text key={index} className="text-sm text-gray-600 mb-1">
                    • {suggestion}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}