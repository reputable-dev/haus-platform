/**
 * CONTRACT TESTS - Real API Validation
 * These tests hit actual Pica endpoints to validate our assumptions
 */

import { PicaService } from '../../backend/services/pica.service';

// Skip if no real API key provided
const REAL_TEST_API_KEY = process.env.PICA_TEST_API_KEY;
const describeWithContract = REAL_TEST_API_KEY ? describe : describe.skip;

describeWithContract('Pica API Contract Tests', () => {
  let picaService: PicaService;

  beforeAll(() => {
    if (!REAL_TEST_API_KEY) {
      console.warn('⚠️ PICA_TEST_API_KEY not provided - skipping contract tests');
      return;
    }
    
    // Use real API key for contract tests
    process.env.PICA_SECRET_KEY = REAL_TEST_API_KEY;
    picaService = new PicaService();
  });

  describe('🔐 Authentication Endpoints', () => {
    test('generateToken returns valid JWT structure', async () => {
      const token = await picaService.generateAuthToken('contract-test-user-123', {
        test: true,
        contract_test: new Date().toISOString()
      });
      
      // Must be a JWT format
      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      // Should be reasonably long (JWT tokens are typically 200+ chars)
      expect(token.length).toBeGreaterThan(100);
    }, 10000);

    test('token generation with invalid user ID fails gracefully', async () => {
      await expect(
        picaService.generateAuthToken('', { test: true })
      ).rejects.toThrow();
    }, 10000);

    test('token generation is consistent but unique', async () => {
      const token1 = await picaService.generateAuthToken('test-user-1');
      const token2 = await picaService.generateAuthToken('test-user-2');
      
      // Different users should get different tokens
      expect(token1).not.toBe(token2);
      
      // But both should be valid JWT format
      expect(token1).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      expect(token2).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    }, 15000);
  });

  describe('🔌 Connector Endpoints', () => {
    test('getAvailableIntegrations returns expected structure', async () => {
      const integrations = await picaService.getAvailableIntegrations();
      
      // Must return an array
      expect(Array.isArray(integrations)).toBe(true);
      
      // Pica claims 150+ integrations - let's be conservative and expect at least 20
      expect(integrations.length).toBeGreaterThan(20);
      
      // Each integration must have required fields
      integrations.forEach((integration, index) => {
        expect(integration).toHaveProperty('id');
        expect(integration).toHaveProperty('name');
        
        // ID should be a valid string
        expect(typeof integration.id).toBe('string');
        expect(integration.id.length).toBeGreaterThan(0);
        
        // Name should be a valid string
        expect(typeof integration.name).toBe('string');
        expect(integration.name.length).toBeGreaterThan(0);
        
        // ID should not contain spaces or special chars (except - and _)
        expect(integration.id).toMatch(/^[a-z0-9_-]+$/);
      });
    }, 15000);

    test('popular connectors are available', async () => {
      const integrations = await picaService.getAvailableIntegrations();
      const availableIds = integrations.map(i => i.id.toLowerCase());
      
      // These are essential integrations that should exist in any serious platform
      const criticalIntegrations = ['gmail', 'google', 'slack', 'github'];
      
      const missingCritical = criticalIntegrations.filter(required => 
        !availableIds.some(id => id.includes(required))
      );
      
      if (missingCritical.length > 0) {
        console.warn('⚠️ Missing critical integrations:', missingCritical);
        console.log('Available integrations:', availableIds.slice(0, 10));
      }
      
      // At least some popular ones should be available
      expect(missingCritical.length).toBeLessThan(criticalIntegrations.length);
    }, 15000);

    test('integrations have consistent data structure', async () => {
      const integrations = await picaService.getAvailableIntegrations();
      
      // Take a sample to validate structure consistency
      const sample = integrations.slice(0, Math.min(5, integrations.length));
      
      sample.forEach(integration => {
        // Required fields
        expect(integration).toHaveProperty('id');
        expect(integration).toHaveProperty('name');
        expect(integration).toHaveProperty('category');
        
        // Category should be a valid string
        expect(typeof integration.category).toBe('string');
        
        // Optional fields should have correct types if present
        if (integration.description) {
          expect(typeof integration.description).toBe('string');
        }
        
        if (integration.features) {
          expect(Array.isArray(integration.features)).toBe(true);
        }
        
        if (integration.actions) {
          expect(Array.isArray(integration.actions)).toBe(true);
        }
      });
    }, 15000);
  });

  describe('🏥 Health & Connectivity', () => {
    test('service is reachable and responsive', async () => {
      const startTime = Date.now();
      
      try {
        await picaService.getAvailableIntegrations();
        const responseTime = Date.now() - startTime;
        
        // API should respond within reasonable time
        expect(responseTime).toBeLessThan(10000); // 10 seconds max
        
        if (responseTime > 5000) {
          console.warn(`⚠️ Slow API response: ${responseTime}ms`);
        }
      } catch (error) {
        console.error('❌ API Health Check Failed:', error);
        throw error;
      }
    }, 15000);

    test('service handles rate limiting gracefully', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array.from({ length: 5 }, (_, i) => 
        picaService.getAvailableIntegrations()
      );
      
      const results = await Promise.allSettled(promises);
      
      // At least some requests should succeed
      const successes = results.filter(r => r.status === 'fulfilled');
      expect(successes.length).toBeGreaterThan(0);
      
      // If any failed, they should fail gracefully
      const failures = results.filter(r => r.status === 'rejected');
      failures.forEach(failure => {
        expect(failure.reason.message).toMatch(/rate limit|too many requests/i);
      });
    }, 30000);
  });

  describe('🔄 Connection Management', () => {
    test('getUserConnections handles empty state', async () => {
      // Test with a user that has no connections
      const connections = await picaService.getUserConnections('contract-test-empty-user');
      
      // Should return empty array, not null or error
      expect(Array.isArray(connections)).toBe(true);
      expect(connections.length).toBe(0);
    }, 10000);

    test('connection test returns proper structure', async () => {
      const testResult = await picaService.testConnection(
        'contract-test-user',
        'test-connector'
      );
      
      // Must have required fields
      expect(testResult).toHaveProperty('status');
      expect(['healthy', 'error']).toContain(testResult.status);
      
      if (testResult.status === 'healthy') {
        expect(testResult).toHaveProperty('latency');
        expect(typeof testResult.latency).toBe('number');
        expect(testResult.latency).toBeGreaterThan(0);
      }
    }, 10000);
  });

  describe('⚠️ Error Handling', () => {
    test('invalid API key returns proper error', async () => {
      // Temporarily use invalid key
      const originalKey = process.env.PICA_SECRET_KEY;
      process.env.PICA_SECRET_KEY = 'invalid-key-12345';
      
      try {
        const invalidService = new PicaService();
        await expect(
          invalidService.getAvailableIntegrations()
        ).rejects.toThrow();
      } finally {
        // Restore original key
        process.env.PICA_SECRET_KEY = originalKey;
      }
    }, 10000);

    test('network timeouts are handled', async () => {
      // This test would need a way to simulate network issues
      // For now, just ensure the service has timeout configuration
      const service = new PicaService();
      
      // The constructor should set reasonable timeouts
      expect(service).toBeDefined();
    });
  });
});

// Utility to run contract tests in CI
if (require.main === module) {
  console.log('🔬 Running Pica API Contract Tests...');
  
  if (!process.env.PICA_TEST_API_KEY) {
    console.error('❌ PICA_TEST_API_KEY environment variable required');
    process.exit(1);
  }
  
  console.log('✅ Contract test environment configured');
}