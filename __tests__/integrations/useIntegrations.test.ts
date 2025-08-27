import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIntegrations } from '../../hooks/useIntegrations';
import { trpc } from '../../lib/trpc';

// Mock tRPC
jest.mock('../../lib/trpc', () => ({
  trpc: {
    integrations: {
      getAvailableIntegrations: {
        query: jest.fn()
      },
      getUserConnections: {
        query: jest.fn()
      },
      generateAuthToken: {
        mutate: jest.fn()
      },
      executeAction: {
        mutate: jest.fn()
      },
      disconnectIntegration: {
        mutate: jest.fn()
      },
      testConnection: {
        mutate: jest.fn()
      },
      getHealthStatus: {
        query: jest.fn()
      }
    }
  }
}));

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined)
}));

const mockAvailableIntegrations = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account',
    icon: 'https://example.com/gmail-icon.png',
    category: 'Communication',
    popular: true,
    features: ['Send emails', 'Read emails', 'Manage labels']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect your Slack workspace',
    icon: 'https://example.com/slack-icon.png',
    category: 'Communication',
    popular: true,
    features: ['Send messages', 'Create channels', 'Manage users']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect your Notion workspace',
    icon: 'https://example.com/notion-icon.png',
    category: 'Productivity',
    popular: false,
    features: ['Create pages', 'Update databases', 'Search content']
  }
];

const mockUserConnections = [
  {
    id: 'conn-1',
    connector: 'gmail',
    status: 'active',
    connectedAt: '2024-01-01T00:00:00.000Z',
    lastSyncAt: '2024-01-15T10:30:00.000Z',
    metadata: { email: 'user@example.com' }
  }
];

