# 🧪 Comprehensive TDD Framework for Pica Integration

## 🎯 The Problem with Previous Testing

**You're right - previous testing was surface-level wishful thinking. Here's why:**

❌ **Mock-Heavy Tests** - Testing implementation, not behavior
❌ **Happy Path Only** - Missing critical edge cases  
❌ **No Contract Validation** - Assumptions about external APIs
❌ **No Real Data Flow** - Components tested in isolation
❌ **No Performance Bounds** - No measurable quality gates
❌ **No Security Validation** - Missing threat model coverage

## 🏗️ Real TDD Framework: 6-Layer Testing Pyramid

```
                   🎭 Manual Exploratory
                ┌────────────────────────────┐
             📱 │    End-to-End Tests        │ 
           ┌────────────────────────────────────┐
        🔗 │     Integration Tests              │
      ┌────────────────────────────────────────────┐  
   🧩 │        Component Tests                     │
  ┌────────────────────────────────────────────────────┐
🔧 │            Contract Tests                          │
┌──────────────────────────────────────────────────────────┐
│                Unit Tests                                │
└──────────────────────────────────────────────────────────┘
```

## 📋 Test Coverage Matrix (Must Pass 100%)

| Test Type | Purpose | Pass Criteria | Current Status |
|-----------|---------|---------------|----------------|
| **Contract Tests** | External API reliability | All Pica endpoints respond correctly | ❌ Not Implemented |
| **Security Tests** | Token/OAuth vulnerabilities | No security holes, encrypted storage | ❌ Not Implemented |  
| **Component Tests** | UI behavior under all states | All loading/error/success states work | ❌ Partial |
| **Integration Tests** | Data flows end-to-end | Real API calls with test accounts | ❌ Not Implemented |
| **Performance Tests** | Response time boundaries | <500ms API, <200ms UI updates | ❌ Not Implemented |
| **Error Recovery** | System resilience | Graceful degradation, no crashes | ❌ Not Implemented |

## 🔧 Layer 1: Contract Tests (Foundation)

**Purpose**: Validate external dependencies work as expected

```typescript
// __tests__/contracts/pica-api.contract.test.ts
describe('Pica API Contract', () => {
  const REAL_TEST_API_KEY = process.env.PICA_TEST_API_KEY;
  
  beforeAll(() => {
    if (!REAL_TEST_API_KEY) {
      throw new Error('PICA_TEST_API_KEY required for contract tests');
    }
  });

  describe('Authentication Endpoints', () => {
    test('generateToken returns valid JWT', async () => {
      const service = new PicaService();
      const token = await service.generateAuthToken('test-user-123');
      
      // Real validation - decode JWT and check structure
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty('sub', 'test-user-123');
      expect(decoded).toHaveProperty('exp');
      expect(new Date(decoded.exp * 1000)).toBeAfter(new Date());
    });
    
    test('invalid token returns 401', async () => {
      const response = await fetch('https://api.picaos.com/connections', {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      expect(response.status).toBe(401);
    });
  });

  describe('Connector Endpoints', () => {
    test('getConnectors returns expected structure', async () => {
      const service = new PicaService();
      const connectors = await service.getAvailableIntegrations();
      
      expect(connectors).toBeArray();
      expect(connectors.length).toBeGreaterThan(50); // Pica claims 150+
      
      // Validate each connector has required fields
      connectors.forEach(connector => {
        expect(connector).toHaveProperty('id');
        expect(connector).toHaveProperty('name');
        expect(connector.id).toMatch(/^[a-z0-9-_]+$/);
      });
    });
    
    test('popular connectors are available', async () => {
      const service = new PicaService();
      const connectors = await service.getAvailableIntegrations();
      const connectorIds = connectors.map(c => c.id);
      
      // These MUST exist or integration is broken
      const requiredConnectors = ['gmail', 'slack', 'notion', 'github'];
      requiredConnectors.forEach(required => {
        expect(connectorIds).toContain(required);
      });
    });
  });
});
```

## 🔧 Layer 2: Security Tests (Critical)

