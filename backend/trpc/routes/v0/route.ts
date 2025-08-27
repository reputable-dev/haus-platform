import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../../create-context";
import { V0Service } from "../../../services/v0.service";

// Initialize V0 service
const v0Service = new V0Service();

// Validation schemas
const generateSchema = z.object({
  prompt: z.string().min(1).max(4000),
  model: z.string().optional(),
  stream: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
});

const componentSchema = z.object({
  description: z.string().min(1).max(2000),
  componentType: z.enum(['react', 'vue', 'svelte']).optional(),
  framework: z.enum(['nextjs', 'vite', 'remix']).optional(),
  styling: z.enum(['tailwind', 'css-modules', 'styled-components']).optional(),
  typescript: z.boolean().optional(),
});

const designSchema = z.object({
  prompt: z.string().min(1).max(2000),
  designType: z.enum(['ui', 'landing', 'dashboard', 'mobile']).optional(),
  style: z.enum(['modern', 'minimal', 'corporate', 'creative']).optional(),
  colorScheme: z.enum(['light', 'dark', 'auto']).optional(),
  responsive: z.boolean().optional(),
});

const historySchema = z.object({
  userId: z.string().min(1),
  limit: z.number().min(1).max(100).optional(),
});

export const v0Router = createTRPCRouter({
  /**
   * Generate AI content using v0
   */
  generate: publicProcedure
    .input(generateSchema)
    .mutation(async ({ input }) => {
      try {
        return await v0Service.generate(input);
      } catch (error) {
        throw new Error(`Failed to generate content: ${error.message}`);
      }
    }),

  /**
   * Generate React/Vue/Svelte components
   */
  generateComponent: publicProcedure
    .input(componentSchema)
    .mutation(async ({ input }) => {
      try {
        return await v0Service.generateComponent(input);
      } catch (error) {
        throw new Error(`Failed to generate component: ${error.message}`);
      }
    }),

  /**
   * Generate complete UI designs
   */
  generateDesign: publicProcedure
    .input(designSchema)
    .mutation(async ({ input }) => {
      try {
        return await v0Service.generateDesign(input);
      } catch (error) {
        throw new Error(`Failed to generate design: ${error.message}`);
      }
    }),

  /**
   * Get generation history for a user
   */
  getHistory: publicProcedure
    .input(historySchema)
    .query(async ({ input }) => {
      try {
        return await v0Service.getGenerationHistory(input.userId, input.limit);
      } catch (error) {
        throw new Error(`Failed to get generation history: ${error.message}`);
      }
    }),

  /**
   * Validate API connection
   */
  validateConnection: publicProcedure
    .query(async () => {
      try {
        return await v0Service.validateConnection();
      } catch (error) {
        throw new Error(`Failed to validate connection: ${error.message}`);
      }
    }),

  /**
   * Get available models
   */
  getModels: publicProcedure
    .query(async () => {
      try {
        return await v0Service.getAvailableModels();
      } catch (error) {
        throw new Error(`Failed to get available models: ${error.message}`);
      }
    }),

  /**
   * Health check for v0 service
   */
  healthCheck: publicProcedure
    .query(async () => {
      try {
        const connection = await v0Service.validateConnection();
        const models = await v0Service.getAvailableModels();
        
        return {
          status: connection.status === 'connected' ? 'healthy' : 'unhealthy',
          connection: connection.status,
          version: connection.version,
          modelsAvailable: models.length,
          rateLimit: connection.rateLimit,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          connection: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }),

  /**
   * Get service configuration
   */
  getConfig: publicProcedure
    .query(() => {
      return {
        hasApiKey: !!process.env.V0_API_KEY,
        baseUrl: process.env.V0_API_BASE_URL || 'https://api.v0.dev',
        supportedComponentTypes: ['react', 'vue', 'svelte'],
        supportedFrameworks: ['nextjs', 'vite', 'remix'],
        supportedStyling: ['tailwind', 'css-modules', 'styled-components'],
        supportedDesignTypes: ['ui', 'landing', 'dashboard', 'mobile'],
        supportedStyles: ['modern', 'minimal', 'corporate', 'creative'],
        supportedColorSchemes: ['light', 'dark', 'auto']
      };
    })
});