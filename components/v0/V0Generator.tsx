import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useV0Generate } from '@/hooks/useV0';

interface V0GeneratorProps {
  onGenerated?: (result: any) => void;
}

export default function V0Generator({ onGenerated }: V0GeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('v0-default');
  const [temperature, setTemperature] = useState(0.7);
  
  const { generate, isLoading, error, result, clearError, clearResult } = useV0Generate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    try {
      const generatedResult = await generate({
        prompt: prompt.trim(),
        model: selectedModel,
        temperature,
        maxTokens: 2048
      });
      
      onGenerated?.(generatedResult);
      
      Alert.alert('Success', 'Content generated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to generate content');
    }
  };

  const handleClear = () => {
    setPrompt('');
    clearResult();
    clearError();
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <ScrollView>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            V0 AI Generator
          </Text>
          <Text className="text-gray-600 mb-2">
            Generate AI-powered content using the HAUS design system
          </Text>
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Text className="text-blue-800 text-sm">
              🎨 All generated content follows HAUS brand guidelines and real estate patterns
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
              Prompt *
            </Text>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="e.g., Create a property search interface with filters for bedrooms, bathrooms, and price range..."
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              style={{ textAlignVertical: 'top' }}
            />
            <View className="mt-2">
              <Text className="text-gray-500 text-xs mb-2">💡 Suggested prompts:</Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "Property comparison table",
                  "Real estate agent profile card", 
                  "Mortgage calculator interface",
                  "Property listing summary"
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setPrompt(suggestion)}
                    className="bg-gray-100 rounded-full px-3 py-1"
                  >
                    <Text className="text-gray-700 text-xs">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Model
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <TouchableOpacity
                className={`p-3 ${selectedModel === 'v0-default' ? 'bg-blue-50' : ''}`}
                onPress={() => setSelectedModel('v0-default')}
              >
                <Text className={`${selectedModel === 'v0-default' ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                  V0 Default
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">
              Temperature: {temperature.toFixed(1)}
            </Text>
            <View className="flex-row items-center space-x-4">
              <TouchableOpacity
                onPress={() => setTemperature(Math.max(0, temperature - 0.1))}
                className="bg-gray-200 rounded-lg p-2"
                disabled={temperature <= 0}
              >
                <Text className={`text-lg ${temperature <= 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                  -
                </Text>
              </TouchableOpacity>
              
              <View className="flex-1 bg-gray-200 rounded-full h-2">
                <View
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: `${(temperature / 2) * 100}%` }}
                />
              </View>
              
              <TouchableOpacity
                onPress={() => setTemperature(Math.min(2, temperature + 0.1))}
                className="bg-gray-200 rounded-lg p-2"
                disabled={temperature >= 2}
              >
                <Text className={`text-lg ${temperature >= 2 ? 'text-gray-400' : 'text-gray-700'}`}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-500 text-sm mt-1">
              Lower = more focused, Higher = more creative
            </Text>
          </View>

          <View className="flex-row space-x-3 mt-6">
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className={`flex-1 rounded-lg py-3 px-4 ${
                isLoading || !prompt.trim()
                  ? 'bg-gray-300'
                  : 'bg-blue-600'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  isLoading || !prompt.trim()
                    ? 'text-gray-500'
                    : 'text-white'
                }`}
              >
                {isLoading ? 'Generating...' : 'Generate'}
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

        {result && (
          <View className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Generated Result
              </Text>
              <TouchableOpacity
                onPress={clearResult}
                className="bg-gray-200 rounded px-3 py-1"
              >
                <Text className="text-gray-600">Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96" nestedScrollEnabled>
              <Text className="text-gray-700 leading-6">
                {result.choices?.[0]?.message?.content || 'No content generated'}
              </Text>
            </ScrollView>

            {result.usage && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-sm text-gray-600">
                  Tokens: {result.usage.total_tokens} ({result.usage.prompt_tokens} prompt + {result.usage.completion_tokens} completion)
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}