```typescript
// __tests__/security/token-security.test.ts
describe('Token Security', () => {
  describe('Secure Storage', () => {
    test('tokens are actually encrypted', async () => {
      const testToken = 'sensitive-jwt-token-12345';
      await SecureTokenStorage.storeAuthToken(testToken);
      
      // Check raw storage - should NOT contain plaintext
      const rawValue = await SecureStore.getItemAsync('pica_auth_token');
      expect(rawValue).not.toContain(testToken);
      expect(rawValue).toMatch(/^[A-Za-z0-9+/]+=*$/); // Base64 pattern
    });
    
    test('cannot decrypt without proper salt', async () => {
      const testToken = 'test-token-123';
      await SecureTokenStorage.storeAuthToken(testToken);
      
      // Corrupt the salt
      await SecureStore.setItemAsync('token_salt', 'wrong-salt');
      
      await expect(SecureTokenStorage.getAuthToken()).rejects.toThrow();
    });
    
    test('expired tokens are automatically removed', async () => {
      const expiredToken = 'expired-token';
      await SecureTokenStorage.storeAuthToken(expiredToken, -3600); // 1 hour ago
      
      const retrieved = await SecureTokenStorage.getAuthToken();
      expect(retrieved).toBeNull();
    });
  });

  describe('OAuth Flow Security', () => {
    test('state parameter prevents CSRF', async () => {
      const authUrl = 'https://app.picaos.com/authkit?token=test&connector=gmail';
      
      // URL should contain state parameter for CSRF protection
      expect(authUrl).toMatch(/[?&]state=[a-zA-Z0-9]+/);
    });
  });
});
```

## 🔧 Layer 3: Component Integration Tests

```typescript
// __tests__/integration/integrations-screen.integration.test.ts
describe('Integrations Screen Integration', () => {
  test('complete user flow: browse → connect → manage', async () => {
    // Setup real test environment
    const mockPicaService = new MockPicaService();
    mockPicaService.setupRealResponses();
    
    const { getByText, getByTestId } = render(<IntegrationsScreen />);
    
    // 1. Screen loads with available integrations
    await waitFor(() => {
      expect(getByText('Gmail')).toBeVisible();
      expect(getByText('Slack')).toBeVisible();
    });
    
    // 2. User taps connect on Gmail
    fireEvent.press(getByText('Connect Gmail'));
    
    // 3. Auth modal should open
    await waitFor(() => {
      expect(getByTestId('auth-modal')).toBeVisible();
    });
    
    // 4. Simulate successful OAuth callback
    mockPicaService.simulateSuccessfulAuth('gmail');
    
    // 5. Should show connected state
    await waitFor(() => {
      expect(getByText('Connected')).toBeVisible();
      expect(getByText('Disconnect')).toBeVisible();
    });
    
    // 6. Test connection should work
    fireEvent.press(getByText('Test Connection'));
    await waitFor(() => {
      expect(getByText('Connection healthy')).toBeVisible();
    });
  });
  
  test('handles network failures gracefully', async () => {
    const mockPicaService = new MockPicaService();
    mockPicaService.setupNetworkFailures();
    
    const { getByText } = render(<IntegrationsScreen />);
    
    await waitFor(() => {
      expect(getByText('Unable to load integrations')).toBeVisible();
      expect(getByText('Retry')).toBeVisible();
    });
  });
});
```

## 🔧 Layer 4: API Endpoint Validation Tests

```typescript
// __tests__/api/trpc-endpoints.test.ts
describe('tRPC Integration Endpoints', () => {
  const testUser = { id: 'test-user-123', email: 'test@example.com' };
  
  describe('generateAuthToken', () => {
    test('returns valid token structure', async () => {
      const result = await trpc.integrations.generateAuthToken.mutate({
        integration_id: 'gmail',
        user_agent: 'test'
      });
      
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expires_in');
      expect(result.expires_in).toBe(3600);
      
      // Token should be valid JWT
      const decoded = jwt.decode(result.token);
      expect(decoded).toBeTruthy();
    });
    
    test('validates required parameters', async () => {
      await expect(
        trpc.integrations.generateAuthToken.mutate({} as any)
      ).rejects.toThrow('Integration ID is required');
    });
  });
  
  describe('executeAction', () => {
    test('prevents action on disconnected integration', async () => {
      await expect(
        trpc.integrations.executeAction.mutate({
          connector: 'gmail',
          action: 'send_email',
          data: { to: 'test@example.com' }
        })
      ).rejects.toThrow('You do not have an active connection');
    });
  });
});
```

## 🔧 Layer 5: Performance & Load Tests

```typescript
// __tests__/performance/integration-performance.test.ts
describe('Integration Performance', () => {
  test('API endpoints meet response time SLA', async () => {
    const startTime = Date.now();
    
    await trpc.integrations.getAvailableIntegrations.query();
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(500); // 500ms SLA
  });
  
  test('UI updates within 200ms after data changes', async () => {
    const { getByTestId } = render(<IntegrationsScreen />);
    
    const startTime = Date.now();
    
    // Trigger state change
    fireEvent.press(getByTestId('refresh-button'));
    
    // Wait for UI update
    await waitFor(() => {
      expect(getByTestId('loading-indicator')).toBeVisible();
    });
    
    const updateTime = Date.now() - startTime;
    expect(updateTime).toBeLessThan(200);
  });
  
  test('handles 100 concurrent connections', async () => {
    const promises = Array.from({ length: 100 }, () =>
      trpc.integrations.testConnection.mutate({ connector: 'gmail' })
    );
    
    const results = await Promise.allSettled(promises);
    const failures = results.filter(r => r.status === 'rejected');
    
    // Less than 5% failure rate acceptable
    expect(failures.length).toBeLessThan(5);
  });
});
```

