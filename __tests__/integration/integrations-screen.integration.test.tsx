/**
 * INTEGRATION TESTS - Complete UI Behavior Validation
 * Tests full user flows with real component interactions
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import IntegrationsScreen from '../../app/settings/integrations';
import { trpc } from '../../lib/trpc';
import { SecureTokenStorage } from '../../utils/secureStorage';

// Mock dependencies
jest.mock('../../lib/trpc', () => ({
  trpc: {
    integrations: {
      getAvailableIntegrations: {
        useQuery: jest.fn()
      },
      getUserConnections: {
        useQuery: jest.fn()
      },
      generateAuthToken: {
        useMutation: jest.fn()
      },
      executeAction: {
        useMutation: jest.fn()
      },
      disconnectIntegration: {
        useMutation: jest.fn()
      },
      testConnection: {
        useMutation: jest.fn()
      },
      getHealthStatus: {
        useQuery: jest.fn()
      }
    }
  }
}));

jest.mock('../../utils/secureStorage');
jest.mock('expo-secure-store');

// Mock Alert to capture user feedback
jest.spyOn(Alert, 'alert');

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn()
};

const mockAvailableIntegrations = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account for email management',
    icon: 'https://example.com/gmail-icon.png',
    category: 'Communication',
    popular: true,
    features: ['Send emails', 'Read emails', 'Manage labels'],
    actions: [
      { id: 'send_email', name: 'Send Email', description: 'Send an email message' },
      { id: 'read_inbox', name: 'Read Inbox', description: 'Get inbox messages' }
    ],
    requirements: ['Gmail account', 'Email scope permissions']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect your Slack workspace for team communication',
    icon: 'https://example.com/slack-icon.png',
    category: 'Communication',
    popular: true,
    features: ['Send messages', 'Create channels', 'Manage users'],
    actions: [
      { id: 'send_message', name: 'Send Message', description: 'Send a message to a channel' }
    ],
    requirements: ['Slack workspace access']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect your Notion workspace for productivity',
    icon: 'https://example.com/notion-icon.png',
    category: 'Productivity',
    popular: false,
    features: ['Create pages', 'Update databases', 'Search content'],
    actions: [],
    requirements: ['Notion workspace access']
  }
];

const mockUserConnections = [
  {
    id: 'conn-gmail-1',
    connector: 'gmail',
    status: 'active',
    connectedAt: '2024-01-01T00:00:00.000Z',
    lastSyncAt: '2024-01-15T10:30:00.000Z',
    metadata: { email: 'user@example.com' }
  }
];

const mockHealthyStatus = {
  integrations: [
    {
      connector: 'gmail',
      connectionId: 'conn-gmail-1',
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
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('🔗 Integrations Screen Integration Tests', () => {
  let mockGenerateAuthToken: jest.Mock;
  let mockExecuteAction: jest.Mock;
  let mockDisconnectIntegration: jest.Mock;
  let mockTestConnection: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock mutations
    mockGenerateAuthToken = jest.fn();
    mockExecuteAction = jest.fn();
    mockDisconnectIntegration = jest.fn();
    mockTestConnection = jest.fn();

    // Setup default successful responses
    (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
      data: mockAvailableIntegrations,
      isLoading: false,
      error: null
    });

    (trpc.integrations.getUserConnections.useQuery as jest.Mock).mockReturnValue({
      data: mockUserConnections,
      isLoading: false,
      error: null
    });

    (trpc.integrations.getHealthStatus.useQuery as jest.Mock).mockReturnValue({
      data: mockHealthyStatus,
      isLoading: false,
      error: null
    });

    (trpc.integrations.generateAuthToken.useMutation as jest.Mock).mockReturnValue({
      mutate: mockGenerateAuthToken,
      mutateAsync: mockGenerateAuthToken,
      isLoading: false
    });

    (trpc.integrations.executeAction.useMutation as jest.Mock).mockReturnValue({
      mutate: mockExecuteAction,
      mutateAsync: mockExecuteAction,
      isLoading: false
    });

    (trpc.integrations.disconnectIntegration.useMutation as jest.Mock).mockReturnValue({
      mutate: mockDisconnectIntegration,
      mutateAsync: mockDisconnectIntegration,
      isLoading: false
    });

    (trpc.integrations.testConnection.useMutation as jest.Mock).mockReturnValue({
      mutate: mockTestConnection,
      mutateAsync: mockTestConnection,
      isLoading: false
    });
  });

  describe('📱 Complete User Flow: Browse → Connect → Manage', () => {
    test('user can browse, connect, and manage integrations end-to-end', async () => {
      const { getByText, getByTestId, queryByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      // 1. Screen loads with available integrations
      await waitFor(() => {
        expect(getByText('Gmail')).toBeTruthy();
        expect(getByText('Slack')).toBeTruthy();
        expect(getByText('Notion')).toBeTruthy();
      });

      // 2. Connected integration shows proper status
      expect(getByText('Connected')).toBeTruthy();
      expect(getByText('user@example.com')).toBeTruthy();

      // 3. Disconnected integrations show connect button
      const slackConnectButtons = screen.getAllByText('Connect');
      expect(slackConnectButtons.length).toBeGreaterThan(0);

      // 4. User can view integration details
      expect(getByText('Send emails, Read emails, Manage labels')).toBeTruthy();
      expect(getByText('Communication')).toBeTruthy();

      // 5. Test connection functionality works
      const testConnectionBtn = getByText('Test Connection');
      mockTestConnection.mockResolvedValue({
        connector: 'gmail',
        status: 'healthy',
        latency: 150,
        testedAt: new Date().toISOString()
      });

      fireEvent.press(testConnectionBtn);

      await waitFor(() => {
        expect(mockTestConnection).toHaveBeenCalledWith({
          connector: 'gmail'
        });
      });

      // 6. User can disconnect integration
      const disconnectBtn = getByText('Disconnect');
      mockDisconnectIntegration.mockResolvedValue({ success: true });

      fireEvent.press(disconnectBtn);

      await waitFor(() => {
        expect(mockDisconnectIntegration).toHaveBeenCalledWith({
          connectionId: 'conn-gmail-1'
        });
      });
    });

    test('user can connect new integration successfully', async () => {
      // Mock Slack as disconnected
      (trpc.integrations.getUserConnections.useQuery as jest.Mock).mockReturnValue({
        data: [], // No connections
        isLoading: false,
        error: null
      });

      const { getByText, queryByTestId } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Slack')).toBeTruthy();
      });

      // All integrations should show "Connect" button
      const connectButtons = screen.getAllByText('Connect');
      expect(connectButtons.length).toBeGreaterThanOrEqual(3); // Gmail, Slack, Notion

      // Click connect on Slack
      const slackConnectBtn = connectButtons[1]; // Assuming Slack is second
      mockGenerateAuthToken.mockResolvedValue({
        token: 'mock-auth-token-slack-123',
        expires_in: 3600
      });

      fireEvent.press(slackConnectBtn);

      await waitFor(() => {
        expect(mockGenerateAuthToken).toHaveBeenCalledWith({
          integration_id: 'slack',
          user_agent: expect.stringContaining('Haus Platform')
        });
      });

      // Auth modal should appear (tested separately)
      // We test that the auth token generation was triggered
    });
  });

  describe('🌐 Network Error Handling', () => {
    test('handles network failures gracefully with retry options', async () => {
      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network request failed')
      });

      const { getByText, getByTestId } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Failed to load integrations')).toBeTruthy();
      });

      // Should show retry button
      const retryBtn = getByText('Retry');
      expect(retryBtn).toBeTruthy();

      // Should not crash the app
      expect(queryByText('Gmail')).toBeNull();
    });

    test('handles auth token generation failures', async () => {
      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Slack')).toBeTruthy();
      });

      const connectButtons = screen.getAllByText('Connect');
      const slackConnect = connectButtons[1];

      mockGenerateAuthToken.mockRejectedValue(new Error('Authentication failed'));

      fireEvent.press(slackConnect);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Connection Failed',
          expect.stringContaining('authentication'),
          expect.any(Array)
        );
      });
    });

    test('handles connection test failures gracefully', async () => {
      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Test Connection')).toBeTruthy();
      });

      mockTestConnection.mockRejectedValue(new Error('Connection timeout'));

      fireEvent.press(getByText('Test Connection'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Connection Test Failed',
          expect.stringContaining('timeout'),
          expect.any(Array)
        );
      });
    });
  });

  describe('🔄 Real-Time Status Updates', () => {
    test('reflects integration health status changes', async () => {
      // Start with healthy status
      const { getByText, rerender } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Connected')).toBeTruthy();
      });

      // Simulate health status change to error
      (trpc.integrations.getHealthStatus.useQuery as jest.Mock).mockReturnValue({
        data: {
          integrations: [{
            connector: 'gmail',
            connectionId: 'conn-gmail-1',
            status: 'error',
            lastCheck: new Date().toISOString(),
            error: 'Authentication expired'
          }],
          overallStatus: 'degraded',
          lastUpdated: new Date().toISOString()
        },
        isLoading: false,
        error: null
      });

      // Re-render to trigger status update
      rerender(React.createElement(IntegrationsScreen, { navigation: mockNavigation }));

      await waitFor(() => {
        expect(getByText('Connection Error')).toBeTruthy();
        expect(getByText('Authentication expired')).toBeTruthy();
      });
    });

    test('shows loading states during operations', async () => {
      mockTestConnection.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          connector: 'gmail',
          status: 'healthy',
          latency: 200
        }), 100))
      );

      const { getByText, getByTestId } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Test Connection')).toBeTruthy();
      });

      fireEvent.press(getByText('Test Connection'));

      // Should show loading state
      expect(getByTestId('test-connection-loading')).toBeTruthy();

      await waitFor(() => {
        expect(queryByTestId('test-connection-loading')).toBeNull();
      }, { timeout: 200 });
    });
  });

  describe('📊 Integration Categories and Filtering', () => {
    test('displays integrations organized by categories', async () => {
      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Should show category headers
        expect(getByText('Communication')).toBeTruthy();
        expect(getByText('Productivity')).toBeTruthy();
      });

      // Should group integrations under correct categories
      expect(getByText('Gmail')).toBeTruthy();
      expect(getByText('Slack')).toBeTruthy();
      expect(getByText('Notion')).toBeTruthy();
    });

    test('handles popular integrations section', async () => {
      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Popular integrations should be highlighted
        expect(getByText('Popular')).toBeTruthy();
        // Gmail and Slack are marked as popular
      });
    });
  });

  describe('🔍 Search and Discovery', () => {
    test('search functionality works for finding integrations', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Gmail')).toBeTruthy();
        expect(getByText('Slack')).toBeTruthy();
        expect(getByText('Notion')).toBeTruthy();
      });

      const searchInput = getByPlaceholderText('Search integrations...');
      
      fireEvent.changeText(searchInput, 'gmail');

      await waitFor(() => {
        expect(getByText('Gmail')).toBeTruthy();
        expect(queryByText('Slack')).toBeNull();
        expect(queryByText('Notion')).toBeNull();
      });
    });
  });

  describe('⚡ Performance Validation', () => {
    test('screen renders within performance bounds', async () => {
      const startTime = Date.now();

      render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Gmail')).toBeTruthy();
      });

      const renderTime = Date.now() - startTime;
      
      // Should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });

    test('handles large number of integrations efficiently', async () => {
      // Create 100 mock integrations
      const manyIntegrations = Array.from({ length: 100 }, (_, i) => ({
        id: `service-${i}`,
        name: `Service ${i}`,
        description: `Connect your Service ${i} account`,
        icon: `https://example.com/service-${i}.png`,
        category: i % 2 === 0 ? 'Communication' : 'Productivity',
        popular: i < 10,
        features: [`Feature ${i}-1`, `Feature ${i}-2`],
        actions: [],
        requirements: []
      }));

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: manyIntegrations,
        isLoading: false,
        error: null
      });

      const startTime = Date.now();

      render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Service 0')).toBeTruthy();
      });

      const renderTime = Date.now() - startTime;
      
      // Should still render within acceptable time with 100 items
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('♿ Accessibility Compliance', () => {
    test('provides proper accessibility labels and hints', async () => {
      const { getByLabelText, getByA11yHint } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Integration cards should have proper labels
        expect(getByLabelText('Gmail integration')).toBeTruthy();
        expect(getByLabelText('Slack integration')).toBeTruthy();
        
        // Action buttons should have accessibility hints
        expect(getByA11yHint('Double tap to connect Gmail')).toBeTruthy();
        expect(getByA11yHint('Double tap to test Gmail connection')).toBeTruthy();
      });
    });
  });
});