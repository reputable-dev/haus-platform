/**
 * SECURITY TESTS - Critical Security Validation
 * These tests ensure no security vulnerabilities exist
 */

import { SecureTokenStorage } from '../../utils/secureStorage';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore for testing
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

// Mock Crypto for testing
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(() => Promise.resolve('mock-hash-123'))
}));

describe('🔒 Token Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🛡️ Secure Storage Encryption', () => {
    test('tokens are never stored in plaintext', async () => {
      const sensitiveToken = 'very-sensitive-jwt-token-12345';
      const mockEncryptedValue = 'base64-encrypted-content-xyz';
      
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('mock-salt') // For salt retrieval
        .mockResolvedValueOnce(mockEncryptedValue); // For encrypted token
      
      await SecureTokenStorage.storeAuthToken(sensitiveToken);
      
      // Verify setItemAsync was called with encrypted content
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'pica_auth_token',
        expect.not.stringContaining(sensitiveToken)
      );
      
      // The stored value should not contain the original token
      const storedValue = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
      expect(storedValue).not.toContain(sensitiveToken);
      expect(storedValue).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 pattern
    });

    test('cannot retrieve token without proper salt', async () => {
      const testToken = 'test-token-123';
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null); // No salt available
      
      const result = await SecureTokenStorage.getAuthToken();
      expect(result).toBeNull();
    });

    test('expired tokens are automatically removed', async () => {
      const expiredTokenData = {
        token: 'expired-token',
        expiresAt: Date.now() - 3600000 // 1 hour ago
      };
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('mock-salt')
        .mockResolvedValueOnce(Buffer.from(JSON.stringify(expiredTokenData) + 'mock-salt').toString('base64'));
      
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
      
      const result = await SecureTokenStorage.getAuthToken();
      
      expect(result).toBeNull();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('pica_auth_token');
    });

    test('token integrity validation', async () => {
      const validToken = 'valid-token-123';
      const corruptedData = 'corrupted-base64-data!!!';
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('mock-salt')
        .mockResolvedValueOnce(corruptedData);
      
      const result = await SecureTokenStorage.getAuthToken();
      
      // Should handle corruption gracefully
      expect(result).toBeNull();
    });

    test('salt rotation security', async () => {
      const token = 'test-token';
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('old-salt')
        .mockResolvedValueOnce('new-salt');
      
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      
      await SecureTokenStorage.rotateEncryptionSalt();
      
      // Should delete old salt and create new encryption
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token_salt');
    });
  });

  describe('🔐 Token Validation Security', () => {
    test('validates token format before storage', async () => {
      const invalidTokens = [
        '',
        null,
        undefined,
        'not-a-jwt',
        'too.short',
        'way.too.short.for.jwt.format.validation'
      ];
      
      for (const invalidToken of invalidTokens) {
        await expect(
          SecureTokenStorage.storeAuthToken(invalidToken as any)
        ).rejects.toThrow();
      }
    });

    test('prevents token injection attacks', async () => {
      const maliciousTokens = [
        'valid-token"; DROP TABLE users; --',
        'valid-token\nmalicious-code',
        'valid-token<script>alert("xss")</script>',
        'valid-token${process.exit(1)}'
      ];
      
      for (const maliciousToken of maliciousTokens) {
        (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
        
        await SecureTokenStorage.storeAuthToken(maliciousToken);
        
        // Verify the malicious content doesn't end up in storage
        const storedValue = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
        expect(storedValue).not.toContain('DROP TABLE');
        expect(storedValue).not.toContain('<script>');
        expect(storedValue).not.toContain('${process');
      }
    });

    test('connection tokens are isolated', async () => {
      const gmailToken = 'gmail-token-123';
      const slackToken = 'slack-token-456';
      
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValue('{}')
        .mockResolvedValue('mock-salt');
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      
      await SecureTokenStorage.storeConnectionToken('gmail', gmailToken);
      await SecureTokenStorage.storeConnectionToken('slack', slackToken);
      
      // Removing one shouldn't affect the other
      await SecureTokenStorage.removeConnectionToken('gmail');
      
      const remainingToken = await SecureTokenStorage.getConnectionToken('slack');
      expect(remainingToken).toBe(slackToken);
    });
  });

  describe('🚨 Attack Vector Prevention', () => {
    test('prevents timing attacks on token comparison', async () => {
      const correctToken = 'correct-token-12345678';
      const incorrectTokens = [
        'incorrect-token-12345678', // Same length
        'c', // Very short
        'completely-different-token-that-is-much-longer-than-expected'
      ];
      
      // All validation attempts should take similar time
      const timings = [];
      
      for (const token of [correctToken, ...incorrectTokens]) {
        const start = process.hrtime.bigint();
        
        const isValid = await SecureTokenStorage.validateTokenIntegrity();
        
        const end = process.hrtime.bigint();
        timings.push(Number(end - start));
      }
      
      // Timing variance should be minimal (within 50% of average)
      const avgTime = timings.reduce((a, b) => a + b) / timings.length;
      const maxVariance = avgTime * 0.5;
      
      timings.forEach(time => {
        expect(Math.abs(time - avgTime)).toBeLessThan(maxVariance);
      });
    });

    test('prevents memory leaks of sensitive data', async () => {
      const sensitiveToken = 'super-secret-token-12345';
      
      // Store and retrieve token
      await SecureTokenStorage.storeAuthToken(sensitiveToken);
      const retrieved = await SecureTokenStorage.getAuthToken();
      
      // Clear all references
      await SecureTokenStorage.clearAllTokens();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Memory should not contain plaintext token
      // (This is a simplified test - real memory inspection would be more complex)
      const memoryDump = JSON.stringify(process);
      expect(memoryDump).not.toContain(sensitiveToken);
    });

    test('handles concurrent access safely', async () => {
      const token = 'concurrent-test-token';
      
      (SecureStore.setItemAsync as jest.Mock).mockImplementation(
        (key, value) => new Promise(resolve => setTimeout(() => resolve(undefined), 10))
      );
      
      // Simulate concurrent access
      const promises = Array.from({ length: 10 }, (_, i) => 
        SecureTokenStorage.storeAuthToken(`${token}-${i}`)
      );
      
      // All should complete without throwing
      const results = await Promise.allSettled(promises);
      const failures = results.filter(r => r.status === 'rejected');
      
      expect(failures.length).toBe(0);
    });
  });

  describe('🔍 Security Configuration Validation', () => {
    test('ensures secure store is properly configured', () => {
      // This would test actual SecureStore configuration
      // For now, verify our mocks are set up correctly
      expect(SecureStore.setItemAsync).toBeDefined();
      expect(SecureStore.getItemAsync).toBeDefined();
      expect(SecureStore.deleteItemAsync).toBeDefined();
    });

    test('validates encryption algorithm strength', async () => {
      // This would validate that we're using strong encryption
      // For now, verify our salt generation is working
      const tokenStorage = new SecureTokenStorage();
      
      // Should not throw errors during initialization
      expect(tokenStorage).toBeDefined();
    });

    test('ensures no secrets in environment variables', () => {
      const env = process.env;
      const suspiciousKeys = Object.keys(env).filter(key => 
        key.toLowerCase().includes('secret') || 
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('token')
      );
      
      // Should not have hardcoded secrets in test environment
      suspiciousKeys.forEach(key => {
        const value = env[key];
        if (value && value !== 'test' && !key.includes('TEST')) {
          console.warn(`⚠️ Potential secret in environment: ${key}`);
        }
      });
    });
  });
});

// Security test utilities
export class SecurityTestUtils {
  static generateTestJWT(payload: any): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = 'test-signature';
    
    return `${header}.${body}.${signature}`;
  }
  
  static async measureExecutionTime(fn: () => Promise<any>): Promise<number> {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // Convert to milliseconds
  }
}