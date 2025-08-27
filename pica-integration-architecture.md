# Pica Integration Architecture for React Native/Expo App

## Executive Summary

Based on comprehensive research of Pica's platform, this document provides a detailed integration architecture plan for implementing Pica's OneTool SDK, AuthKit authentication, and BuildKit components in a React Native/Expo + tRPC + TypeScript stack.

**Key Finding**: Pica AuthKit is primarily web-focused with no native React Native support. However, Pica's OneTool SDK can be integrated through backend implementation patterns.

## Platform Overview

### Pica Core Components

1. **OneTool SDK**: Single SDK to connect AI agents to 150+ APIs and tools
2. **AuthKit**: Multi-tenant authentication component ("Plaid for integrations")
3. **BuildKit**: Zero-shot integration building with natural language prompts
4. **Passthrough API**: Access to 21,000+ actions through standardized endpoints

### Integration Capabilities

- **150+ Platform Integrations**: QuickBooks, Salesforce, GitHub, Asana, and more
- **AI-Powered**: Built for Vercel AI SDK, Anthropic MCP, LangChain
- **Multi-Model Support**: OpenAI, Google, Anthropic
- **Real-time Logging**: Complete action traceability
- **Rust-Powered**: High performance and memory safety

## Architecture Strategy for React Native/Expo

### Recommended Hybrid Approach

Since Pica AuthKit lacks native React Native support, we recommend a **Backend-Proxied Architecture**:

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   React Native      │    │   Backend API       │    │   Pica Platform     │
│   (Expo)           │    │   (tRPC)           │    │                     │
│                     │    │                     │    │                     │
│  - Settings UI      │◄──►│  - Auth Endpoints   │◄──►│  - OneTool SDK      │
│  - Integration      │    │  - Token Management │    │  - AuthKit          │
│    Status          │    │  - Pica Proxy       │    │  - BuildKit         │
│  - Secure Storage   │    │  - Connection Store │    │  - Integrations     │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Implementation Plan

### Phase 1: Backend Integration (tRPC + Pica)

#### 1.1 Install Dependencies

```bash
# Backend dependencies
npm install @picahq/ai @picahq/authkit-node
npm install @ai-sdk/openai ai

# Types and utilities
npm install @types/node dotenv
```

#### 1.2 Environment Configuration

```typescript
// .env
PICA_SECRET_KEY=your_pica_secret_key
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_url

// For production
PICA_SERVER_URL=https://api.picaos.com
```

#### 1.3 Pica Service Setup

```typescript
// backend/services/pica.service.ts
import { Pica } from "@picahq/ai";
import { generateToken } from "@picahq/authkit-node";

export class PicaService {
  private pica: Pica;
  
  constructor() {
    this.pica = new Pica(process.env.PICA_SECRET_KEY!, {
      serverUrl: process.env.PICA_SERVER_URL,
      authkit: true, // Enable user connection prompts
      permissions: ['read', 'write'] // Control access levels
    });
  }

  // Generate AuthKit token for user
  async generateAuthToken(userId: string, metadata?: Record<string, any>) {
    return generateToken({
      identity: {
        type: "user",
        value: userId,
        metadata
      }
    });
  }

  // Get available integrations
  async getAvailableIntegrations() {
    return this.pica.getConnectors();
  }

  // Get user's connected integrations
  async getUserConnections(userId: string) {
    return this.pica.getConnectionsByUser(userId);
  }

  // Execute integration action
  async executeAction(userId: string, connector: string, action: string, data: any) {
    return this.pica.executeAction({
      userId,
      connector,
      action,
      data
    });
  }

  // Generate AI system prompt with user's available tools
  async generateSystemPrompt(userId?: string) {
    return this.pica.generateSystemPrompt({ userId });
  }
}
```

#### 1.4 tRPC Procedures