const mockHealthStatus = {
  integrations: [
    {
      connector: 'gmail',
      connectionId: 'conn-1',
      status: 'connected',
      lastCheck: '2024-01-15T12:00:00.000Z',
      error: null
    }
  ],
  overallStatus: 'healthy',
  lastUpdated: '2024-01-15T12:00:00.000Z'
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useIntegrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (trpc.integrations.getAvailableIntegrations.query as jest.Mock)
      .mockResolvedValue(mockAvailableIntegrations);
    
    (trpc.integrations.getUserConnections.query as jest.Mock)
      .mockResolvedValue(mockUserConnections);
      
    (trpc.integrations.getHealthStatus.query as jest.Mock)
      .mockResolvedValue(mockHealthStatus);
  });

  it('should load available integrations successfully', async () => {
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.integrations).toBeDefined();
    expect(result.current.integrations).toHaveLength(3);
    
    const gmail = result.current.integrations.find(i => i.id === 'gmail');
    expect(gmail).toBeDefined();
    expect(gmail?.name).toBe('Gmail');
    expect(gmail?.connected).toBe(true);
    expect(gmail?.status).toBe('connected');
  });

  it('should correctly identify connected and disconnected integrations', async () => {
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.connectedIntegrations).toHaveLength(1);
    expect(result.current.disconnectedIntegrations).toHaveLength(2);
    expect(result.current.stats.connected).toBe(1);
    expect(result.current.stats.disconnected).toBe(2);
  });

  it('should categorize integrations correctly', async () => {
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const categories = result.current.integrationsByCategory;
    expect(categories.Communication).toHaveLength(2);
    expect(categories.Productivity).toHaveLength(1);
  });

  it('should identify popular integrations', async () => {
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.popularIntegrations).toHaveLength(2);
    expect(result.current.popularIntegrations.map(i => i.id)).toEqual(['gmail', 'slack']);
  });

  it('should handle network errors gracefully', async () => {
    (trpc.integrations.getAvailableIntegrations.query as jest.Mock)
      .mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.integrations).toEqual([]);
  });

  it('should handle empty integrations list', async () => {
    (trpc.integrations.getAvailableIntegrations.query as jest.Mock)
      .mockResolvedValue([]);
    (trpc.integrations.getUserConnections.query as jest.Mock)
      .mockResolvedValue([]);

    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.integrations).toEqual([]);
    expect(result.current.stats.total).toBe(0);
  });

  it('should generate auth token successfully', async () => {
    const mockToken = 'mock-auth-token-12345';
    (trpc.integrations.generateAuthToken.mutate as jest.Mock)
      .mockResolvedValue({ token: mockToken });

    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const tokenResult = await result.current.generateAuthToken.mutateAsync({
      integration_id: 'gmail',
      user_agent: 'test-app'
    });

    expect(tokenResult.token).toBe(mockToken);
    expect(trpc.integrations.generateAuthToken.mutate).toHaveBeenCalledWith({
      integration_id: 'gmail',
      user_agent: 'test-app'
    });
  });

  it('should execute integration actions', async () => {
    const mockActionResult = { 
      success: true, 
      data: { message: 'Email sent successfully' } 
    };
    
    (trpc.integrations.executeAction.mutate as jest.Mock)
      .mockResolvedValue(mockActionResult);

    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const actionResult = await result.current.executeAction.mutateAsync({
      connector: 'gmail',
      action: 'send_email',
      data: { to: 'test@example.com', subject: 'Test', body: 'Hello' }
    });

    expect(actionResult).toEqual(mockActionResult);
    expect(trpc.integrations.executeAction.mutate).toHaveBeenCalledWith({
      connector: 'gmail',
      action: 'send_email',
      data: { to: 'test@example.com', subject: 'Test', body: 'Hello' }
    });
  });

  it('should disconnect integrations', async () => {
    const mockDisconnectResult = { success: true };
    (trpc.integrations.disconnectIntegration.mutate as jest.Mock)
      .mockResolvedValue(mockDisconnectResult);

    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const disconnectResult = await result.current.disconnectIntegration.mutateAsync('conn-1');

    expect(disconnectResult).toEqual(mockDisconnectResult);
    expect(trpc.integrations.disconnectIntegration.mutate).toHaveBeenCalledWith({
      connectionId: 'conn-1'
    });
  });

  it('should test connections', async () => {
    const mockTestResult = { 
      connector: 'gmail',
      status: 'healthy',
      latency: 150,
      testedAt: '2024-01-15T12:00:00.000Z'
    };
    
    (trpc.integrations.testConnection.mutate as jest.Mock)
      .mockResolvedValue(mockTestResult);

    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const testResult = await result.current.testConnection.mutateAsync('gmail');

    expect(testResult).toEqual(mockTestResult);
    expect(trpc.integrations.testConnection.mutate).toHaveBeenCalledWith({
      connector: 'gmail'
    });
  });

  it('should handle integration with error status', async () => {
    const errorHealthStatus = {
      integrations: [
        {
          connector: 'gmail',
          connectionId: 'conn-1',
          status: 'error',
          lastCheck: '2024-01-15T12:00:00.000Z',
          error: 'Authentication failed'
        }
      ],
      overallStatus: 'degraded',
      lastUpdated: '2024-01-15T12:00:00.000Z'
    };

    (trpc.integrations.getHealthStatus.query as jest.Mock)
      .mockResolvedValue(errorHealthStatus);

    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const gmail = result.current.integrations.find(i => i.id === 'gmail');
    expect(gmail?.status).toBe('error');
    expect(gmail?.errorMessage).toBe('Authentication failed');
    expect(result.current.stats.errors).toBe(1);
  });

  it('should provide helper functions', async () => {
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test getIntegrationById
    const gmail = result.current.getIntegrationById('gmail');
    expect(gmail?.name).toBe('Gmail');

    // Test getIntegrationsByStatus
    const connectedIntegrations = result.current.getIntegrationsByStatus('connected');
    expect(connectedIntegrations).toHaveLength(1);
    expect(connectedIntegrations[0].id).toBe('gmail');

    const disconnectedIntegrations = result.current.getIntegrationsByStatus('disconnected');
    expect(disconnectedIntegrations).toHaveLength(2);
  });

  it('should refresh integrations', async () => {
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // This should trigger a refetch (tested indirectly by ensuring no errors)
    result.current.refreshIntegrations();
    
    expect(typeof result.current.refreshIntegrations).toBe('function');
  });
});