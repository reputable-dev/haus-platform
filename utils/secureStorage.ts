import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

interface TokenData {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

interface ConnectionTokens {
  [integrationId: string]: TokenData;
}

export class SecureTokenStorage {
  private static readonly AUTH_TOKEN_KEY = 'pica_auth_token';
  private static readonly CONNECTION_TOKENS_KEY = 'pica_connection_tokens';
  private static readonly REFRESH_TOKEN_KEY = 'pica_refresh_token';
  private static readonly TOKEN_SALT_KEY = 'token_salt';

  // Generate or get encryption salt
  private static async getOrCreateSalt(): Promise<string> {
    let salt = await SecureStore.getItemAsync(this.TOKEN_SALT_KEY);
    if (!salt) {
      salt = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36) + Date.now().toString()
      );
      await SecureStore.setItemAsync(this.TOKEN_SALT_KEY, salt);
    }
    return salt;
  }

  // Encrypt sensitive data before storing
  private static async encryptData(data: string): Promise<string> {
    const salt = await this.getOrCreateSalt();
    // Simple encryption - in production, use stronger encryption
    const encrypted = Buffer.from(data + salt).toString('base64');
    return encrypted;
  }

  // Decrypt stored data
  private static async decryptData(encryptedData: string): Promise<string> {
    const salt = await this.getOrCreateSalt();
    try {
      const decrypted = Buffer.from(encryptedData, 'base64').toString();
      return decrypted.replace(salt, '');
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw new Error('Invalid encrypted data');
    }
  }

  // Auth Token Management
  static async storeAuthToken(
    token: string, 
    expiresIn: number = 3600, // 1 hour default
    refreshToken?: string
  ): Promise<void> {
    try {
      const tokenData: TokenData = {
        token,
        expiresAt: Date.now() + (expiresIn * 1000),
        refreshToken
      };
      
      const encryptedData = await this.encryptData(JSON.stringify(tokenData));
      await SecureStore.setItemAsync(this.AUTH_TOKEN_KEY, encryptedData);
      
      // Store refresh token separately if provided
      if (refreshToken) {
        const encryptedRefresh = await this.encryptData(refreshToken);
        await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, encryptedRefresh);
      }
    } catch (error) {
      console.error('Failed to store auth token:', error);
      throw new Error('Failed to securely store authentication token');
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      const encryptedData = await SecureStore.getItemAsync(this.AUTH_TOKEN_KEY);
      if (!encryptedData) return null;

      const decryptedData = await this.decryptData(encryptedData);
      const tokenData: TokenData = JSON.parse(decryptedData);

      // Check if token is expired
      if (Date.now() >= tokenData.expiresAt) {
        // Try to refresh token
        const refreshed = await this.refreshAuthToken();
        return refreshed;
      }

      return tokenData.token;
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      const encryptedRefresh = await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
      if (!encryptedRefresh) return null;

      return await this.decryptData(encryptedRefresh);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  static async refreshAuthToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        await this.removeAuthToken();
        return null;
      }

      // TODO: Implement actual refresh token API call
      // For now, return null to trigger re-authentication
      await this.removeAuthToken();
      return null;
    } catch (error) {
      console.error('Failed to refresh auth token:', error);
      await this.removeAuthToken();
      return null;
    }
  }

  static async isTokenExpired(): Promise<boolean> {
    try {
      const encryptedData = await SecureStore.getItemAsync(this.AUTH_TOKEN_KEY);
      if (!encryptedData) return true;

      const decryptedData = await this.decryptData(encryptedData);
      const tokenData: TokenData = JSON.parse(decryptedData);

      return Date.now() >= tokenData.expiresAt;
    } catch (error) {
      return true;
    }
  }

  static async removeAuthToken(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(this.AUTH_TOKEN_KEY),
        SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY)
      ]);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  }

  // Connection Tokens Management
  static async storeConnectionTokens(tokens: ConnectionTokens): Promise<void> {
    try {
      const encryptedTokens = await this.encryptData(JSON.stringify(tokens));
      await SecureStore.setItemAsync(this.CONNECTION_TOKENS_KEY, encryptedTokens);
    } catch (error) {
      console.error('Failed to store connection tokens:', error);
      throw new Error('Failed to securely store connection tokens');
    }
  }

  static async getConnectionTokens(): Promise<ConnectionTokens> {
    try {
      const encryptedTokens = await SecureStore.getItemAsync(this.CONNECTION_TOKENS_KEY);
      if (!encryptedTokens) return {};

      const decryptedTokens = await this.decryptData(encryptedTokens);
      const tokens: ConnectionTokens = JSON.parse(decryptedTokens);

      // Filter out expired tokens
      const validTokens: ConnectionTokens = {};
      for (const [integrationId, tokenData] of Object.entries(tokens)) {
        if (Date.now() < tokenData.expiresAt) {
          validTokens[integrationId] = tokenData;
        }
      }

      // Update storage if any tokens were expired
      if (Object.keys(validTokens).length !== Object.keys(tokens).length) {
        await this.storeConnectionTokens(validTokens);
      }

      return validTokens;
    } catch (error) {
      console.error('Failed to retrieve connection tokens:', error);
      return {};
    }
  }

  static async getConnectionToken(integrationId: string): Promise<string | null> {
    try {
      const tokens = await this.getConnectionTokens();
      const tokenData = tokens[integrationId];
      
      if (!tokenData || Date.now() >= tokenData.expiresAt) {
        return null;
      }

      return tokenData.token;
    } catch (error) {
      console.error('Failed to get connection token:', error);
      return null;
    }
  }

  static async storeConnectionToken(
    integrationId: string, 
    token: string, 
    expiresIn: number = 3600
  ): Promise<void> {
    try {
      const tokens = await this.getConnectionTokens();
      tokens[integrationId] = {
        token,
        expiresAt: Date.now() + (expiresIn * 1000)
      };
      await this.storeConnectionTokens(tokens);
    } catch (error) {
      console.error('Failed to store connection token:', error);
      throw new Error('Failed to securely store connection token');
    }
  }

  static async removeConnectionToken(integrationId: string): Promise<void> {
    try {
      const tokens = await this.getConnectionTokens();
      delete tokens[integrationId];
      await this.storeConnectionTokens(tokens);
    } catch (error) {
      console.error('Failed to remove connection token:', error);
    }
  }

  static async removeAllConnectionTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.CONNECTION_TOKENS_KEY);
    } catch (error) {
      console.error('Failed to remove all connection tokens:', error);
    }
  }

  // Utility Methods
  static async clearAllTokens(): Promise<void> {
    try {
      await Promise.all([
        this.removeAuthToken(),
        this.removeAllConnectionTokens(),
        SecureStore.deleteItemAsync(this.TOKEN_SALT_KEY)
      ]);
    } catch (error) {
      console.error('Failed to clear all tokens:', error);
    }
  }

  static async getTokenInfo(): Promise<{
    hasAuthToken: boolean;
    authTokenExpired: boolean;
    connectionTokensCount: number;
  }> {
    try {
      const hasAuthToken = !!(await SecureStore.getItemAsync(this.AUTH_TOKEN_KEY));
      const authTokenExpired = await this.isTokenExpired();
      const connectionTokens = await this.getConnectionTokens();
      
      return {
        hasAuthToken,
        authTokenExpired,
        connectionTokensCount: Object.keys(connectionTokens).length
      };
    } catch (error) {
      console.error('Failed to get token info:', error);
      return {
        hasAuthToken: false,
        authTokenExpired: true,
        connectionTokensCount: 0
      };
    }
  }

  // Security Methods
  static async validateTokenIntegrity(): Promise<boolean> {
    try {
      const authToken = await this.getAuthToken();
      const connectionTokens = await this.getConnectionTokens();
      
      // Basic validation - tokens should be strings and not empty
      const authValid = !authToken || (typeof authToken === 'string' && authToken.length > 0);
      const connectionsValid = Object.values(connectionTokens).every(
        token => typeof token.token === 'string' && token.token.length > 0
      );

      return authValid && connectionsValid;
    } catch (error) {
      console.error('Token integrity validation failed:', error);
      return false;
    }
  }

  static async rotateEncryptionSalt(): Promise<void> {
    try {
      // Get current data
      const authToken = await this.getAuthToken();
      const connectionTokens = await this.getConnectionTokens();
      
      // Remove old salt
      await SecureStore.deleteItemAsync(this.TOKEN_SALT_KEY);
      
      // Re-encrypt with new salt if we have data
      if (authToken) {
        const refreshToken = await this.getRefreshToken();
        await this.storeAuthToken(authToken, 3600, refreshToken || undefined);
      }
      
      if (Object.keys(connectionTokens).length > 0) {
        await this.storeConnectionTokens(connectionTokens);
      }
    } catch (error) {
      console.error('Failed to rotate encryption salt:', error);
      throw new Error('Failed to rotate encryption salt');
    }
  }
}