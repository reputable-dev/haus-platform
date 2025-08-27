import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../../create-context';
import { PicaService } from '../../../services/pica.service';
import { TRPCError } from '@trpc/server';

const picaService = new PicaService();

// Input validation schemas
const IntegrationActionSchema = z.object({
  connector: z.string().min(1, 'Connector is required'),
  action: z.string().min(1, 'Action is required'),
  data: z.record(z.any()).optional().default({})
});

const ConnectionIdSchema = z.object({
  connectionId: z.string().min(1, 'Connection ID is required')
});

const AuthTokenSchema = z.object({
  integration_id: z.string().min(1, 'Integration ID is required'),
  user_agent: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const TestConnectionSchema = z.object({
  connector: z.string().min(1, 'Connector is required')
});

export const integrationsRouter = router({
  // Generate authentication token for Pica AuthKit
  generateAuthToken: protectedProcedure
    .input(AuthTokenSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const token = await picaService.generateAuthToken(
          ctx.user.id,
          {
            ...input.metadata,
            integration_id: input.integration_id,
            user_agent: input.user_agent || 'haus-platform',
            timestamp: new Date().toISOString()
          }
        );

        return { 
          token,
          expires_in: 3600, // 1 hour
          integration_id: input.integration_id
        };
      } catch (error) {
        console.error('Failed to generate auth token:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate authentication token'
        });
      }
    }),

  // Get all available integrations from Pica
  getAvailableIntegrations: publicProcedure
    .query(async () => {
      try {
        const integrations = await picaService.getAvailableIntegrations();
        
        // Transform Pica integrations to our format
        return integrations.map(integration => ({
          id: integration.id,
          name: integration.name,
          description: integration.description,
          icon: integration.icon,
          category: integration.category || 'Other',
          popular: integration.popular || false,
          features: integration.features || [],
          actions: integration.actions || [],
          requirements: integration.requirements || []
        }));
      } catch (error) {
        console.error('Failed to fetch available integrations:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch available integrations'
        });
      }
    }),

  // Get user's connected integrations
  getUserConnections: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const connections = await picaService.getUserConnections(ctx.user.id);
        
        return connections.map(connection => ({
          id: connection.id,
          connector: connection.connector,
          status: connection.status,
          connectedAt: connection.connectedAt,
          lastSyncAt: connection.lastSyncAt,
          metadata: connection.metadata || {}
        }));
      } catch (error) {
        console.error('Failed to fetch user connections:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch your integrations'
        });
      }
    }),

  // Execute an action on a connected integration
  executeAction: protectedProcedure
    .input(IntegrationActionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify user has access to this connector
        const connections = await picaService.getUserConnections(ctx.user.id);
        const connection = connections.find(conn => 
          conn.connector === input.connector && conn.status === 'active'
        );

        if (!connection) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have an active connection to this integration'
          });
        }

        const result = await picaService.executeAction(
          ctx.user.id,
          input.connector,
          input.action,
          input.data
        );

        return {
          success: true,
          result,
          executedAt: new Date().toISOString(),
          connector: input.connector,
          action: input.action
        };
      } catch (error) {
        console.error('Failed to execute integration action:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute integration action'
        });
      }
    }),

  // Disconnect an integration
  disconnectIntegration: protectedProcedure
    .input(ConnectionIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify user owns this connection
        const connections = await picaService.getUserConnections(ctx.user.id);
        const connection = connections.find(conn => conn.id === input.connectionId);

        if (!connection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Connection not found'
          });
        }

        await picaService.disconnectIntegration(ctx.user.id, input.connectionId);

        return {
          success: true,
          disconnectedAt: new Date().toISOString(),
          connectionId: input.connectionId,
          connector: connection.connector
        };
      } catch (error) {
        console.error('Failed to disconnect integration:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disconnect integration'
        });
      }
    }),

  // Test connection health for a specific integration
  testConnection: protectedProcedure
    .input(TestConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify user has access to this connector
        const connections = await picaService.getUserConnections(ctx.user.id);
        const connection = connections.find(conn => 
          conn.connector === input.connector && conn.status === 'active'
        );

        if (!connection) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'No active connection found for this integration'
          });
        }

        const testResult = await picaService.testConnection(
          ctx.user.id, 
          input.connector
        );

        return {
          connector: input.connector,
          status: testResult.status,
          latency: testResult.latency,
          testedAt: new Date().toISOString(),
          details: testResult.details || {}
        };
      } catch (error) {
        console.error('Failed to test connection:', error);
        
        if (error instanceof TRPCError) {
          throw error;
        }

        return {
          connector: input.connector,
          status: 'error',
          latency: null,
          testedAt: new Date().toISOString(),
          error: error.message || 'Connection test failed'
        };
      }
    }),

  // Get health status for all user connections
  getHealthStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const connections = await picaService.getUserConnections(ctx.user.id);
        const healthData = await Promise.all(
          connections
            .filter(conn => conn.status === 'active')
            .map(async (connection) => {
              try {
                const health = await picaService.getConnectionHealth(
                  ctx.user.id, 
                  connection.connector
                );
                return {
                  connector: connection.connector,
                  connectionId: connection.id,
                  status: health.status,
                  lastCheck: health.lastCheck,
                  lastSyncAt: health.lastSyncAt,
                  error: health.error || null
                };
              } catch (error) {
                return {
                  connector: connection.connector,
                  connectionId: connection.id,
                  status: 'error',
                  lastCheck: new Date().toISOString(),
                  error: error.message || 'Health check failed'
                };
              }
            })
        );

        return {
          integrations: healthData,
          overallStatus: healthData.every(h => h.status === 'healthy') ? 'healthy' : 
                        healthData.some(h => h.status === 'error') ? 'degraded' : 'healthy',
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to get health status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get integration health status'
        });
      }
    }),

  // Get detailed health status with metrics
  getDetailedHealthStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const connections = await picaService.getUserConnections(ctx.user.id);
        const detailedHealth = await Promise.all(
          connections.map(async (connection) => {
            try {
              const health = await picaService.getDetailedConnectionHealth(
                ctx.user.id,
                connection.connector
              );

              return {
                connector: connection.connector,
                connectionId: connection.id,
                status: health.status,
                metrics: {
                  uptime: health.uptime || 0,
                  averageLatency: health.averageLatency || 0,
                  errorRate: health.errorRate || 0,
                  lastSuccessfulSync: health.lastSuccessfulSync,
                  totalRequests: health.totalRequests || 0,
                  failedRequests: health.failedRequests || 0
                },
                lastCheck: health.lastCheck,
                error: health.error || null,
                warnings: health.warnings || []
              };
            } catch (error) {
              return {
                connector: connection.connector,
                connectionId: connection.id,
                status: 'error',
                metrics: {
                  uptime: 0,
                  averageLatency: 0,
                  errorRate: 1,
                  totalRequests: 0,
                  failedRequests: 0
                },
                lastCheck: new Date().toISOString(),
                error: error.message || 'Detailed health check failed',
                warnings: []
              };
            }
          })
        );

        return detailedHealth;
      } catch (error) {
        console.error('Failed to get detailed health status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get detailed health status'
        });
      }
    }),

  // Get integration usage statistics
  getUsageStats: protectedProcedure
    .input(z.object({
      connector: z.string().optional(),
      timeRange: z.enum(['day', 'week', 'month']).default('week')
    }))
    .query(async ({ ctx, input }) => {
      try {
        const stats = await picaService.getUsageStats(
          ctx.user.id,
          input.connector,
          input.timeRange
        );

        return {
          timeRange: input.timeRange,
          connector: input.connector,
          data: stats.data || [],
          summary: {
            totalRequests: stats.summary?.totalRequests || 0,
            successfulRequests: stats.summary?.successfulRequests || 0,
            failedRequests: stats.summary?.failedRequests || 0,
            averageLatency: stats.summary?.averageLatency || 0
          },
          generatedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to get usage stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get usage statistics'
        });
      }
    })
});