```typescript
// backend/routers/integrations.router.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { PicaService } from '../services/pica.service';

const picaService = new PicaService();

export const integrationsRouter = router({
  // Generate authentication token
  generateAuthToken: protectedProcedure
    .input(z.object({
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const token = await picaService.generateAuthToken(
        ctx.user.id,
        input.metadata
      );
      return { token };
    }),

  // Get available integrations
  getAvailableIntegrations: publicProcedure
    .query(async () => {
      return picaService.getAvailableIntegrations();
    }),

  // Get user's connected integrations
  getUserConnections: protectedProcedure
    .query(async ({ ctx }) => {
      return picaService.getUserConnections(ctx.user.id);
    }),

  // Execute integration action
  executeAction: protectedProcedure
    .input(z.object({
      connector: z.string(),
      action: z.string(),
      data: z.record(z.any())
    }))
    .mutation(async ({ ctx, input }) => {
      return picaService.executeAction(
        ctx.user.id,
        input.connector,
        input.action,
        input.data
      );
    }),

  // Disconnect integration
  disconnectIntegration: protectedProcedure
    .input(z.object({
      connectionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return picaService.disconnectIntegration(
        ctx.user.id,
        input.connectionId
      );
    }),

  // Get integration status
  getIntegrationStatus: protectedProcedure
    .input(z.object({
      connector: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return picaService.getConnectionStatus(
        ctx.user.id,
        input.connector
      );
    })
});
```

### Phase 2: React Native Frontend Implementation

#### 2.1 Install Frontend Dependencies

```bash
# React Native/Expo dependencies
npx expo install expo-secure-store expo-web-browser expo-linking
npm install @tanstack/react-query lucide-react-native
npm install react-native-webview

# If using NativeWind
npm install nativewind tailwindcss
```

#### 2.2 Secure Token Storage

```typescript
// utils/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export class SecureTokenStorage {
  private static readonly AUTH_TOKEN_KEY = 'pica_auth_token';
  private static readonly CONNECTION_TOKENS_KEY = 'pica_connection_tokens';

  static async storeAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.AUTH_TOKEN_KEY, token);
  }

  static async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.AUTH_TOKEN_KEY);
  }

  static async removeAuthToken(): Promise<void> {
    await SecureStore.deleteItemAsync(this.AUTH_TOKEN_KEY);
  }

  static async storeConnectionTokens(tokens: Record<string, string>): Promise<void> {
    await SecureStore.setItemAsync(
      this.CONNECTION_TOKENS_KEY,
      JSON.stringify(tokens)
    );
  }

  static async getConnectionTokens(): Promise<Record<string, string>> {
    const tokens = await SecureStore.getItemAsync(this.CONNECTION_TOKENS_KEY);
    return tokens ? JSON.parse(tokens) : {};
  }
}
```

#### 2.3 Integration Hook

```typescript
// hooks/useIntegrations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../utils/trpc';
import { SecureTokenStorage } from '../utils/secureStorage';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  connectedAt?: Date;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
}

export function useIntegrations() {
  const queryClient = useQueryClient();

  // Get available integrations
  const { data: availableIntegrations, isLoading: loadingAvailable } = 
    useQuery({
      queryKey: ['integrations', 'available'],
      queryFn: () => trpc.integrations.getAvailableIntegrations.query()
    });

  // Get user's connected integrations
  const { data: userConnections, isLoading: loadingConnections } = 
    useQuery({
      queryKey: ['integrations', 'user-connections'],
      queryFn: () => trpc.integrations.getUserConnections.query()
    });

  // Generate auth token for integration
  const generateAuthToken = useMutation({
    mutationFn: (metadata?: Record<string, any>) => 
      trpc.integrations.generateAuthToken.mutate({ metadata }),
    onSuccess: async (data) => {
      await SecureTokenStorage.storeAuthToken(data.token);
    }
  });

  // Execute integration action
  const executeAction = useMutation({
    mutationFn: ({ connector, action, data }: {
      connector: string;
      action: string;
      data: any;
    }) => trpc.integrations.executeAction.mutate({ connector, action, data }),
    onSuccess: () => {
      // Refresh connections after successful action
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });

  // Disconnect integration
  const disconnectIntegration = useMutation({
    mutationFn: (connectionId: string) => 
      trpc.integrations.disconnectIntegration.mutate({ connectionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });

  // Combine available integrations with user connection status
  const integrations: Integration[] = useMemo(() => {
    if (!availableIntegrations || !userConnections) return [];
    
    return availableIntegrations.map(integration => ({
      ...integration,
      connected: userConnections.some(conn => 
        conn.connector === integration.id && conn.status === 'active'
      ),
      connectedAt: userConnections.find(conn => 
        conn.connector === integration.id
      )?.connectedAt,
      status: userConnections.find(conn => 
        conn.connector === integration.id
      )?.status || 'disconnected'
    }));
  }, [availableIntegrations, userConnections]);

  return {
    integrations,
    isLoading: loadingAvailable || loadingConnections,
    generateAuthToken,
    executeAction,
    disconnectIntegration
  };
}
```

