/**
 * API ENDPOINT VALIDATION TESTS - tRPC Router Testing
 * Validates all integration endpoints work correctly with proper error handling
 */

import { createCallerFactory } from '@trpc/server';
import { z } from 'zod';
import { appRouter } from '../../backend/trpc/router';
import { PicaService } from '../../backend/services/pica.service';
import type { RouterInputs, RouterOutputs } from '../../backend/trpc/types';

// Mock PicaService
jest.mock('../../backend/services/pica.service');

// Create test context
const createContext = () => ({
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User'
  },
  session: {
    id: 'test-session-123',
    userId: 'test-user-123'
  }
});

const createCaller = createCallerFactory(appRouter);

describe('🔌 tRPC Integration Endpoints', () => {
  let caller: ReturnType<typeof createCaller>;
  let mockPicaService: jest.Mocked<PicaService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocked PicaService
    mockPicaService = new PicaService() as jest.Mocked<PicaService>;
    
    // Create caller with test context
    caller = createCaller(createContext());
  });

  describe('🔐 generateAuthToken Endpoint', () => {
    const validTokenRequest: RouterInputs['integrations']['generateAuthToken'] = {
      integration_id: 'gmail',
      user_agent: 'Haus Platform/1.0'
    };

    test('returns valid JWT token structure', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTg4MDB9.signature';
      
      mockPicaService.generateAuthToken.mockResolvedValue(mockToken);

      const result = await caller.integrations.generateAuthToken(validTokenRequest);

      expect(result).toHaveProperty('token', mockToken);
      expect(result).toHaveProperty('expires_in', 3600);
      expect(result).toHaveProperty('token_type', 'Bearer');
      
      // Validate JWT structure
      expect(result.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      expect(mockPicaService.generateAuthToken).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          integration_id: 'gmail',
          user_agent: 'Haus Platform/1.0',
          platform: 'haus-platform',
          generated_at: expect.any(String)
        })
      );
    });

    test('validates required parameters', async () => {
      await expect(
        caller.integrations.generateAuthToken({} as any)
      ).rejects.toThrow();
      
      await expect(
        caller.integrations.generateAuthToken({
          integration_id: '',
          user_agent: 'test'
        })
      ).rejects.toThrow();
    });

    test('handles service errors gracefully', async () => {
      mockPicaService.generateAuthToken.mockRejectedValue(
        new Error('Invalid integration ID')
      );

      await expect(
        caller.integrations.generateAuthToken(validTokenRequest)
      ).rejects.toThrow('Invalid integration ID');
    });

    test('validates integration_id format', async () => {
      const invalidRequests = [
        { integration_id: 'INVALID-CAPS', user_agent: 'test' },
        { integration_id: 'spaces in name', user_agent: 'test' },
        { integration_id: 'special!@#chars', user_agent: 'test' },
        { integration_id: 'a'.repeat(101), user_agent: 'test' } // Too long
      ];

      for (const request of invalidRequests) {
        await expect(
          caller.integrations.generateAuthToken(request)
        ).rejects.toThrow();
      }
    });
  });

  describe('🔗 getAvailableIntegrations Endpoint', () => {
    const mockIntegrations: RouterOutputs['integrations']['getAvailableIntegrations'] = [
      {
        id: 'gmail',
        name: 'Gmail',
        description: 'Connect your Gmail account',
        icon: 'https://example.com/gmail.png',
        category: 'Communication',
        popular: true,
        features: ['Send emails', 'Read emails', 'Manage labels'],
        actions: [
          { id: 'send_email', name: 'Send Email', description: 'Send an email message' }
        ],
        requirements: ['Gmail account']
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Connect your Slack workspace',
        icon: 'https://example.com/slack.png',
        category: 'Communication',
        popular: true,
        features: ['Send messages', 'Create channels'],
        actions: [],
        requirements: []
      }
    ];

    test('returns properly formatted integrations list', async () => {
      mockPicaService.getAvailableIntegrations.mockResolvedValue(mockIntegrations);

      const result = await caller.integrations.getAvailableIntegrations();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'gmail',
        name: 'Gmail',
        description: 'Connect your Gmail account',
        category: 'Communication',
        popular: true
      });

      // Validate array structure
      result.forEach(integration => {
        expect(integration).toHaveProperty('id');
        expect(integration).toHaveProperty('name');
        expect(integration).toHaveProperty('category');
        expect(integration.features).toEqual(expect.any(Array));
        expect(integration.actions).toEqual(expect.any(Array));
        expect(integration.requirements).toEqual(expect.any(Array));
      });
    });

    test('handles empty integrations list', async () => {
      mockPicaService.getAvailableIntegrations.mockResolvedValue([]);

      const result = await caller.integrations.getAvailableIntegrations();

      expect(result).toEqual([]);
    });

    test('handles service unavailable errors', async () => {
      mockPicaService.getAvailableIntegrations.mockRejectedValue(
        new Error('Pica service unavailable')
      );

      await expect(
        caller.integrations.getAvailableIntegrations()
      ).rejects.toThrow('Pica service unavailable');
    });
  });

  describe('👤 getUserConnections Endpoint', () => {
    const mockConnections: RouterOutputs['integrations']['getUserConnections'] = [
      {
        id: 'conn-1',
        connector: 'gmail',
        status: 'active',
        connectedAt: '2024-01-01T00:00:00.000Z',
        lastSyncAt: '2024-01-15T10:30:00.000Z',
        metadata: { email: 'user@example.com' }
      }
    ];

    test('returns user connections with proper format', async () => {
      mockPicaService.getUserConnections.mockResolvedValue(mockConnections);

      const result = await caller.integrations.getUserConnections();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'conn-1',
        connector: 'gmail',
        status: 'active',
        connectedAt: '2024-01-01T00:00:00.000Z'
      });

      expect(mockPicaService.getUserConnections).toHaveBeenCalledWith('test-user-123');
    });

    test('handles user with no connections', async () => {
      mockPicaService.getUserConnections.mockResolvedValue([]);

      const result = await caller.integrations.getUserConnections();

      expect(result).toEqual([]);
    });

    test('validates date formats in response', async () => {
      mockPicaService.getUserConnections.mockResolvedValue(mockConnections);

      const result = await caller.integrations.getUserConnections();

      expect(result[0].connectedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(result[0].connectedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('⚡ executeAction Endpoint', () => {
    const validActionRequest: RouterInputs['integrations']['executeAction'] = {
      connector: 'gmail',
      action: 'send_email',
      data: {
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: 'This is a test email'
      }
    };

    test('executes action successfully', async () => {
      const mockResult = {
        success: true,
        data: { message: 'Email sent successfully', messageId: 'msg-123' }
      };

      mockPicaService.executeAction.mockResolvedValue(mockResult);

      const result = await caller.integrations.executeAction(validActionRequest);

      expect(result).toEqual(mockResult);
      expect(mockPicaService.executeAction).toHaveBeenCalledWith(
        'test-user-123',
        'gmail',
        'send_email',
        expect.objectContaining({
          to: 'recipient@example.com',
          subject: 'Test Email',
          body: 'This is a test email'
        })
      );
    });

    test('prevents action on disconnected integration', async () => {
      mockPicaService.getUserConnections.mockResolvedValue([]); // No connections

      await expect(
        caller.integrations.executeAction(validActionRequest)
      ).rejects.toThrow();
    });

    test('validates action parameters', async () => {
      await expect(
        caller.integrations.executeAction({
          connector: '',
          action: 'send_email',
          data: {}
        })
      ).rejects.toThrow();

      await expect(
        caller.integrations.executeAction({
          connector: 'gmail',
          action: '',
          data: {}
        })
      ).rejects.toThrow();
    });

    test('handles action execution errors', async () => {
      mockPicaService.executeAction.mockRejectedValue(
        new Error('Insufficient permissions')
      );

      await expect(
        caller.integrations.executeAction(validActionRequest)
      ).rejects.toThrow('Insufficient permissions');
    });

    test('sanitizes action data for security', async () => {
      const maliciousRequest = {
        connector: 'gmail',
        action: 'send_email',
        data: {
          to: 'test@example.com',
          subject: '<script>alert("xss")</script>',
          body: 'SELECT * FROM users; --'
        }
      };

      mockPicaService.executeAction.mockResolvedValue({ success: true });

      await caller.integrations.executeAction(maliciousRequest);

      // Verify service was called with sanitized data
      const calledData = mockPicaService.executeAction.mock.calls[0][3];
      expect(calledData.subject).not.toContain('<script>');
      expect(calledData.body).not.toContain('SELECT *');
    });
  });

  describe('🔌 disconnectIntegration Endpoint', () => {
    const validDisconnectRequest: RouterInputs['integrations']['disconnectIntegration'] = {
      connectionId: 'conn-1'
    };

    test('disconnects integration successfully', async () => {
      mockPicaService.disconnectIntegration.mockResolvedValue(undefined);

      const result = await caller.integrations.disconnectIntegration(validDisconnectRequest);

      expect(result).toEqual({ success: true });
      expect(mockPicaService.disconnectIntegration).toHaveBeenCalledWith(
        'test-user-123',
        'conn-1'
      );
    });

    test('validates connection ID format', async () => {
      await expect(
        caller.integrations.disconnectIntegration({
          connectionId: ''
        })
      ).rejects.toThrow();

      await expect(
        caller.integrations.disconnectIntegration({
          connectionId: 'invalid format with spaces'
        })
      ).rejects.toThrow();
    });

    test('handles non-existent connection gracefully', async () => {
      mockPicaService.disconnectIntegration.mockRejectedValue(
        new Error('Connection not found')
      );

      await expect(
        caller.integrations.disconnectIntegration(validDisconnectRequest)
      ).rejects.toThrow('Connection not found');
    });
  });

  describe('🏥 testConnection Endpoint', () => {
    const validTestRequest: RouterInputs['integrations']['testConnection'] = {
      connector: 'gmail'
    };

    test('returns healthy connection status', async () => {
      const mockHealthyResult = {
        status: 'healthy' as const,
        latency: 150,
        details: { success: true }
      };

      mockPicaService.testConnection.mockResolvedValue(mockHealthyResult);

      const result = await caller.integrations.testConnection(validTestRequest);

      expect(result).toEqual({
        connector: 'gmail',
        status: 'healthy',
        latency: 150,
        testedAt: expect.any(String)
      });

      expect(result.latency).toBeGreaterThan(0);
      expect(new Date(result.testedAt).getTime()).toBeGreaterThan(0);
    });

    test('returns error status for failed connections', async () => {
      const mockErrorResult = {
        status: 'error' as const,
        latency: null,
        details: { error: 'Connection timeout' }
      };

      mockPicaService.testConnection.mockResolvedValue(mockErrorResult);

      const result = await caller.integrations.testConnection(validTestRequest);

      expect(result).toEqual({
        connector: 'gmail',
        status: 'error',
        error: 'Connection timeout',
        testedAt: expect.any(String)
      });
    });

    test('validates connector parameter', async () => {
      await expect(
        caller.integrations.testConnection({
          connector: ''
        })
      ).rejects.toThrow();
    });
  });

  describe('💚 getHealthStatus Endpoint', () => {
    const mockHealthStatus: RouterOutputs['integrations']['getHealthStatus'] = {
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

    test('returns comprehensive health status', async () => {
      // Mock individual connection health checks
      mockPicaService.getUserConnections.mockResolvedValue([
        {
          id: 'conn-1',
          connector: 'gmail',
          status: 'active',
          connectedAt: '2024-01-01T00:00:00.000Z',
          lastSyncAt: '2024-01-15T10:30:00.000Z',
          metadata: {}
        }
      ]);

      mockPicaService.getConnectionHealth.mockResolvedValue({
        status: 'healthy',
        lastCheck: '2024-01-15T12:00:00.000Z',
        error: undefined
      });

      const result = await caller.integrations.getHealthStatus();

      expect(result.overallStatus).toEqual(expect.stringMatching(/^(healthy|degraded|error)$/));
      expect(result.integrations).toEqual(expect.any(Array));
      expect(result.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('handles mixed health statuses correctly', async () => {
      mockPicaService.getUserConnections.mockResolvedValue([
        { id: 'conn-1', connector: 'gmail', status: 'active', connectedAt: '', lastSyncAt: '', metadata: {} },
        { id: 'conn-2', connector: 'slack', status: 'active', connectedAt: '', lastSyncAt: '', metadata: {} }
      ]);

      mockPicaService.getConnectionHealth
        .mockResolvedValueOnce({
          status: 'healthy',
          lastCheck: '2024-01-15T12:00:00.000Z'
        })
        .mockResolvedValueOnce({
          status: 'error',
          lastCheck: '2024-01-15T12:00:00.000Z',
          error: 'Authentication failed'
        });

      const result = await caller.integrations.getHealthStatus();

      expect(result.overallStatus).toBe('degraded');
      expect(result.integrations).toHaveLength(2);
      expect(result.integrations.find(i => i.connector === 'gmail')?.status).toBe('healthy');
      expect(result.integrations.find(i => i.connector === 'slack')?.status).toBe('error');
    });
  });

  describe('🔄 Error Handling and Edge Cases', () => {
    test('handles malformed input gracefully', async () => {
      await expect(
        caller.integrations.generateAuthToken(null as any)
      ).rejects.toThrow();

      await expect(
        caller.integrations.executeAction(undefined as any)
      ).rejects.toThrow();
    });

    test('handles service timeout scenarios', async () => {
      mockPicaService.getAvailableIntegrations.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service timeout')), 100)
        )
      );

      await expect(
        caller.integrations.getAvailableIntegrations()
      ).rejects.toThrow('Service timeout');
    });

    test('handles rate limiting responses', async () => {
      mockPicaService.generateAuthToken.mockRejectedValue(
        Object.assign(new Error('Rate limit exceeded'), { 
          status: 429,
          retryAfter: 60
        })
      );

      await expect(
        caller.integrations.generateAuthToken({
          integration_id: 'gmail',
          user_agent: 'test'
        })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('🔒 Security Validation', () => {
    test('requires authenticated user context', async () => {
      const unauthenticatedCaller = createCaller({
        user: null,
        session: null
      } as any);

      await expect(
        unauthenticatedCaller.integrations.getUserConnections()
      ).rejects.toThrow();
    });

    test('validates user session integrity', async () => {
      const invalidSessionCaller = createCaller({
        user: { id: 'user-1', email: 'test@example.com', name: 'Test' },
        session: { id: 'session-1', userId: 'different-user-2' }
      });

      await expect(
        invalidSessionCaller.integrations.getUserConnections()
      ).rejects.toThrow();
    });

    test('prevents SQL injection in parameters', async () => {
      const maliciousRequest = {
        connector: "gmail'; DROP TABLE users; --",
        action: 'send_email',
        data: {}
      };

      // Should be rejected by Zod validation
      await expect(
        caller.integrations.executeAction(maliciousRequest)
      ).rejects.toThrow();
    });
  });

  describe('📊 Performance Requirements', () => {
    test('endpoints respond within acceptable time limits', async () => {
      mockPicaService.getAvailableIntegrations.mockResolvedValue([]);

      const startTime = Date.now();
      await caller.integrations.getAvailableIntegrations();
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(500); // 500ms SLA
    });

    test('handles concurrent requests efficiently', async () => {
      mockPicaService.getAvailableIntegrations.mockResolvedValue([]);

      const promises = Array.from({ length: 10 }, () =>
        caller.integrations.getAvailableIntegrations()
      );

      const results = await Promise.allSettled(promises);
      const failures = results.filter(r => r.status === 'rejected');

      expect(failures.length).toBeLessThan(2); // Less than 20% failure rate
    });
  });
});