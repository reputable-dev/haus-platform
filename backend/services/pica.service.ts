import { Pica } from "@picahq/ai";
import { generateToken } from "@picahq/authkit-node";

interface PicaIntegration {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  popular?: boolean;
  features?: string[];
  actions?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  requirements?: string[];
}

interface PicaConnection {
  id: string;
  connector: string;
  status: 'active' | 'inactive' | 'error';
  connectedAt: string;
  lastSyncAt?: string;
  metadata?: Record<string, any>;
}

interface ConnectionHealth {
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  lastSyncAt?: string;
  error?: string;
  uptime?: number;
  averageLatency?: number;
  errorRate?: number;
  lastSuccessfulSync?: string;
  totalRequests?: number;
  failedRequests?: number;
  warnings?: string[];
}

interface UsageStats {
  data: Array<{
    timestamp: string;
    requests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
  }>;
  summary?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
  };
}

export class PicaService {
  private pica: Pica;
  
  constructor() {
    if (!process.env.PICA_SECRET_KEY) {
      throw new Error('PICA_SECRET_KEY environment variable is required');
    }

    this.pica = new Pica(process.env.PICA_SECRET_KEY, {
      serverUrl: process.env.PICA_SERVER_URL || 'https://api.picaos.com',
      authkit: true,
      permissions: ['read', 'write'],
      timeout: 30000, // 30 seconds
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 2
      }
    });
  }

  /**
   * Generate AuthKit token for user authentication
   */
  async generateAuthToken(
    userId: string, 
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const token = await generateToken({
        identity: {
          type: "user",
          value: userId,
          metadata: {
            ...metadata,
            generated_at: new Date().toISOString(),
            platform: 'haus-platform'
          }
        },
        // Token expires in 1 hour
        expiresIn: 3600
      });

      return token;
    } catch (error) {
      console.error('Pica generateAuthToken error:', error);
      throw new Error(`Failed to generate authentication token: ${error.message}`);
    }
  }

  /**
   * Get all available integrations from Pica
   */
  async getAvailableIntegrations(): Promise<PicaIntegration[]> {
    try {
      const connectors = await this.pica.getConnectors();
      
      // Transform Pica connector format to our integration format
      return connectors.map((connector: any) => ({
        id: connector.id,
        name: connector.name || connector.display_name || connector.id,
        description: connector.description || `Connect your ${connector.name || connector.id} account`,
        icon: connector.icon || connector.logo_url,
        category: this.categorizeConnector(connector.id),
        popular: this.isPopularConnector(connector.id),
        features: connector.features || this.getConnectorFeatures(connector.id),
        actions: connector.actions || [],
        requirements: connector.requirements || []
      }));
    } catch (error) {
      console.error('Pica getAvailableIntegrations error:', error);
      throw new Error(`Failed to fetch available integrations: ${error.message}`);
    }
  }

  /**
   * Get user's connected integrations
   */
  async getUserConnections(userId: string): Promise<PicaConnection[]> {
    try {
      const connections = await this.pica.getConnectionsByUser(userId);
      
      return connections.map((connection: any) => ({
        id: connection.id,
        connector: connection.connector || connection.connector_id,
        status: this.normalizeConnectionStatus(connection.status),
        connectedAt: connection.created_at || connection.connected_at || new Date().toISOString(),
        lastSyncAt: connection.last_sync_at,
        metadata: connection.metadata || {}
      }));
    } catch (error) {
      console.error('Pica getUserConnections error:', error);
      throw new Error(`Failed to fetch user connections: ${error.message}`);
    }
  }

  /**
   * Execute an action on a connected integration
   */
  async executeAction(
    userId: string,
    connector: string,
    action: string,
    data: any
  ): Promise<any> {
    try {
      const result = await this.pica.executeAction({
        userId,
        connector,
        action,
        data: {
          ...data,
          executed_by: 'haus-platform',
          executed_at: new Date().toISOString()
        }
      });

      return result;
    } catch (error) {
      console.error('Pica executeAction error:', error);
      throw new Error(`Failed to execute action '${action}' on ${connector}: ${error.message}`);
    }
  }

  /**
   * Disconnect an integration
   */
  async disconnectIntegration(userId: string, connectionId: string): Promise<void> {
    try {
      await this.pica.deleteConnection({
        userId,
        connectionId
      });
    } catch (error) {
      console.error('Pica disconnectIntegration error:', error);
      throw new Error(`Failed to disconnect integration: ${error.message}`);
    }
  }

  /**
   * Test connection health
   */
  async testConnection(userId: string, connector: string): Promise<{
    status: 'healthy' | 'error';
    latency: number | null;
    details?: any;
  }> {
    try {
      const startTime = Date.now();
      
      // Execute a lightweight test action
      const result = await this.pica.executeAction({
        userId,
        connector,
        action: 'test_connection',
        data: { test: true }
      });

      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        latency,
        details: result
      };
    } catch (error) {
      console.error('Pica testConnection error:', error);
      return {
        status: 'error',
        latency: null,
        details: { error: error.message }
      };
    }
  }

  /**
   * Get connection health information
   */
  async getConnectionHealth(userId: string, connector: string): Promise<ConnectionHealth> {
    try {
      // This would typically call a Pica health endpoint
      // For now, we'll simulate with a test connection
      const testResult = await this.testConnection(userId, connector);
      
      return {
        status: testResult.status === 'healthy' ? 'healthy' : 'error',
        lastCheck: new Date().toISOString(),
        error: testResult.status === 'error' ? 'Connection test failed' : undefined
      };
    } catch (error) {
      console.error('Pica getConnectionHealth error:', error);
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Get detailed connection health with metrics
   */
  async getDetailedConnectionHealth(userId: string, connector: string): Promise<ConnectionHealth> {
    try {
      // This would call Pica's detailed health/metrics endpoint
      // For now, we'll return basic health info with simulated metrics
      const basicHealth = await this.getConnectionHealth(userId, connector);
      
      return {
        ...basicHealth,
        uptime: Math.random() * 100, // Simulated uptime percentage
        averageLatency: 150 + Math.random() * 100, // Simulated latency
        errorRate: Math.random() * 0.05, // Simulated error rate (0-5%)
        totalRequests: Math.floor(Math.random() * 1000) + 100,
        failedRequests: Math.floor(Math.random() * 10),
        warnings: []
      };
    } catch (error) {
      console.error('Pica getDetailedConnectionHealth error:', error);
      return {
        status: 'error',
        lastCheck: new Date().toISOString(),
        error: error.message,
        uptime: 0,
        averageLatency: 0,
        errorRate: 1,
        totalRequests: 0,
        failedRequests: 0,
        warnings: []
      };
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    userId: string,
    connector?: string,
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<UsageStats> {
    try {
      // This would call Pica's usage/analytics endpoint
      // For now, we'll return simulated data
      const now = new Date();
      const data: UsageStats['data'] = [];
      
      const periods = timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
      const increment = timeRange === 'day' ? 'hour' : 'day';
      
      for (let i = periods - 1; i >= 0; i--) {
        const timestamp = new Date(now);
        if (increment === 'hour') {
          timestamp.setHours(timestamp.getHours() - i);
        } else {
          timestamp.setDate(timestamp.getDate() - i);
        }
        
        const requests = Math.floor(Math.random() * 50) + 10;
        const failedRequests = Math.floor(requests * (Math.random() * 0.1));
        
        data.push({
          timestamp: timestamp.toISOString(),
          requests,
          successfulRequests: requests - failedRequests,
          failedRequests,
          averageLatency: 100 + Math.random() * 200
        });
      }

      const summary = {
        totalRequests: data.reduce((sum, d) => sum + d.requests, 0),
        successfulRequests: data.reduce((sum, d) => sum + d.successfulRequests, 0),
        failedRequests: data.reduce((sum, d) => sum + d.failedRequests, 0),
        averageLatency: data.reduce((sum, d) => sum + d.averageLatency, 0) / data.length
      };

      return { data, summary };
    } catch (error) {
      console.error('Pica getUsageStats error:', error);
      throw new Error(`Failed to get usage statistics: ${error.message}`);
    }
  }

  /**
   * Generate AI system prompt with user's available tools
   */
  async generateSystemPrompt(userId?: string): Promise<string> {
    try {
      return await this.pica.generateSystemPrompt({ userId });
    } catch (error) {
      console.error('Pica generateSystemPrompt error:', error);
      throw new Error(`Failed to generate system prompt: ${error.message}`);
    }
  }

  // Helper methods
  private categorizeConnector(connectorId: string): string {
    const categoryMap: Record<string, string> = {
      'gmail': 'Communication',
      'slack': 'Communication',
      'discord': 'Communication',
      'notion': 'Productivity',
      'airtable': 'Productivity',
      'trello': 'Productivity',
      'asana': 'Productivity',
      'github': 'Development',
      'gitlab': 'Development',
      'bitbucket': 'Development',
      'salesforce': 'CRM',
      'hubspot': 'CRM',
      'intercom': 'Support',
      'zendesk': 'Support',
      'stripe': 'Finance',
      'quickbooks': 'Finance',
      'xero': 'Finance',
      'shopify': 'E-commerce',
      'woocommerce': 'E-commerce',
      'google-drive': 'Storage',
      'dropbox': 'Storage',
      'onedrive': 'Storage'
    };

    return categoryMap[connectorId] || 'Other';
  }

  private isPopularConnector(connectorId: string): boolean {
    const popularConnectors = [
      'gmail', 'slack', 'notion', 'github', 'salesforce', 
      'stripe', 'google-drive', 'trello', 'asana', 'hubspot'
    ];
    
    return popularConnectors.includes(connectorId);
  }

  private getConnectorFeatures(connectorId: string): string[] {
    const featureMap: Record<string, string[]> = {
      'gmail': ['Send emails', 'Read emails', 'Manage labels'],
      'slack': ['Send messages', 'Create channels', 'Manage users'],
      'notion': ['Create pages', 'Update databases', 'Search content'],
      'github': ['Create issues', 'Manage repositories', 'Review pull requests'],
      'salesforce': ['Manage leads', 'Update opportunities', 'Create reports'],
      'stripe': ['Process payments', 'Manage customers', 'Create invoices'],
      'google-drive': ['Upload files', 'Share documents', 'Manage folders'],
      'trello': ['Create cards', 'Manage boards', 'Update lists'],
      'asana': ['Create tasks', 'Manage projects', 'Track progress'],
      'hubspot': ['Manage contacts', 'Track deals', 'Send emails']
    };

    return featureMap[connectorId] || ['Read data', 'Write data', 'Sync information'];
  }

  private normalizeConnectionStatus(status: any): 'active' | 'inactive' | 'error' {
    if (!status) return 'inactive';
    
    const normalizedStatus = status.toString().toLowerCase();
    
    if (['active', 'connected', 'enabled', 'online'].includes(normalizedStatus)) {
      return 'active';
    }
    
    if (['error', 'failed', 'broken', 'unauthorized'].includes(normalizedStatus)) {
      return 'error';
    }
    
    return 'inactive';
  }
}