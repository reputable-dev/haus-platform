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
import { router } from 'expo-router';
import { useIntegrations } from '../../hooks/useIntegrations';
import { IntegrationAuthModal } from '../../components/integrations/IntegrationAuthModal';
import { IntegrationStatusBadge } from '../../components/integrations/IntegrationStatusBadge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ArrowLeft,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react-native';

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
  isConnecting: boolean;
}

function IntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect, 
  isConnecting 
}: IntegrationCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={16} color="#10B981" />;
      case 'error':
        return <AlertCircle size={16} color="#EF4444" />;
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      default:
        return null;
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {/* Integration Icon */}
          <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center mr-3">
            {integration.icon ? (
              <Image
                source={{ uri: integration.icon }}
                className="w-8 h-8"
                resizeMode="contain"
              />
            ) : (
              <ExternalLink size={20} color="#6B7280" />
            )}
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              {integration.name}
            </Text>
            <View className="flex-row items-center">
              {getStatusIcon(integration.status)}
              <Text className={`text-sm ml-1 ${
                integration.status === 'connected' 
                  ? 'text-green-600'
                  : integration.status === 'error'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {integration.status === 'connected' ? 'Connected' : 
                 integration.status === 'error' ? 'Error' :
                 integration.status === 'pending' ? 'Pending' : 'Not connected'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Pressable
          onPress={() => {
            if (integration.connected) {
              onDisconnect(integration);
            } else {
              onConnect(integration);
            }
          }}
          className={`px-4 py-2 rounded-lg min-w-[80px] items-center ${
            integration.connected
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-500'
          }`}
          disabled={isConnecting}
        >
          <Text className={`font-medium text-sm ${
            integration.connected
              ? 'text-red-600'
              : 'text-white'
          }`}>
            {isConnecting ? 'Loading...' : integration.connected ? 'Disconnect' : 'Connect'}
          </Text>
        </Pressable>
      </View>

      {/* Description */}
      <Text className="text-gray-600 text-sm mb-3">
        {integration.description}
      </Text>

      {/* Connection Details */}
      {integration.connected && integration.connectedAt && (
        <View className="mb-3">
          <Text className="text-xs text-gray-500">
            Connected on {new Date(integration.connectedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Features */}
      {integration.features && integration.features.length > 0 && (
        <View className="border-t border-gray-100 pt-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Features:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {integration.features.slice(0, 3).map((feature, index) => (
              <View
                key={index}
                className="bg-blue-50 px-2 py-1 rounded-full border border-blue-200"
              >
                <Text className="text-xs text-blue-700">
                  {feature}
                </Text>
              </View>
            ))}
            {integration.features.length > 3 && (
              <Text className="text-xs text-gray-500 py-1">
                +{integration.features.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

export default function IntegrationsScreen() {
  const {
    integrations,
    isLoading,
    generateAuthToken,
    disconnectIntegration
  } = useIntegrations();
  
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnectIntegration = async (integration: Integration) => {
    try {
      setConnectingId(integration.id);
      
      // Generate auth token
      const result = await generateAuthToken.mutateAsync({
        integration_id: integration.id,
        user_agent: 'haus-platform-mobile'
      });
      
      setSelectedIntegration(integration);
      setAuthToken(result.token);
      setAuthModalVisible(true);
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Failed to initialize authentication. Please try again.'
      );
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnectIntegration = (integration: Integration) => {
    Alert.alert(
      'Disconnect Integration',
      `Are you sure you want to disconnect ${integration.name}? This will revoke access to your ${integration.name} account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            if (integration.connectionId) {
              disconnectIntegration.mutate(integration.connectionId);
            }
          }
        }
      ]
    );
  };

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center mb-2">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-1"
          >
            <ArrowLeft size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900">Integrations</Text>
        </View>
        <Text className="text-gray-600">
          Connect your favorite apps and automate your workflow
        </Text>
        {connectedCount > 0 && (
          <View className="flex-row items-center mt-2">
            <Zap size={16} color="#10B981" />
            <Text className="text-sm text-green-600 ml-1 font-medium">
              {connectedCount} integration{connectedCount !== 1 ? 's' : ''} active
            </Text>
          </View>
        )}
      </View>

      {/* Info Banner */}
      <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl border border-blue-200">
        <View className="flex-row items-start">
          <Shield size={20} color="#3B82F6" />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-medium text-blue-900 mb-1">
              Secure Authentication
            </Text>
            <Text className="text-xs text-blue-700">
              All connections use OAuth 2.0 authentication and are encrypted. 
              We never store your passwords.
            </Text>
          </View>
        </View>
      </View>

      {/* Integrations List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={() => {
              // Trigger refetch - handled by React Query
            }} 
          />
        }
      >
        <View className="pt-4 pb-8">
          {integrations.length > 0 ? (
            <>
              {/* Popular Integrations */}
              {integrations.some(i => i.popular) && (
                <>
                  <View className="mb-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      Popular Integrations
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Connect with the most commonly used services
                    </Text>
                  </View>
                  {integrations.filter(i => i.popular).map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onConnect={handleConnectIntegration}
                      onDisconnect={handleDisconnectIntegration}
                      isConnecting={connectingId === integration.id}
                    />
                  ))}
                </>
              )}

              {/* All Integrations */}
              <View className="mb-4 mt-6">
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  All Integrations
                </Text>
                <Text className="text-sm text-gray-600">
                  Complete list of available integrations
                </Text>
              </View>
              {integrations.filter(i => !i.popular).map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnectIntegration}
                  onDisconnect={handleDisconnectIntegration}
                  isConnecting={connectingId === integration.id}
                />
              ))}
            </>
          ) : (
            /* Empty State */
            <View className="flex-1 items-center justify-center p-8 mt-20">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <ExternalLink size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
                No integrations available
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                Check back later for new integrations, or contact support if you need a specific integration.
              </Text>
              <Pressable className="bg-blue-500 px-6 py-3 rounded-lg">
                <Text className="text-white font-medium">Contact Support</Text>
              </Pressable>
            </View>
          )}
        </View>
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
            Alert.alert(
              'Success!',
              `${selectedIntegration.name} has been connected successfully.`
            );
            // React Query will automatically refetch
          }}
          onError={(error) => {
            console.error('Connection error:', error);
            Alert.alert(
              'Connection Failed', 
              `Failed to connect ${selectedIntegration.name}. Please try again.`
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}