## 🔧 Layer 6: End-to-End User Journey Tests

```typescript
// __tests__/e2e/complete-user-journey.test.ts
describe('Complete Integration User Journey', () => {
  let testUser: any;
  let testGmailAccount: any;
  
  beforeAll(async () => {
    // Setup real test accounts
    testUser = await createTestUser();
    testGmailAccount = await setupTestGmailAccount();
  });
  
  test('full Gmail integration lifecycle', async () => {
    // 1. User opens app and navigates to integrations
    await element(by.text('Settings')).tap();
    await element(by.text('Integrations')).tap();
    
    // 2. User sees Gmail integration available
    await expect(element(by.text('Gmail'))).toBeVisible();
    await expect(element(by.text('Not connected'))).toBeVisible();
    
    // 3. User taps connect
    await element(by.text('Connect')).tap();
    
    // 4. OAuth flow completes successfully
    await expect(element(by.text('Authorize Gmail'))).toBeVisible();
    await element(by.text('Allow')).tap();
    
    // 5. Returns to integrations screen with success
    await expect(element(by.text('Connected'))).toBeVisible();
    
    // 6. User can execute actions
    await element(by.text('Send Test Email')).tap();
    await expect(element(by.text('Email sent successfully'))).toBeVisible();
    
    // 7. User can disconnect
    await element(by.text('Disconnect')).tap();
    await element(by.text('Confirm')).tap();
    await expect(element(by.text('Not connected'))).toBeVisible();
  });
});
```

## 📊 Quality Gates (All Must Pass)

### ✅ **Coverage Requirements**
```bash
# All tests must pass with minimum coverage
npm run test:coverage

✅ Statements: > 95%
✅ Branches: > 90% 
✅ Functions: > 95%
✅ Lines: > 95%
```

### ✅ **Performance Benchmarks**
```bash
✅ API Response Time: < 500ms average
✅ UI Update Time: < 200ms 
✅ Memory Usage: < 50MB for integration system
✅ Bundle Size: < 2MB increase from base app
```

### ✅ **Security Validation**
```bash
✅ No hardcoded secrets in code
✅ All tokens encrypted at rest
✅ HTTPS only for all API calls
✅ OAuth 2.0 compliance verified
```

### ✅ **Error Handling**
```bash
✅ Network failures handled gracefully
✅ Invalid credentials show helpful messages  
✅ Rate limiting handled with backoff
✅ No unhandled promise rejections
```

## 🎯 Test Automation Pipeline

```yaml
# .github/workflows/integration-tests.yml
name: Integration TDD Pipeline

on: [push, pull_request]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Contract Tests
        run: npm run test:contracts
        env:
          PICA_TEST_API_KEY: ${{ secrets.PICA_TEST_API_KEY }}
  
  security-tests:
    runs-on: ubuntu-latest  
    steps:
      - name: Security Tests
        run: npm run test:security
      - name: SAST Scan
        run: npm run security:scan
        
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Integration Tests
        run: npm run test:integration
        
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Performance Tests
        run: npm run test:performance
      - name: Fail if performance degrades
        run: npm run performance:check

  deploy:
    needs: [contract-tests, security-tests, integration-tests, performance-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: npm run deploy:staging
```

## 🚀 Implementation Command

```bash
# Run this to implement the complete TDD framework
npm run setup:tdd-framework

# This will:
# 1. Install all testing dependencies
# 2. Set up test environments  
# 3. Create test data and mock services
# 4. Configure CI/CD pipeline
# 5. Run initial test suite
```

## 📈 Success Metrics

**When these ALL pass consistently, the integration is truly production-ready:**

1. ✅ **Contract Tests**: 100% external API compatibility
2. ✅ **Security Tests**: 0 vulnerabilities, all tokens encrypted  
3. ✅ **Integration Tests**: Complete user flows work end-to-end
4. ✅ **Performance Tests**: All SLAs met under load
5. ✅ **Error Tests**: Graceful handling of all failure modes
6. ✅ **E2E Tests**: Real user journeys complete successfully

**Only when this entire matrix is green can we confidently say: "Production Ready"** ✅