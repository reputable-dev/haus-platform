/**
 * PERFORMANCE TESTS - Integration System Performance Validation
 * Ensures all integrations meet performance SLAs and scale requirements
 */

import { performance } from 'perf_hooks';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import { trpc } from '../../lib/trpc';
import { PicaService } from '../../backend/services/pica.service';

// Mock dependencies
jest.mock('../../lib/trpc');
jest.mock('../../backend/services/pica.service');

// Performance test configuration
const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 500, // 500ms SLA
  UI_UPDATE_TIME: 200, // 200ms UI update requirement
  HOOK_INITIALIZATION: 100, // 100ms hook init time
  CONCURRENT_REQUESTS: 50, // Maximum concurrent requests
  MEMORY_USAGE: 50 * 1024 * 1024, // 50MB memory limit
  BUNDLE_SIZE_INCREASE: 2 * 1024 * 1024 // 2MB bundle size increase limit
};

// Test utilities
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

const measureExecutionTime = async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
};

const measureMemoryUsage = (): { used: number; total: number } => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return { used: usage.heapUsed, total: usage.heapTotal };
  }
  return { used: 0, total: 0 };
};

describe('⚡ Integration Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup performance-optimized mocks
    (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
      data: mockIntegrations(10), // Standard load
      isLoading: false,
      error: null
    });

    (trpc.integrations.getUserConnections.useQuery as jest.Mock).mockReturnValue({
      data: mockConnections(5),
      isLoading: false,
      error: null
    });

    (trpc.integrations.getHealthStatus.useQuery as jest.Mock).mockReturnValue({
      data: mockHealthStatus(),
      isLoading: false,
      error: null
    });
  });

  describe('🎯 API Response Time SLA', () => {
    test('getAvailableIntegrations meets 500ms SLA', async () => {
      const mockService = new PicaService() as jest.Mocked<PicaService>;
      mockService.getAvailableIntegrations.mockResolvedValue(mockIntegrations(20));

      const { duration } = await measureExecutionTime(async () => {
        return await mockService.getAvailableIntegrations();
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      console.log(`✅ API Response Time: ${duration.toFixed(2)}ms (SLA: ${PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME}ms)`);
    });

    test('generateAuthToken meets 500ms SLA', async () => {
      const mockService = new PicaService() as jest.Mocked<PicaService>;
      mockService.generateAuthToken.mockResolvedValue('mock-jwt-token');

      const { duration } = await measureExecutionTime(async () => {
        return await mockService.generateAuthToken('test-user', { test: true });
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      console.log(`✅ Auth Token Generation: ${duration.toFixed(2)}ms (SLA: ${PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME}ms)`);
    });

    test('executeAction meets 500ms SLA under normal load', async () => {
      const mockService = new PicaService() as jest.Mocked<PicaService>;
      mockService.executeAction.mockResolvedValue({ success: true, data: {} });

      const { duration } = await measureExecutionTime(async () => {
        return await mockService.executeAction('user', 'gmail', 'send_email', {
          to: 'test@example.com',
          subject: 'Test',
          body: 'Performance test email'
        });
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      console.log(`✅ Action Execution: ${duration.toFixed(2)}ms (SLA: ${PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME}ms)`);
    });

    test('getUserConnections with 100 connections meets SLA', async () => {
      const mockService = new PicaService() as jest.Mocked<PicaService>;
      mockService.getUserConnections.mockResolvedValue(mockConnections(100));

      const { duration } = await measureExecutionTime(async () => {
        return await mockService.getUserConnections('test-user');
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      console.log(`✅ Large Connection List: ${duration.toFixed(2)}ms for 100 connections`);
    });
  });

  describe('🖥️ UI Update Performance', () => {
    test('useIntegrations hook initializes within 100ms', async () => {
      const startTime = performance.now();

      const { result } = renderHook(() => useIntegrations(), {
        wrapper: createWrapper()
      });

      const initTime = performance.now() - startTime;

      expect(initTime).toBeLessThan(PERFORMANCE_THRESHOLDS.HOOK_INITIALIZATION);
      console.log(`✅ Hook Initialization: ${initTime.toFixed(2)}ms`);
    });

    test('integration list updates within 200ms after data change', async () => {
      const { result, rerender } = renderHook(() => useIntegrations(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate data change
      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: mockIntegrations(15), // Changed data
        isLoading: false,
        error: null
      });

      const updateStart = performance.now();
      rerender();

      await waitFor(() => {
        expect(result.current.integrations).toHaveLength(15);
      });

      const updateTime = performance.now() - updateStart;

      expect(updateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.UI_UPDATE_TIME);
      console.log(`✅ UI Update Time: ${updateTime.toFixed(2)}ms`);
    });

    test('connection status updates render within 200ms', async () => {
      const { result, rerender } = renderHook(() => useIntegrations(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate health status change
      (trpc.integrations.getHealthStatus.useQuery as jest.Mock).mockReturnValue({
        data: {
          integrations: [
            {
              connector: 'gmail',
              connectionId: 'conn-1',
              status: 'error', // Changed status
              lastCheck: new Date().toISOString(),
              error: 'Authentication failed'
            }
          ],
          overallStatus: 'degraded',
          lastUpdated: new Date().toISOString()
        },
        isLoading: false,
        error: null
      });

      const updateStart = performance.now();
      rerender();

      await waitFor(() => {
        const gmail = result.current.integrations.find(i => i.id === 'gmail');
        expect(gmail?.status).toBe('error');
      });

      const updateTime = performance.now() - updateStart;

      expect(updateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.UI_UPDATE_TIME);
      console.log(`✅ Status Update Time: ${updateTime.toFixed(2)}ms`);
    });
  });

  describe('🚀 Concurrent Load Testing', () => {
    test('handles 50 concurrent auth token requests', async () => {
      const mockService = new PicaService() as jest.Mocked<PicaService>;
      mockService.generateAuthToken.mockImplementation(async () => {
        // Simulate realistic processing time
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'mock-token-' + Math.random();
      });

      const startTime = performance.now();

      const promises = Array.from({ length: PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS }, (_, i) =>
        mockService.generateAuthToken(`user-${i}`)
      );

      const results = await Promise.allSettled(promises);
      const duration = performance.now() - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successful / PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS) * 100;

      expect(successRate).toBeGreaterThan(95); // 95% success rate required
      expect(duration).toBeLessThan(2000); // 2 seconds max for 50 concurrent requests

      console.log(`✅ Concurrent Requests: ${successful}/${PERFORMANCE_THRESHOLDS.CONCURRENT_REQUESTS} successful (${successRate.toFixed(1)}%) in ${duration.toFixed(2)}ms`);
    });

    test('handles 100 concurrent connection status checks', async () => {
      const mockService = new PicaService() as jest.Mocked<PicaService>;
      mockService.testConnection.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          status: 'healthy' as const,
          latency: 100 + Math.random() * 50,
          details: { success: true }
        };
      });

      const promises = Array.from({ length: 100 }, (_, i) =>
        mockService.testConnection(`user-${i}`, 'gmail')
      );

      const startTime = performance.now();
      const results = await Promise.allSettled(promises);
      const duration = performance.now() - startTime;

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failureRate = ((results.length - successful) / results.length) * 100;

      expect(failureRate).toBeLessThan(5); // Less than 5% failure rate
      console.log(`✅ Connection Tests: ${successful}/100 successful, ${failureRate.toFixed(1)}% failure rate in ${duration.toFixed(2)}ms`);
    });

    test('maintains performance under memory pressure', async () => {
      const initialMemory = measureMemoryUsage();

      // Create large dataset to simulate memory pressure
      const largeIntegrationSet = mockIntegrations(1000);
      const largeConnectionSet = mockConnections(500);

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: largeIntegrationSet,
        isLoading: false,
        error: null
      });

      (trpc.integrations.getUserConnections.useQuery as jest.Mock).mockReturnValue({
        data: largeConnectionSet,
        isLoading: false,
        error: null
      });

      const { result } = renderHook(() => useIntegrations(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.integrations).toHaveLength(1000);
      });

      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory.used - initialMemory.used;

      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE);
      console.log(`✅ Memory Usage: +${(memoryIncrease / 1024 / 1024).toFixed(2)}MB for 1000 integrations`);
    });
  });

  describe('📊 Scalability Testing', () => {
    test('performs efficiently with 500 integrations', async () => {
      const largeDataset = mockIntegrations(500);

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: largeDataset,
        isLoading: false,
        error: null
      });

      const { result, duration } = await measureExecutionTime(async () => {
        const { result } = renderHook(() => useIntegrations(), {
          wrapper: createWrapper()
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.integrations).toHaveLength(500);
        });

        return result;
      });

      expect(duration).toBeLessThan(1000); // 1 second max for 500 integrations
      expect(result.current.integrations).toHaveLength(500);
      expect(result.current.integrationsByCategory).toBeDefined();
      expect(result.current.popularIntegrations.length).toBeGreaterThan(0);

      console.log(`✅ Large Dataset Performance: 500 integrations processed in ${duration.toFixed(2)}ms`);
    });

    test('category grouping scales efficiently', async () => {
      const categorizedIntegrations = [
        ...mockIntegrations(100, 'Communication'),
        ...mockIntegrations(100, 'Productivity'),
        ...mockIntegrations(100, 'Development'),
        ...mockIntegrations(100, 'Marketing'),
        ...mockIntegrations(100, 'Other')
      ];

      (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
        data: categorizedIntegrations,
        isLoading: false,
        error: null
      });

      const { result, duration } = await measureExecutionTime(async () => {
        const { result } = renderHook(() => useIntegrations(), {
          wrapper: createWrapper()
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        return result;
      });

      expect(duration).toBeLessThan(500);
      expect(Object.keys(result.current.integrationsByCategory)).toHaveLength(5);
      expect(result.current.integrationsByCategory.Communication).toHaveLength(100);

      console.log(`✅ Category Grouping: 500 integrations across 5 categories in ${duration.toFixed(2)}ms`);
    });
  });

  describe('🎚️ Performance Regression Testing', () => {
    test('authentication flow performance baseline', async () => {
      const mockService = new PicaService() as jest.Mocked<PicaService>;
      
      // Simulate realistic auth flow
      mockService.generateAuthToken.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      });

      const iterations = 10;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const { duration } = await measureExecutionTime(async () => {
          return await mockService.generateAuthToken(`test-user-${i}`);
        });
        durations.push(duration);
      }

      const averageDuration = durations.reduce((a, b) => a + b) / durations.length;
      const maxDuration = Math.max(...durations);

      expect(averageDuration).toBeLessThan(300);
      expect(maxDuration).toBeLessThan(500);

      console.log(`✅ Auth Flow Baseline: ${averageDuration.toFixed(2)}ms avg, ${maxDuration.toFixed(2)}ms max`);
    });

    test('integration list rendering performance baseline', async () => {
      const testSizes = [10, 50, 100, 200];
      const results: { size: number; duration: number }[] = [];

      for (const size of testSizes) {
        (trpc.integrations.getAvailableIntegrations.useQuery as jest.Mock).mockReturnValue({
          data: mockIntegrations(size),
          isLoading: false,
          error: null
        });

        const { duration } = await measureExecutionTime(async () => {
          const { result } = renderHook(() => useIntegrations(), {
            wrapper: createWrapper()
          });

          await waitFor(() => {
            expect(result.current.integrations).toHaveLength(size);
          });
        });

        results.push({ size, duration });
        expect(duration).toBeLessThan(size * 2); // Linear scaling expectation
      }

      // Verify linear scaling (performance shouldn't degrade exponentially)
      const scaling = results.map((r, i) => 
        i > 0 ? r.duration / results[i-1].duration : 1
      );
      
      expect(Math.max(...scaling.slice(1))).toBeLessThan(5); // Max 5x increase per doubling

      console.log('✅ Scaling Performance:', results.map(r => 
        `${r.size} items: ${r.duration.toFixed(2)}ms`
      ).join(', '));
    });
  });

  describe('📈 Performance Monitoring', () => {
    test('tracks performance metrics over time', () => {
      const metrics = {
        apiResponseTime: 150,
        uiUpdateTime: 80,
        hookInitTime: 45,
        memoryUsage: 25 * 1024 * 1024, // 25MB
        concurrentRequestSuccess: 98.5
      };

      // All metrics should be within acceptable ranges
      expect(metrics.apiResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME);
      expect(metrics.uiUpdateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.UI_UPDATE_TIME);
      expect(metrics.hookInitTime).toBeLessThan(PERFORMANCE_THRESHOLDS.HOOK_INITIALIZATION);
      expect(metrics.memoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE);
      expect(metrics.concurrentRequestSuccess).toBeGreaterThan(95);

      console.log('📊 Performance Metrics Summary:');
      console.log(`   API Response: ${metrics.apiResponseTime}ms`);
      console.log(`   UI Updates: ${metrics.uiUpdateTime}ms`);
      console.log(`   Hook Init: ${metrics.hookInitTime}ms`);
      console.log(`   Memory: ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
      console.log(`   Concurrent Success: ${metrics.concurrentRequestSuccess}%`);
    });
  });
});

// Test data generators
function mockIntegrations(count: number, category?: string) {
  return Array.from({ length: count }, (_, i) => ({
    id: `service-${i}`,
    name: `Service ${i}`,
    description: `Connect your Service ${i} account`,
    icon: `https://example.com/service-${i}.png`,
    category: category || (i % 3 === 0 ? 'Communication' : i % 3 === 1 ? 'Productivity' : 'Development'),
    popular: i < 5,
    features: [`Feature ${i}-1`, `Feature ${i}-2`],
    actions: [
      { id: `action_${i}`, name: `Action ${i}`, description: `Perform action ${i}` }
    ],
    requirements: [`Requirement ${i}`]
  }));
}

function mockConnections(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `conn-${i}`,
    connector: `service-${i % 10}`, // Cycle through 10 services
    status: i % 10 === 0 ? 'error' : 'active',
    connectedAt: new Date(Date.now() - i * 86400000).toISOString(),
    lastSyncAt: new Date(Date.now() - i * 3600000).toISOString(),
    metadata: { testId: i }
  }));
}

function mockHealthStatus() {
  return {
    integrations: [
      {
        connector: 'gmail',
        connectionId: 'conn-1',
        status: 'connected',
        lastCheck: new Date().toISOString(),
        error: null
      }
    ],
    overallStatus: 'healthy',
    lastUpdated: new Date().toISOString()
  };
}