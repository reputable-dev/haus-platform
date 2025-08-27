import { PicaService } from '../../backend/services/pica.service';

// Mock the Pica SDK
jest.mock('@picahq/ai', () => ({
  Pica: jest.fn().mockImplementation(() => ({
    getConnectors: jest.fn(),
    getConnectionsByUser: jest.fn(),
    executeAction: jest.fn(),
    deleteConnection: jest.fn(),
    generateSystemPrompt: jest.fn()
  }))
}));

// Mock AuthKit
jest.mock('@picahq/authkit-node', () => ({
  generateToken: jest.fn()
}));

describe('PicaService', () => {
  let picaService: PicaService;
  let mockPicaInstance: any;

  beforeEach(() => {
    // Setup environment variable
    process.env.PICA_SECRET_KEY = 'test-secret-key';
    process.env.PICA_SERVER_URL = 'https://test-api.picaos.com';

    // Clear all mocks
    jest.clearAllMocks();

    // Get the mocked Pica constructor
    const { Pica } = require('@picahq/ai');
    mockPicaInstance = {
      getConnectors: jest.fn(),
      getConnectionsByUser: jest.fn(),
      executeAction: jest.fn(),
      deleteConnection: jest.fn(),
      generateSystemPrompt: jest.fn()
    };
    
    Pica.mockImplementation(() => mockPicaInstance);

    picaService = new PicaService();
  });

  afterEach(() => {
    delete process.env.PICA_SECRET_KEY;
    delete process.env.PICA_SERVER_URL;
  });

  describe('constructor', () => {
    it('should throw error if PICA_SECRET_KEY is not provided', () => {
      delete process.env.PICA_SECRET_KEY;
      
      expect(() => new PicaService()).toThrow('PICA_SECRET_KEY environment variable is required');
    });

    it('should initialize with correct configuration', () => {
      const { Pica } = require('@picahq/ai');
      
      expect(Pica).toHaveBeenCalledWith('test-secret-key', {
        serverUrl: 'https://test-api.picaos.com',
        authkit: true,
        permissions: ['read', 'write'],
        timeout: 30000,
        retry: {
          attempts: 3,
          delay: 1000,
          backoff: 2
        }
      });
    });
  });

  describe('generateAuthToken', () => {
    it('should generate auth token successfully', async () => {
      const { generateToken } = require('@picahq/authkit-node');
      const mockToken = 'mock-jwt-token-12345';
      generateToken.mockResolvedValue(mockToken);

      const token = await picaService.generateAuthToken('user-123', { test: 'metadata' });

      expect(token).toBe(mockToken);
      expect(generateToken).toHaveBeenCalledWith({
        identity: {
          type: 'user',
          value: 'user-123',
          metadata: expect.objectContaining({
            test: 'metadata',
            generated_at: expect.any(String),
            platform: 'haus-platform'
          })
        },
        expiresIn: 3600
      });
    });

    it('should handle auth token generation errors', async () => {
      const { generateToken } = require('@picahq/authkit-node');
      generateToken.mockRejectedValue(new Error('Token generation failed'));

      await expect(picaService.generateAuthToken('user-123'))
        .rejects
        .toThrow('Failed to generate authentication token: Token generation failed');
    });
  });

  describe('getAvailableIntegrations', () => {
    it('should fetch and transform available integrations', async () => {
      const mockConnectors = [
        {
          id: 'gmail',
          name: 'Gmail',
          description: 'Connect your Gmail account',
          icon: 'https://example.com/gmail.png',
          features: ['Send emails', 'Read emails'],
          actions: [{ id: 'send_email', name: 'Send Email' }]
        },
        {
          id: 'slack',
          display_name: 'Slack Workspace',
          logo_url: 'https://example.com/slack.png'
        }
      ];

      mockPicaInstance.getConnectors.mockResolvedValue(mockConnectors);

      const integrations = await picaService.getAvailableIntegrations();

      expect(integrations).toHaveLength(2);
      
      expect(integrations[0]).toEqual({
        id: 'gmail',
        name: 'Gmail',
        description: 'Connect your Gmail account',
        icon: 'https://example.com/gmail.png',
        category: 'Communication',
        popular: true,
        features: ['Send emails', 'Read emails'],
        actions: [{ id: 'send_email', name: 'Send Email' }],
        requirements: []
      });

      expect(integrations[1]).toEqual({
        id: 'slack',
        name: 'Slack Workspace',
        description: 'Connect your Slack Workspace account',
        icon: 'https://example.com/slack.png',
        category: 'Communication',
        popular: true,
        features: ['Send messages', 'Create channels', 'Manage users'],
        actions: [],
        requirements: []
      });
    });

    it('should handle fetch integrations errors', async () => {
      mockPicaInstance.getConnectors.mockRejectedValue(new Error('API Error'));

      await expect(picaService.getAvailableIntegrations())
        .rejects
        .toThrow('Failed to fetch available integrations: API Error');
    });
  });

  describe('getUserConnections', () => {
    it('should fetch and transform user connections', async () => {
      const mockConnections = [
        {
          id: 'conn-1',
          connector_id: 'gmail',
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          last_sync_at: '2024-01-15T10:30:00.000Z',
          metadata: { email: 'user@example.com' }
        },
        {
          id: 'conn-2',
          connector: 'slack',
          status: 'connected',
          connected_at: '2024-01-02T00:00:00.000Z'
        }
      ];

      mockPicaInstance.getConnectionsByUser.mockResolvedValue(mockConnections);

      const connections = await picaService.getUserConnections('user-123');

      expect(connections).toHaveLength(2);
      
      expect(connections[0]).toEqual({
        id: 'conn-1',
        connector: 'gmail',
        status: 'active',
        connectedAt: '2024-01-01T00:00:00.000Z',
        lastSyncAt: '2024-01-15T10:30:00.000Z',
        metadata: { email: 'user@example.com' }
      });

      expect(connections[1]).toEqual({
        id: 'conn-2',
        connector: 'slack',
        status: 'active',
        connectedAt: '2024-01-02T00:00:00.000Z',
        lastSyncAt: undefined,
        metadata: {}
      });
    });

    it('should handle fetch connections errors', async () => {
      mockPicaInstance.getConnectionsByUser.mockRejectedValue(new Error('User not found'));

      await expect(picaService.getUserConnections('user-123'))
        .rejects
        .toThrow('Failed to fetch user connections: User not found');
    });
  });

  describe('executeAction', () => {
    it('should execute integration action successfully', async () => {
      const mockResult = { 
        success: true, 
        data: { message: 'Email sent successfully' }
      };
      
      mockPicaInstance.executeAction.mockResolvedValue(mockResult);

      const result = await picaService.executeAction(
        'user-123',
        'gmail',
        'send_email',
        { to: 'test@example.com', subject: 'Test' }
      );

      expect(result).toBe(mockResult);
      expect(mockPicaInstance.executeAction).toHaveBeenCalledWith({
        userId: 'user-123',
        connector: 'gmail',
        action: 'send_email',
        data: expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test',
          executed_by: 'haus-platform',
          executed_at: expect.any(String)
        })
      });
    });

    it('should handle execute action errors', async () => {
      mockPicaInstance.executeAction.mockRejectedValue(new Error('Action failed'));

      await expect(picaService.executeAction('user-123', 'gmail', 'send_email', {}))
        .rejects
        .toThrow('Failed to execute action \'send_email\' on gmail: Action failed');
    });
  });

  describe('disconnectIntegration', () => {
    it('should disconnect integration successfully', async () => {
      mockPicaInstance.deleteConnection.mockResolvedValue(undefined);

      await picaService.disconnectIntegration('user-123', 'conn-1');

      expect(mockPicaInstance.deleteConnection).toHaveBeenCalledWith({
        userId: 'user-123',
        connectionId: 'conn-1'
      });
    });

    it('should handle disconnect errors', async () => {
      mockPicaInstance.deleteConnection.mockRejectedValue(new Error('Connection not found'));

      await expect(picaService.disconnectIntegration('user-123', 'conn-1'))
        .rejects
        .toThrow('Failed to disconnect integration: Connection not found');
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const mockResult = { success: true };
      mockPicaInstance.executeAction.mockResolvedValue(mockResult);

      const result = await picaService.testConnection('user-123', 'gmail');

      expect(result.status).toBe('healthy');
      expect(result.latency).toBeGreaterThan(0);
      expect(result.details).toBe(mockResult);

      expect(mockPicaInstance.executeAction).toHaveBeenCalledWith({
        userId: 'user-123',
        connector: 'gmail',
        action: 'test_connection',
        data: { test: true }
      });
    });

    it('should handle test connection errors', async () => {
      mockPicaInstance.executeAction.mockRejectedValue(new Error('Connection failed'));

      const result = await picaService.testConnection('user-123', 'gmail');

      expect(result.status).toBe('error');
      expect(result.latency).toBe(null);
      expect(result.details).toEqual({ error: 'Connection failed' });
    });
  });

  describe('getConnectionHealth', () => {
    it('should get connection health successfully', async () => {
      const mockResult = { success: true };
      mockPicaInstance.executeAction.mockResolvedValue(mockResult);

      const health = await picaService.getConnectionHealth('user-123', 'gmail');

      expect(health.status).toBe('healthy');
      expect(health.lastCheck).toBeDefined();
      expect(health.error).toBeUndefined();
    });

    it('should handle health check errors', async () => {
      mockPicaInstance.executeAction.mockRejectedValue(new Error('Health check failed'));

      const health = await picaService.getConnectionHealth('user-123', 'gmail');

      expect(health.status).toBe('error');
      expect(health.lastCheck).toBeDefined();
      expect(health.error).toBe('Health check failed');
    });
  });

  describe('getDetailedConnectionHealth', () => {
    it('should get detailed health with metrics', async () => {
      const mockResult = { success: true };
      mockPicaInstance.executeAction.mockResolvedValue(mockResult);

      const health = await picaService.getDetailedConnectionHealth('user-123', 'gmail');

      expect(health.status).toBe('healthy');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.averageLatency).toBeGreaterThan(0);
      expect(health.errorRate).toBeGreaterThanOrEqual(0);
      expect(health.totalRequests).toBeGreaterThanOrEqual(0);
      expect(health.failedRequests).toBeGreaterThanOrEqual(0);
      expect(health.warnings).toEqual([]);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics for different time ranges', async () => {
      const stats = await picaService.getUsageStats('user-123', 'gmail', 'week');

      expect(stats.data).toHaveLength(7); // 7 days for week
      expect(stats.summary).toBeDefined();
      expect(stats.summary?.totalRequests).toBeGreaterThanOrEqual(0);
      expect(stats.summary?.successfulRequests).toBeGreaterThanOrEqual(0);
      expect(stats.summary?.failedRequests).toBeGreaterThanOrEqual(0);
      expect(stats.summary?.averageLatency).toBeGreaterThan(0);

      stats.data.forEach(dataPoint => {
        expect(dataPoint.timestamp).toBeDefined();
        expect(dataPoint.requests).toBeGreaterThanOrEqual(0);
        expect(dataPoint.successfulRequests).toBeGreaterThanOrEqual(0);
        expect(dataPoint.failedRequests).toBeGreaterThanOrEqual(0);
        expect(dataPoint.averageLatency).toBeGreaterThan(0);
      });
    });

    it('should return correct number of data points for different time ranges', async () => {
      const dayStats = await picaService.getUsageStats('user-123', 'gmail', 'day');
      expect(dayStats.data).toHaveLength(24); // 24 hours

      const weekStats = await picaService.getUsageStats('user-123', 'gmail', 'week');
      expect(weekStats.data).toHaveLength(7); // 7 days

      const monthStats = await picaService.getUsageStats('user-123', 'gmail', 'month');
      expect(monthStats.data).toHaveLength(30); // 30 days
    });
  });

  describe('generateSystemPrompt', () => {
    it('should generate system prompt successfully', async () => {
      const mockPrompt = 'You have access to Gmail and Slack integrations...';
      mockPicaInstance.generateSystemPrompt.mockResolvedValue(mockPrompt);

      const prompt = await picaService.generateSystemPrompt('user-123');

      expect(prompt).toBe(mockPrompt);
      expect(mockPicaInstance.generateSystemPrompt).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('should handle system prompt generation errors', async () => {
      mockPicaInstance.generateSystemPrompt.mockRejectedValue(new Error('Prompt generation failed'));

      await expect(picaService.generateSystemPrompt('user-123'))
        .rejects
        .toThrow('Failed to generate system prompt: Prompt generation failed');
    });
  });

  describe('helper methods', () => {
    it('should categorize connectors correctly', async () => {
      const mockConnectors = [
        { id: 'gmail', name: 'Gmail' },
        { id: 'slack', name: 'Slack' },
        { id: 'notion', name: 'Notion' },
        { id: 'github', name: 'GitHub' },
        { id: 'unknown-service', name: 'Unknown Service' }
      ];

      mockPicaInstance.getConnectors.mockResolvedValue(mockConnectors);

      const integrations = await picaService.getAvailableIntegrations();

      expect(integrations.find(i => i.id === 'gmail')?.category).toBe('Communication');
      expect(integrations.find(i => i.id === 'slack')?.category).toBe('Communication');
      expect(integrations.find(i => i.id === 'notion')?.category).toBe('Productivity');
      expect(integrations.find(i => i.id === 'github')?.category).toBe('Development');
      expect(integrations.find(i => i.id === 'unknown-service')?.category).toBe('Other');
    });

    it('should identify popular connectors correctly', async () => {
      const mockConnectors = [
        { id: 'gmail', name: 'Gmail' },
        { id: 'unknown-service', name: 'Unknown Service' }
      ];

      mockPicaInstance.getConnectors.mockResolvedValue(mockConnectors);

      const integrations = await picaService.getAvailableIntegrations();

      expect(integrations.find(i => i.id === 'gmail')?.popular).toBe(true);
      expect(integrations.find(i => i.id === 'unknown-service')?.popular).toBe(false);
    });

    it('should normalize connection statuses correctly', async () => {
      const mockConnections = [
        { id: '1', connector: 'test1', status: 'active' },
        { id: '2', connector: 'test2', status: 'connected' },
        { id: '3', connector: 'test3', status: 'enabled' },
        { id: '4', connector: 'test4', status: 'error' },
        { id: '5', connector: 'test5', status: 'failed' },
        { id: '6', connector: 'test6', status: 'unauthorized' },
        { id: '7', connector: 'test7', status: 'inactive' },
        { id: '8', connector: 'test8', status: 'unknown' },
        { id: '9', connector: 'test9', status: null }
      ];

      mockPicaInstance.getConnectionsByUser.mockResolvedValue(mockConnections);

      const connections = await picaService.getUserConnections('user-123');

      expect(connections.find(c => c.id === '1')?.status).toBe('active');
      expect(connections.find(c => c.id === '2')?.status).toBe('active');
      expect(connections.find(c => c.id === '3')?.status).toBe('active');
      expect(connections.find(c => c.id === '4')?.status).toBe('error');
      expect(connections.find(c => c.id === '5')?.status).toBe('error');
      expect(connections.find(c => c.id === '6')?.status).toBe('error');
      expect(connections.find(c => c.id === '7')?.status).toBe('inactive');
      expect(connections.find(c => c.id === '8')?.status).toBe('inactive');
      expect(connections.find(c => c.id === '9')?.status).toBe('inactive');
    });
  });
});