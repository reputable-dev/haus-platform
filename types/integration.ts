// Integration type definitions for Pica platform integration

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon?: string;
  connected: boolean;
  connectedAt?: Date;
  connectionId?: string;
  status: IntegrationStatus;
  features?: string[];
  popular?: boolean;
  category?: IntegrationCategory;
  actions?: IntegrationAction[];
  lastSyncAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export type IntegrationStatus = 
  | 'connected' 
  | 'disconnected' 
  | 'error' 
  | 'pending' 
  | 'syncing'
  | 'offline';

export type IntegrationCategory = 
  | 'Communication'
  | 'Productivity' 
  | 'Development'
  | 'CRM'
  | 'Finance'
  | 'E-commerce'
  | 'Storage'
  | 'Analytics'
  | 'Marketing'
  | 'Support'
  | 'Other';

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  parameters?: IntegrationParameter[];
  returnType?: string;
}

export interface IntegrationParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description?: string;
  default?: any;
}

export interface Connection {
  id: string;
  connector: string;
  status: ConnectionStatus;
  connectedAt: string;
  lastSyncAt?: string;
  metadata?: Record<string, any>;
  health?: ConnectionHealth;
}

export type ConnectionStatus = 'active' | 'inactive' | 'error';

export interface ConnectionHealth {
  status: HealthStatus;
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

export type HealthStatus = 'healthy' | 'warning' | 'error';

export interface AuthToken {
  token: string;
  expires_in: number;
  integration_id: string;
  refresh_token?: string;
}

export interface IntegrationExecutionResult {
  success: boolean;
  result: any;
  executedAt: string;
  connector: string;
  action: string;
  error?: string;
}

export interface ConnectionTestResult {
  connector: string;
  status: 'healthy' | 'error';
  latency: number | null;
  testedAt: string;
  details?: any;
  error?: string;
}

export interface IntegrationStats {
  total: number;
  connected: number;
  disconnected: number;
  errors: number;
  syncing: number;
}

export interface UsageStats {
  timeRange: 'day' | 'week' | 'month';
  connector?: string;
  data: UsageDataPoint[];
  summary: UsageStatsSummary;
  generatedAt: string;
}

export interface UsageDataPoint {
  timestamp: string;
  requests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
}

export interface UsageStatsSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
}

export interface IntegrationHealthStatus {
  integrations: IntegrationHealthInfo[];
  overallStatus: 'healthy' | 'degraded' | 'error';
  lastUpdated: string;
}

export interface IntegrationHealthInfo {
  connector: string;
  connectionId: string;
  status: HealthStatus;
  lastCheck: string;
  lastSyncAt?: string;
  error?: string | null;
  metrics?: IntegrationMetrics;
  warnings?: string[];
}

export interface IntegrationMetrics {
  uptime: number;
  averageLatency: number;
  errorRate: number;
  lastSuccessfulSync?: string;
  totalRequests: number;
  failedRequests: number;
}

// Pica-specific types
export interface PicaIntegration {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  popular?: boolean;
  features?: string[];
  actions?: IntegrationAction[];
  requirements?: string[];
}

export interface PicaConnection {
  id: string;
  connector: string;
  status: 'active' | 'inactive' | 'error';
  connectedAt: string;
  lastSyncAt?: string;
  metadata?: Record<string, any>;
}

// Authentication types
export interface AuthenticationRequest {
  integration_id: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

export interface AuthenticationResponse {
  token: string;
  expires_in: number;
  integration_id: string;
}

// Hook types
export interface UseIntegrationsReturn {
  // Data
  integrations: Integration[];
  connectedIntegrations: Integration[];
  disconnectedIntegrations: Integration[];
  popularIntegrations: Integration[];
  integrationsByCategory: Record<string, Integration[]>;
  stats: IntegrationStats;
  
  // Loading states
  isLoading: boolean;
  isLoadingHealth: boolean;
  
  // Errors
  error: Error | null;
  
  // Mutations
  generateAuthToken: any; // UseMutationResult type
  executeAction: any;
  disconnectIntegration: any;
  testConnection: any;
  
  // Helper functions
  getIntegrationById: (id: string) => Integration | undefined;
  getIntegrationsByStatus: (status: IntegrationStatus) => Integration[];
  refreshIntegrations: () => void;
  
  // Health data
  healthStatus?: IntegrationHealthStatus;
}

export interface UseIntegrationReturn {
  integration?: Integration;
  executeAction: any; // UseMutationResult type
  testConnection: () => Promise<ConnectionTestResult>;
  disconnect: () => Promise<any>;
  connect: () => Promise<AuthenticationResponse>;
  isLoading: boolean;
}

export interface UseIntegrationHealthReturn {
  healthData?: IntegrationHealthInfo[];
  isLoading: boolean;
  refreshHealth: () => void;
  hasErrors: boolean;
  errorCount: number;
}

// Component prop types
export interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
  isConnecting: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export interface IntegrationAuthModalProps {
  visible: boolean;
  onClose: () => void;
  authToken: string;
  integration: Integration;
  onSuccess: (connection: any) => void;
  onError: (error: any) => void;
}

export interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

// Error types
export class IntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public integration?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export class AuthenticationError extends IntegrationError {
  constructor(message: string, integration?: string) {
    super(message, 'AUTHENTICATION_ERROR', integration);
    this.name = 'AuthenticationError';
  }
}

export class ConnectionError extends IntegrationError {
  constructor(message: string, integration?: string) {
    super(message, 'CONNECTION_ERROR', integration);
    this.name = 'ConnectionError';
  }
}

export class ActionExecutionError extends IntegrationError {
  constructor(message: string, integration?: string, action?: string) {
    super(message, 'ACTION_EXECUTION_ERROR', integration, { action });
    this.name = 'ActionExecutionError';
  }
}

// Utility types
export type IntegrationFilter = {
  category?: IntegrationCategory;
  status?: IntegrationStatus;
  connected?: boolean;
  popular?: boolean;
  search?: string;
};

export type IntegrationSortBy = 'name' | 'category' | 'status' | 'connectedAt' | 'popularity';

export type IntegrationSortOrder = 'asc' | 'desc';

// Constants
export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  'Communication',
  'Productivity',
  'Development',
  'CRM',
  'Finance',
  'E-commerce',
  'Storage',
  'Analytics',
  'Marketing',
  'Support',
  'Other'
];

export const INTEGRATION_STATUSES: IntegrationStatus[] = [
  'connected',
  'disconnected',
  'error',
  'pending',
  'syncing',
  'offline'
];

export const POPULAR_INTEGRATIONS = [
  'gmail',
  'slack',
  'notion',
  'github',
  'salesforce',
  'stripe',
  'google-drive',
  'trello',
  'asana',
  'hubspot'
];

// Default values
export const DEFAULT_INTEGRATION: Partial<Integration> = {
  status: 'disconnected',
  connected: false,
  category: 'Other',
  popular: false,
  features: [],
  actions: []
};