import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { trpc } from '../lib/trpc';
import { SecureTokenStorage } from '../utils/secureStorage';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon?: string;
  connected: boolean;
  connectedAt?: Date;
  connectionId?: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending' | 'syncing';
  features?: string[];
  popular?: boolean;
  category?: string;
  actions?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  lastSyncAt?: Date;
  errorMessage?: string;
}

export interface Connection {
  id: string;
  connector: string;
  status: 'active' | 'inactive' | 'error';
  connectedAt: string;
  lastSyncAt?: string;
  metadata?: Record<string, any>;
}

export function useIntegrations() {
  const queryClient = useQueryClient();

  // Get available integrations from Pica
  const { 
    data: availableIntegrations, 
    isLoading: loadingAvailable,
    error: availableError 
  } = useQuery({
    queryKey: ['integrations', 'available'],
    queryFn: () => trpc.integrations.getAvailableIntegrations.query(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Get user's connected integrations
  const { 
    data: userConnections, 
    isLoading: loadingConnections,
    error: connectionsError
  } = useQuery({
    queryKey: ['integrations', 'user-connections'],
    queryFn: () => trpc.integrations.getUserConnections.query(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2
  });

  // Generate auth token for integration
  const generateAuthToken = useMutation({
    mutationFn: (params: { 
      integration_id: string; 
      user_agent?: string;
      metadata?: Record<string, any> 
    }) => trpc.integrations.generateAuthToken.mutate(params),
    onSuccess: async (data) => {
      await SecureTokenStorage.storeAuthToken(data.token);
    },
    onError: (error) => {
      console.error('Failed to generate auth token:', error);
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
    },
    onError: (error) => {
      console.error('Failed to execute integration action:', error);
    }
  });

  // Disconnect integration
  const disconnectIntegration = useMutation({
    mutationFn: (connectionId: string) => 
      trpc.integrations.disconnectIntegration.mutate({ connectionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (error) => {
      console.error('Failed to disconnect integration:', error);
    }
  });

  // Test integration connection
  const testConnection = useMutation({
    mutationFn: (connector: string) => 
      trpc.integrations.testConnection.mutate({ connector }),
    onError: (error) => {
      console.error('Connection test failed:', error);
    }
  });

  // Get integration health status
  const { 
    data: healthStatus,
    isLoading: loadingHealth 
  } = useQuery({
    queryKey: ['integrations', 'health'],
    queryFn: () => trpc.integrations.getHealthStatus.query(),
    refetchInterval: 60000, // Refresh every minute
    enabled: !!userConnections?.length, // Only run if user has connections
    retry: 1
  });

  // Combine available integrations with user connection status
  const integrations: Integration[] = useMemo(() => {
    if (!availableIntegrations) return [];
    
    return availableIntegrations.map(integration => {
      const connection = userConnections?.find(conn => 
        conn.connector === integration.id
      );
      
      const health = healthStatus?.integrations?.find(h => 
        h.connector === integration.id
      );

      return {
        ...integration,
        connected: connection?.status === 'active',
        connectedAt: connection?.connectedAt ? new Date(connection.connectedAt) : undefined,
        connectionId: connection?.id,
        status: connection?.status === 'active' ? 
          (health?.status || 'connected') : 'disconnected',
        lastSyncAt: health?.lastSyncAt ? new Date(health.lastSyncAt) : undefined,
        errorMessage: health?.error,
      };
    });
  }, [availableIntegrations, userConnections, healthStatus]);

  // Derived data
  const connectedIntegrations = useMemo(() => 
    integrations.filter(i => i.connected), 
    [integrations]
  );

  const disconnectedIntegrations = useMemo(() => 
    integrations.filter(i => !i.connected), 
    [integrations]
  );

  const popularIntegrations = useMemo(() => 
    integrations.filter(i => i.popular), 
    [integrations]
  );

  const integrationsByCategory = useMemo(() => {
    const categories: Record<string, Integration[]> = {};
    integrations.forEach(integration => {
      const category = integration.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(integration);
    });
    return categories;
  }, [integrations]);

  // Statistics
  const stats = useMemo(() => ({
    total: integrations.length,
    connected: connectedIntegrations.length,
    disconnected: disconnectedIntegrations.length,
    errors: integrations.filter(i => i.status === 'error').length,
    syncing: integrations.filter(i => i.status === 'syncing').length
  }), [integrations, connectedIntegrations, disconnectedIntegrations]);

  // Helper functions
  const getIntegrationById = (id: string): Integration | undefined => {
    return integrations.find(i => i.id === id);
  };

  const getIntegrationsByStatus = (status: Integration['status']): Integration[] => {
    return integrations.filter(i => i.status === status);
  };

  const refreshIntegrations = () => {
    queryClient.invalidateQueries({ queryKey: ['integrations'] });
  };

  return {
    // Data
    integrations,
    connectedIntegrations,
    disconnectedIntegrations,
    popularIntegrations,
    integrationsByCategory,
    stats,
    
    // Loading states
    isLoading: loadingAvailable || loadingConnections,
    isLoadingHealth: loadingHealth,
    
    // Errors
    error: availableError || connectionsError,
    
    // Mutations
    generateAuthToken,
    executeAction,
    disconnectIntegration,
    testConnection,
    
    // Helper functions
    getIntegrationById,
    getIntegrationsByStatus,
    refreshIntegrations,
    
    // Health data
    healthStatus
  };
}

// Hook for specific integration management
export function useIntegration(integrationId: string) {
  const { 
    getIntegrationById, 
    executeAction, 
    testConnection, 
    disconnectIntegration,
    generateAuthToken
  } = useIntegrations();

  const integration = getIntegrationById(integrationId);

  const executeIntegrationAction = useMutation({
    mutationFn: ({ action, data }: { action: string; data: any }) => 
      executeAction.mutateAsync({ connector: integrationId, action, data }),
  });

  const testIntegrationConnection = () => {
    return testConnection.mutateAsync(integrationId);
  };

  const disconnectIntegrationById = () => {
    if (integration?.connectionId) {
      return disconnectIntegration.mutateAsync(integration.connectionId);
    }
    throw new Error('No connection ID found');
  };

  const connectIntegration = () => {
    return generateAuthToken.mutateAsync({ 
      integration_id: integrationId,
      user_agent: 'haus-platform-mobile' 
    });
  };

  return {
    integration,
    executeAction: executeIntegrationAction,
    testConnection: testIntegrationConnection,
    disconnect: disconnectIntegrationById,
    connect: connectIntegration,
    isLoading: executeIntegrationAction.isLoading || 
               testConnection.isLoading || 
               disconnectIntegration.isLoading ||
               generateAuthToken.isLoading
  };
}

// Hook for integration health monitoring
export function useIntegrationHealth() {
  const queryClient = useQueryClient();

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['integrations', 'health', 'detailed'],
    queryFn: () => trpc.integrations.getDetailedHealthStatus.query(),
    refetchInterval: 30000, // 30 seconds
    retry: 2
  });

  const refreshHealth = () => {
    queryClient.invalidateQueries({ queryKey: ['integrations', 'health'] });
  };

  return {
    healthData,
    isLoading,
    refreshHealth,
    hasErrors: healthData?.some(h => h.status === 'error') ?? false,
    errorCount: healthData?.filter(h => h.status === 'error').length ?? 0
  };
}