#### 2.4 WebView-Based AuthKit Integration

```typescript
// components/IntegrationAuthModal.tsx
import React, { useState, useRef } from 'react';
import { Modal, View, Text, Pressable, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { X } from 'lucide-react-native';

interface IntegrationAuthModalProps {
  visible: boolean;
  onClose: () => void;
  authToken: string;
  integration: Integration;
  onSuccess: (connection: any) => void;
  onError: (error: any) => void;
}

export function IntegrationAuthModal({
  visible,
  onClose,
  authToken,
  integration,
  onSuccess,
  onError
}: IntegrationAuthModalProps) {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  // AuthKit URL with token and integration config
  const authUrl = `https://app.picaos.com/authkit?token=${authToken}&connector=${integration.id}`;

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    // Check for success callback
    if (url.includes('success')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const connectionData = {
        connectionId: urlParams.get('connection_id'),
        connector: integration.id,
        status: 'connected'
      };
      onSuccess(connectionData);
      onClose();
    }
    
    // Check for error callback
    if (url.includes('error')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const error = urlParams.get('error') || 'Authentication failed';
      onError(new Error(error));
      onClose();
    }
  };

  const openInBrowser = () => {
    WebBrowser.openBrowserAsync(authUrl);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">
            Connect {integration.name}
          </Text>
          <Pressable onPress={onClose} className="p-2">
            <X size={24} color="#666" />
          </Pressable>
        </View>

        {/* Loading indicator */}
        {loading && (
          <View className="p-4">
            <Text className="text-center text-gray-600">
              Loading authentication...
            </Text>
          </View>
        )}

        {/* WebView for AuthKit */}
        <WebView
          ref={webViewRef}
          source={{ uri: authUrl }}
          onLoad={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onError={(error) => {
            console.error('WebView error:', error);
            onError(error);
            onClose();
          }}
          onHttpError={(error) => {
            console.error('HTTP error:', error);
            Alert.alert(
              'Connection Error',
              'Unable to load authentication page. Would you like to try in your browser?',
              [
                { text: 'Cancel', onPress: onClose },
                { text: 'Open Browser', onPress: openInBrowser }
              ]
            );
          }}
          style={{ flex: 1 }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
        />

        {/* Alternative browser option */}
        <View className="p-4 border-t border-gray-200">
          <Pressable
            onPress={openInBrowser}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              Open in Browser
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
```

#### 2.5 Settings > Integrations Screen

```typescript
// screens/IntegrationsScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  RefreshControl,
  Alert,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntegrations } from '../hooks/useIntegrations';
import { IntegrationAuthModal } from '../components/IntegrationAuthModal';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink 
} from 'lucide-react-native';

export function IntegrationsScreen() {
  const {
    integrations,
    isLoading,
    generateAuthToken,
    disconnectIntegration
  } = useIntegrations();
  
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  const handleConnectIntegration = async (integration: Integration) => {
    try {
      setSelectedIntegration(integration);
      
      // Generate auth token
      const result = await generateAuthToken.mutateAsync({
        integration_id: integration.id,
        user_agent: 'mobile-app'
      });
      
      setAuthToken(result.token);
      setAuthModalVisible(true);
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Failed to initialize authentication. Please try again.'
      );
    }
  };

  const handleDisconnectIntegration = (integration: Integration) => {
    Alert.alert(
      'Disconnect Integration',
      `Are you sure you want to disconnect ${integration.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            const connection = integration.connections?.[0];
            if (connection) {
              disconnectIntegration.mutate(connection.id);
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pending';
      default:
        return 'Not connected';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold">Integrations</Text>
        <Text className="text-gray-600 mt-1">
          Connect your favorite apps and services
        </Text>
      </View>

      {/* Integrations List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={() => {
              // Trigger refetch
            }} 
          />
        }
      >
        <View className="p-4 space-y-3">
          {integrations.map((integration) => (
            <View
              key={integration.id}
              className="bg-white rounded-xl p-4 border border-gray-200"
            >
              {/* Integration Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center space-x-3">
                  {/* Integration Icon */}
                  {integration.icon && (
                    <Image
                      source={{ uri: integration.icon }}
                      className="w-10 h-10 rounded-lg"
                      resizeMode="contain"
                    />
                  )}
                  
                  <View>
                    <Text className="text-lg font-semibold">
                      {integration.name}
                    </Text>
                    <View className="flex-row items-center space-x-2 mt-1">
                      {getStatusIcon(integration.status)}
                      <Text className={`text-sm ${
                        integration.status === 'connected' 
                          ? 'text-green-600'
                          : integration.status === 'error'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {getStatusText(integration.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Button */}
                <Pressable
                  onPress={() => {
                    if (integration.connected) {
                      handleDisconnectIntegration(integration);
                    } else {
                      handleConnectIntegration(integration);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    integration.connected
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-blue-500'
                  }`}
                  disabled={generateAuthToken.isPending}
                >
                  <Text className={`font-medium ${
                    integration.connected
                      ? 'text-red-600'
                      : 'text-white'
                  }`}>
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Text>
                </Pressable>
              </View>

              {/* Integration Description */}
              <Text className="text-gray-600 text-sm mb-2">
                {integration.description}
              </Text>

              {/* Connection Details */}
              {integration.connected && integration.connectedAt && (
                <Text className="text-xs text-gray-500">
                  Connected on {new Date(integration.connectedAt).toLocaleDateString()}
                </Text>
              )}

              {/* Available Actions Preview */}
              {integration.connected && integration.actions && (
                <View className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Available Actions:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {integration.actions.slice(0, 3).map((action) => (
                      <View
                        key={action.id}
                        className="bg-white px-2 py-1 rounded border"
                      >
                        <Text className="text-xs text-gray-600">
                          {action.name}
                        </Text>
                      </View>
                    ))}
                    {integration.actions.length > 3 && (
                      <Text className="text-xs text-gray-500 py-1">
                        +{integration.actions.length - 3} more
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Empty State */}
        {integrations.length === 0 && !isLoading && (
          <View className="flex-1 items-center justify-center p-8">
            <ExternalLink size={48} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              No integrations available
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Check back later for new integrations, or contact support if you need a specific integration.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Auth Modal */}
      {selectedIntegration && (
        <IntegrationAuthModal
          visible={authModalVisible}
          onClose={() => {
            setAuthModalVisible(false);
            setSelectedIntegration(null);
            setAuthToken('');
          }}
          authToken={authToken}
          integration={selectedIntegration}
          onSuccess={(connection) => {
            console.log('Connection successful:', connection);
            // Refresh integrations list
          }}
          onError={(error) => {
            console.error('Connection error:', error);
            Alert.alert('Connection Failed', error.message);
          }}
        />
      )}
    </SafeAreaView>
  );
}
```

### Phase 3: Advanced Features

#### 3.1 Integration Testing & Monitoring

```typescript
// hooks/useIntegrationTesting.ts
export function useIntegrationTesting() {
  const testIntegrationConnection = useMutation({
    mutationFn: async ({ connector }: { connector: string }) => {
      // Test basic connectivity
      const response = await trpc.integrations.executeAction.mutate({
        connector,
        action: 'test_connection',
        data: {}
      });
      
      return response;
    }
  });

  const getIntegrationHealth = useQuery({
    queryKey: ['integrations', 'health'],
    queryFn: () => trpc.integrations.getHealthStatus.query(),
    refetchInterval: 30000 // Check every 30 seconds
  });

  return {
    testIntegrationConnection,
    getIntegrationHealth
  };
}
```

#### 3.2 AI-Powered Integration Actions

```typescript
// components/AIIntegrationChat.tsx
import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';

export function AIIntegrationChat({ userId }: { userId: string }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat', // Your tRPC endpoint that uses Pica's AI
    initialMessages: [{
      role: 'system',
      content: 'I can help you manage your integrations and automate tasks across your connected apps.'
    }]
  });

  return (
    <View className="flex-1">
      {/* Chat Messages */}
      <ScrollView className="flex-1 p-4">
        {messages.map((message, index) => (
          <View
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <View
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
            >
              <Text
                className={
                  message.role === 'user'
                    ? 'text-white'
                    : 'text-gray-900'
                }
              >
                {message.content}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View className="p-4 border-t border-gray-200">
        <TextInput
          value={input}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSubmit}
          placeholder="Ask me to help with your integrations..."
          className="border border-gray-300 rounded-lg px-4 py-2"
          multiline
        />
      </View>
    </View>
  );
}
```

## Security Best Practices

### 1. Token Management

```typescript
// utils/tokenManager.ts
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export class TokenManager {
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  static async isTokenExpired(): Promise<boolean> {
    const expiry = await SecureStore.getItemAsync(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    return new Date().getTime() > parseInt(expiry);
  }

  static async refreshTokenIfNeeded(): Promise<boolean> {
    if (await this.isTokenExpired()) {
      try {
        // Call refresh token endpoint
        const newToken = await this.refreshToken();
        await this.storeToken(newToken);
        return true;
      } catch (error) {
        Alert.alert('Session Expired', 'Please reconnect your integrations.');
        return false;
      }
    }
    return true;
  }

  private static async refreshToken(): Promise<string> {
    // Implementation depends on your auth flow
    throw new Error('Refresh token implementation needed');
  }

  private static async storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token);
    // Set expiry for 1 hour from now
    const expiry = new Date().getTime() + (60 * 60 * 1000);
    await SecureStore.setItemAsync(this.TOKEN_EXPIRY_KEY, expiry.toString());
  }
}
```

### 2. Network Security

```typescript
// utils/secureApiClient.ts
import { Alert } from 'react-native';

export class SecureApiClient {
  private static readonly MAX_RETRIES = 3;
  private static readonly TIMEOUT = 30000; // 30 seconds

  static async secureRequest(
    url: string, 
    options: RequestInit,
    retryCount = 0
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return this.secureRequest(url, options, retryCount + 1);
      }
      
      Alert.alert(
        'Network Error', 
        'Unable to connect. Please check your internet connection.'
      );
      throw error;
    }
  }
}
```

## Performance Optimizations

### 1. Connection Caching

```typescript
// utils/integrationCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class IntegrationCache {
  private static readonly CACHE_KEY = 'integration_cache';
  private static readonly CACHE_TTL = 300000; // 5 minutes

  static async getCachedIntegrations(): Promise<Integration[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.CACHE_TTL;
      
      return isExpired ? null : data;
    } catch {
      return null;
    }
  }

  static async cacheIntegrations(integrations: Integration[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify({
        data: integrations,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache integrations:', error);
    }
  }
}
```

### 2. Background Sync

```typescript
// utils/backgroundSync.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_SYNC_TASK = 'background-integration-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    // Sync integration statuses
    const health = await trpc.integrations.getHealthStatus.query();
    await IntegrationCache.cacheIntegrations(health.integrations);
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 300000, // 5 minutes
    stopOnTerminate: false,
    startOnBoot: true
  });
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
// __tests__/hooks/useIntegrations.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useIntegrations } from '../../hooks/useIntegrations';

describe('useIntegrations', () => {
  it('should load available integrations', async () => {
    const { result } = renderHook(() => useIntegrations());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.integrations).toBeDefined();
  });

  it('should handle connection errors gracefully', async () => {
    // Mock network error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('Network error')
    );
    
    const { result } = renderHook(() => useIntegrations());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Should not crash and should show empty state
    expect(result.current.integrations).toEqual([]);
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/integration/pica.integration.test.ts
import { PicaService } from '../../backend/services/pica.service';

describe('Pica Integration', () => {
  let picaService: PicaService;

  beforeEach(() => {
    picaService = new PicaService();
  });

  it('should generate valid auth tokens', async () => {
    const token = await picaService.generateAuthToken('test-user');
    expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });

  it('should retrieve available integrations', async () => {
    const integrations = await picaService.getAvailableIntegrations();
    expect(Array.isArray(integrations)).toBe(true);
    expect(integrations.length).toBeGreaterThan(0);
  });

  it('should handle invalid tokens gracefully', async () => {
    await expect(
      picaService.executeAction('invalid-user', 'test', 'action', {})
    ).rejects.toThrow();
  });
});
```

## Deployment Considerations

### 1. Environment Configuration

```typescript
// config/pica.config.ts
interface PicaConfig {
  secretKey: string;
  serverUrl: string;
  authkit: {
    enabled: boolean;
    permissions: string[];
  };
  rateLimit: {
    requests: number;
    windowMs: number;
  };
}

export const picaConfig: PicaConfig = {
  secretKey: process.env.PICA_SECRET_KEY!,
  serverUrl: process.env.PICA_SERVER_URL || 'https://api.picaos.com',
  authkit: {
    enabled: process.env.NODE_ENV !== 'development',
    permissions: ['read', 'write']
  },
  rateLimit: {
    requests: 100,
    windowMs: 60000 // 1 minute
  }
};
```

### 2. Error Monitoring

```typescript
// utils/errorReporting.ts
import * as Sentry from '@sentry/react-native';

export class ErrorReporter {
  static reportIntegrationError(
    integration: string,
    action: string,
    error: Error,
    context?: Record<string, any>
  ) {
    Sentry.withScope((scope) => {
      scope.setTag('integration', integration);
      scope.setTag('action', action);
      scope.setContext('integration_context', context);
      Sentry.captureException(error);
    });
  }

  static reportAuthError(
    integration: string,
    error: Error,
    userId?: string
  ) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'auth');
      scope.setTag('integration', integration);
      if (userId) scope.setUser({ id: userId });
      Sentry.captureException(error);
    });
  }
}
```

## Migration & Scaling Plan

### Phase 1 (Weeks 1-2): Foundation
- ✅ Backend Pica integration
- ✅ Basic tRPC procedures
- ✅ Secure token storage
- ✅ WebView-based auth flow

### Phase 2 (Weeks 3-4): User Experience
- ✅ Settings > Integrations screen
- ✅ Integration status monitoring
- ✅ Connection management
- ✅ Error handling & recovery

### Phase 3 (Weeks 5-6): Advanced Features
- ✅ AI-powered integration actions
- ✅ Background synchronization
- ✅ Performance optimizations
- ✅ Testing & monitoring

### Phase 4 (Weeks 7-8): Production Ready
- ✅ Security audit
- ✅ Error reporting
- ✅ Performance monitoring
- ✅ Documentation & deployment

## Cost Considerations

1. **Pica Platform Costs**: Review pricing for OneTool SDK usage, AuthKit requests, and API calls
2. **Storage Costs**: Secure token storage and caching
3. **Network Costs**: API requests and webhook handling
4. **Monitoring Costs**: Error tracking and performance monitoring

## Alternatives to Consider

If Pica proves unsuitable for React Native:

1. **Zapier Platform**: Native mobile SDKs available
2. **IFTTT Platform**: Mobile-friendly webhook system
3. **Microsoft Power Automate**: Strong mobile support
4. **Custom OAuth Implementation**: Direct integration with individual services
5. **Firebase Functions**: Serverless integration proxy

## Conclusion

This architecture provides a robust foundation for integrating Pica's powerful integration platform with your React Native/Expo app. The hybrid approach leverages Pica's strengths while working around mobile platform limitations.

Key success factors:
- ✅ Secure token management with Expo SecureStore
- ✅ WebView-based auth flow for compatibility
- ✅ Backend proxy for API calls and token refresh
- ✅ Comprehensive error handling and monitoring
- ✅ Performance optimizations for mobile experience
- ✅ Scalable architecture for future growth

The implementation provides users with a seamless integration experience while maintaining security and performance standards expected in production mobile applications.