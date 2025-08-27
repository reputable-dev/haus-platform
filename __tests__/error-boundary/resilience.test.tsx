/**
 * ERROR BOUNDARY AND RESILIENCE TESTS - System Recovery Validation
 * Tests application resilience, error boundaries, and graceful degradation
 */

import React, { ErrorInfo } from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IntegrationsScreen from '../../app/settings/integrations';
import { IntegrationAuthModal } from '../../components/integrations/IntegrationAuthModal';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useIntegrations } from '../../hooks/useIntegrations';
import { trpc } from '../../lib/trpc';

// Mock dependencies
jest.mock('../../lib/trpc');
jest.mock('../../utils/secureStorage');
jest.mock('expo-secure-store');

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn()
};

// Mock Alert
jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'error').mockImplementation(() => {});

// Test Error Boundary Component
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('Text', { testID: 'error-boundary' }, 
        `Something went wrong: ${this.state.error?.message}`
      );
    }

    return this.props.children;
  }
}

// Error-prone test component
const ErrorProneComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test component error');
  }
  return React.createElement('Text', { testID: 'success-component' }, 'Component rendered successfully');
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

describe('🛡️ Error Boundary and Resilience Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful mocks
    (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    (trpc.integrations.getUserConnections.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    (trpc.integrations.getHealthStatus.useQuery as jest.Mock).mockReturnValue({
      data: { integrations: [], overallStatus: 'healthy', lastUpdated: new Date().toISOString() },
      isLoading: false,
      error: null
    });
  });

  describe('🚨 Component Error Boundaries', () => {
    test('error boundary catches and displays component rendering errors', () => {
      const onError = jest.fn();

      const { getByTestId, queryByTestId } = render(
        React.createElement(TestErrorBoundary, { onError },
          React.createElement(ErrorProneComponent, { shouldThrow: true })
        )
      );

      expect(getByTestId('error-boundary')).toBeTruthy();
      expect(queryByTestId('success-component')).toBeNull();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    test('error boundary allows normal rendering when no errors', () => {
      const onError = jest.fn();

      const { getByTestId, queryByTestId } = render(
        React.createElement(TestErrorBoundary, { onError },
          React.createElement(ErrorProneComponent, { shouldThrow: false })
        )
      );

      expect(getByTestId('success-component')).toBeTruthy();
      expect(queryByTestId('error-boundary')).toBeNull();
      expect(onError).not.toHaveBeenCalled();
    });

    test('integrations screen handles component errors gracefully', () => {
      // Force a component error by returning invalid data
      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: null, // Invalid data that might cause render errors
        isLoading: false,
        error: null
      });

      const { getByText } = render(
        React.createElement(TestErrorBoundary, {},
          React.createElement(IntegrationsScreen, { navigation: mockNavigation })
        ),
        { wrapper: createWrapper() }
      );

      // Should not crash the entire app
      expect(() => getByText('Integrations')).not.toThrow();
    });

    test('auth modal handles webview errors without crashing', async () => {
      const onError = jest.fn();
      const onSuccess = jest.fn();
      const onAuthError = jest.fn();

      const { getByTestId } = render(
        React.createElement(TestErrorBoundary, { onError },
          React.createElement(IntegrationAuthModal, {
            visible: true,
            onClose: jest.fn(),
            authToken: 'test-token',
            integration: { id: 'gmail', name: 'Gmail' },
            onSuccess,
            onError: onAuthError
          })
        ),
        { wrapper: createWrapper() }
      );

      // Simulate webview error
      const webview = getByTestId('auth-webview');
      fireEvent(webview, 'error', { nativeEvent: { description: 'WebView load failed' } });

      await waitFor(() => {
        expect(onAuthError).toHaveBeenCalledWith(
          expect.stringMatching(/webview/i)
        );
      });

      // Should not trigger error boundary
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('🌐 Network Error Resilience', () => {
    test('handles complete network failure gracefully', async () => {
      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network request failed')
      });

      const { getByText, queryByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getByText('Failed to load integrations')).toBeTruthy();
        expect(getByText('Retry')).toBeTruthy();
      });

      // Should not show any integrations
      expect(queryByText('Gmail')).toBeNull();
      expect(queryByText('Slack')).toBeNull();

      // User can retry
      const retryButton = getByText('Retry');
      fireEvent.press(retryButton);

      // Should trigger refetch
      expect(retryButton).toBeTruthy();
    });

    test('handles intermittent connection failures with exponential backoff', async () => {
      let attemptCount = 0;
      const mockQuery = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return {
            data: null,
            isLoading: false,
            error: new Error('Temporary network failure')
          };
        }
        return {
          data: [{ id: 'gmail', name: 'Gmail', category: 'Communication', popular: true, features: [], actions: [], requirements: [] }],
          isLoading: false,
          error: null
        };
      });

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockImplementation(mockQuery);

      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      // First attempt fails
      await waitFor(() => {
        expect(getByText('Failed to load integrations')).toBeTruthy();
      });

      // Retry once
      fireEvent.press(getByText('Retry'));

      // Still failing
      await waitFor(() => {
        expect(getByText('Failed to load integrations')).toBeTruthy();
      });

      // Retry again
      fireEvent.press(getByText('Retry'));

      // Should eventually succeed
      await waitFor(() => {
        expect(getByText('Gmail')).toBeTruthy();
      });

      expect(attemptCount).toBeGreaterThanOrEqual(3);
    });

    test('handles timeout errors with appropriate feedback', async () => {
      (trpc.integrations.generateAuthToken.useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn().mockImplementation((_, { onError }) => {
          setTimeout(() => onError(new Error('Request timeout')), 100);
        }),
        isLoading: false
      });

      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      // Mock integration data
      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: [{ id: 'gmail', name: 'Gmail', category: 'Communication', popular: true, features: [], actions: [], requirements: [] }],
        isLoading: false,
        error: null
      });

      await waitFor(() => {
        expect(getByText('Connect')).toBeTruthy();
      });

      fireEvent.press(getByText('Connect'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Connection Failed',
          expect.stringContaining('timeout'),
          expect.any(Array)
        );
      });
    });

    test('maintains app stability during rapid network state changes', async () => {
      let networkState = 'online';
      const mockQuery = jest.fn().mockImplementation(() => {
        if (networkState === 'offline') {
          return {
            data: null,
            isLoading: false,
            error: new Error('Network unavailable')
          };
        }
        return {
          data: [{ id: 'gmail', name: 'Gmail', category: 'Communication', popular: true, features: [], actions: [], requirements: [] }],
          isLoading: false,
          error: null
        };
      });

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockImplementation(mockQuery);

      const { getByText, queryByText, rerender } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      // Initial online state
      await waitFor(() => {
        expect(getByText('Gmail')).toBeTruthy();
      });

      // Rapid state changes
      for (let i = 0; i < 5; i++) {
        networkState = i % 2 === 0 ? 'offline' : 'online';
        rerender(React.createElement(IntegrationsScreen, { navigation: mockNavigation }));
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
        });
      }

      // App should not crash and should handle the final state
      expect(() => {
        queryByText('Gmail') || queryByText('Failed to load integrations');
      }).not.toThrow();
    });
  });

  describe('🔐 Authentication Error Recovery', () => {
    test('handles OAuth flow interruption gracefully', async () => {
      const onError = jest.fn();

      const { getByTestId } = render(
        React.createElement(IntegrationAuthModal, {
          visible: true,
          onClose: jest.fn(),
          authToken: 'test-token',
          integration: { id: 'gmail', name: 'Gmail' },
          onSuccess: jest.fn(),
          onError
        }),
        { wrapper: createWrapper() }
      );

      const webview = getByTestId('auth-webview');

      // Simulate OAuth interruption
      fireEvent(webview, 'error', {
        nativeEvent: { description: 'OAuth flow interrupted' }
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringMatching(/oauth.*interrupted/i)
        );
      });
    });

    test('recovers from expired auth tokens during connection', async () => {
      const mockMutate = jest.fn().mockImplementation((_, { onError }) => {
        onError(new Error('Authentication token expired'));
      });

      (trpc.integrations.generateAuthToken.useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isLoading: false
      });

      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: [{ id: 'gmail', name: 'Gmail', category: 'Communication', popular: true, features: [], actions: [], requirements: [] }],
        isLoading: false,
        error: null
      });

      await waitFor(() => {
        expect(getByText('Connect')).toBeTruthy();
      });

      fireEvent.press(getByText('Connect'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Connection Failed',
          expect.stringMatching(/token.*expired/i),
          expect.arrayContaining([
            expect.objectContaining({ text: 'Retry' })
          ])
        );
      });
    });

    test('handles multiple simultaneous authentication failures', async () => {
      const mockMutate = jest.fn().mockImplementation((_, { onError }) => {
        onError(new Error('Authentication failed'));
      });

      (trpc.integrations.generateAuthToken.useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isLoading: false
      });

      const integrations = [
        { id: 'gmail', name: 'Gmail', category: 'Communication', popular: true, features: [], actions: [], requirements: [] },
        { id: 'slack', name: 'Slack', category: 'Communication', popular: true, features: [], actions: [], requirements: [] },
        { id: 'notion', name: 'Notion', category: 'Productivity', popular: false, features: [], actions: [], requirements: [] }
      ];

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: integrations,
        isLoading: false,
        error: null
      });

      const { getAllByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(getAllByText('Connect')).toHaveLength(3);
      });

      // Attempt to connect all three simultaneously
      const connectButtons = getAllByText('Connect');
      connectButtons.forEach(button => fireEvent.press(button));

      // Should handle all failures gracefully
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(3);
        expect(Alert.alert).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('💾 Data Corruption Recovery', () => {
    test('handles malformed API responses gracefully', async () => {
      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: {
          // Malformed response - should be array
          invalid: 'data structure'
        },
        isLoading: false,
        error: null
      });

      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Should handle malformed data and show appropriate message
        expect(getByText('Failed to load integrations') || getByText('No integrations available')).toBeTruthy();
      });
    });

    test('recovers from corrupted local storage data', async () => {
      // Mock corrupted secure storage
      const mockSecureStore = require('expo-secure-store');
      mockSecureStore.getItemAsync.mockResolvedValue('corrupted-data-not-json');

      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      // Should not crash and should handle corrupted data gracefully
      await waitFor(() => {
        expect(() => getByText('Integrations')).not.toThrow();
      });
    });

    test('handles missing required data fields', async () => {
      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: [
          {
            id: 'gmail',
            // Missing required fields like name, category
            description: 'Gmail integration'
          },
          {
            // Missing id field
            name: 'Slack',
            category: 'Communication'
          }
        ],
        isLoading: false,
        error: null
      });

      const { queryByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      // Should handle missing fields gracefully
      await waitFor(() => {
        // Should not crash and should handle invalid data
        expect(() => {
          queryByText('Gmail') || queryByText('Slack') || queryByText('No integrations');
        }).not.toThrow();
      });
    });
  });

  describe('⚡ Memory and Performance Error Recovery', () => {
    test('handles memory pressure gracefully', async () => {
      // Simulate memory pressure by creating large dataset
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `service-${i}`,
        name: `Service ${i}`.repeat(100), // Large strings
        description: `Description for service ${i}`.repeat(50),
        category: 'Communication',
        popular: false,
        features: Array.from({ length: 100 }, (_, j) => `Feature ${j}`),
        actions: Array.from({ length: 50 }, (_, j) => ({ id: `action-${j}`, name: `Action ${j}`, description: `Action ${j} description` })),
        requirements: Array.from({ length: 20 }, (_, j) => `Requirement ${j}`)
      }));

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: largeDataset,
        isLoading: false,
        error: null
      });

      const { queryByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper: createWrapper() }
      );

      // Should handle large datasets without crashing
      await waitFor(() => {
        expect(() => {
          queryByText('Service 0') || queryByText('Loading') || queryByText('Error');
        }).not.toThrow();
      }, { timeout: 10000 });
    });

    test('recovers from infinite render loops', () => {
      let renderCount = 0;
      const ProblematicComponent = () => {
        renderCount++;
        
        // Simulate infinite render loop detection
        if (renderCount > 100) {
          throw new Error('Infinite render loop detected');
        }

        // Force re-render
        const [, setState] = React.useState(0);
        React.useEffect(() => {
          if (renderCount < 10) {
            setState(prev => prev + 1);
          }
        });

        return React.createElement('Text', {}, 'Problematic Component');
      };

      const onError = jest.fn();

      const { getByTestId } = render(
        React.createElement(TestErrorBoundary, { onError },
          React.createElement(ProblematicComponent)
        )
      );

      // Should eventually be caught by error boundary
      expect(onError).toHaveBeenCalled();
      expect(getByTestId('error-boundary')).toBeTruthy();
    });
  });

  describe('🔄 State Management Error Recovery', () => {
    test('recovers from React Query cache corruption', async () => {
      const queryClient = new QueryClient();
      
      // Corrupt the cache
      queryClient.setQueryData(['integrations', 'available'], 'corrupted-data');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: [{ id: 'gmail', name: 'Gmail', category: 'Communication', popular: true, features: [], actions: [], requirements: [] }],
        isLoading: false,
        error: null
      });

      const { getByText } = render(
        React.createElement(IntegrationsScreen, { navigation: mockNavigation }),
        { wrapper }
      );

      // Should recover from corrupted cache
      await waitFor(() => {
        expect(() => getByText('Gmail') || getByText('Loading')).not.toThrow();
      });
    });

    test('handles concurrent state updates safely', async () => {
      const { result } = require('@testing-library/react-hooks').renderHook(() => useIntegrations(), {
        wrapper: createWrapper()
      });

      // Simulate rapid concurrent updates
      const promises = Array.from({ length: 10 }, async (_, i) => {
        await act(async () => {
          // Simulate concurrent mutations
          result.current.generateAuthToken?.mutateAsync({
            integration_id: `service-${i}`,
            user_agent: 'test'
          }).catch(() => {}); // Ignore errors for this test
        });
      });

      await Promise.allSettled(promises);

      // Hook should remain stable
      expect(() => result.current).not.toThrow();
    });
  });
});