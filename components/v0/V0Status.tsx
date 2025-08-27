import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useV0Health } from '@/hooks/useV0';

export default function V0Status() {
  const { health, isHealthy, isLoading, refetch } = useV0Health();

  const getStatusColor = () => {
    if (isLoading) return 'text-gray-500';
    if (isHealthy) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusBg = () => {
    if (isLoading) return 'bg-gray-100';
    if (isHealthy) return 'bg-green-50';
    return 'bg-red-50';
  };

  const getStatusBorder = () => {
    if (isLoading) return 'border-gray-200';
    if (isHealthy) return 'border-green-200';
    return 'border-red-200';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (isHealthy) return 'Connected';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isLoading) return '⏳';
    if (isHealthy) return '✅';
    return '❌';
  };

  return (
    <View className={`p-4 rounded-lg border ${getStatusBg()} ${getStatusBorder()}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold text-gray-800">
          V0 API Status
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isLoading}
          className="bg-white border border-gray-300 rounded px-3 py-1"
        >
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text className="text-gray-700 text-sm">Refresh</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center mb-3">
        <Text className="text-2xl mr-2">{getStatusIcon()}</Text>
        <Text className={`text-lg font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </Text>
      </View>

      {health && !isLoading && (
        <View className="space-y-2">
          {health.version && (
            <View className="flex-row">
              <Text className="text-gray-600 w-20">Version:</Text>
              <Text className="text-gray-800 flex-1">{health.version}</Text>
            </View>
          )}

          {health.modelsAvailable !== undefined && (
            <View className="flex-row">
              <Text className="text-gray-600 w-20">Models:</Text>
              <Text className="text-gray-800 flex-1">
                {health.modelsAvailable} available
              </Text>
            </View>
          )}

          {health.rateLimit && (
            <View className="space-y-1">
              <View className="flex-row">
                <Text className="text-gray-600 w-20">Rate Limit:</Text>
                <Text className="text-gray-800 flex-1">
                  {health.rateLimit.remaining} remaining
                </Text>
              </View>
              
              {health.rateLimit.reset > 0 && (
                <View className="flex-row">
                  <Text className="text-gray-600 w-20">Resets:</Text>
                  <Text className="text-gray-800 flex-1">
                    {new Date(health.rateLimit.reset * 1000).toLocaleTimeString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View className="flex-row">
            <Text className="text-gray-600 w-20">Updated:</Text>
            <Text className="text-gray-800 flex-1">
              {new Date(health.timestamp).toLocaleString()}
            </Text>
          </View>

          {health.error && (
            <View className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <Text className="text-red-700 text-sm">
                Error: {health.error}
              </Text>
            </View>
          )}
        </View>
      )}

      <Text className="text-xs text-gray-500 mt-3">
        V0 is an AI-powered design and code generation service
      </Text>
    </View>
  );
}