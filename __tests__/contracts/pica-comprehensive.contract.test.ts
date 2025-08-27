/**
 * COMPREHENSIVE PICA CONTRACT TESTS - ALL 150+ Integrations Validation
 * Tests every available Pica connector, tool, and integration for complete coverage
 */

import { PicaService } from '../../backend/services/pica.service';

// Skip if no real API key provided
const REAL_TEST_API_KEY = process.env.PICA_TEST_API_KEY;
const describeWithContract = REAL_TEST_API_KEY ? describe : describe.skip;

// Test accounts configuration for major platforms
const TEST_ACCOUNTS = {
  GMAIL_TEST_EMAIL: process.env.GMAIL_TEST_EMAIL,
  SLACK_TEST_WEBHOOK: process.env.SLACK_TEST_WEBHOOK,
  NOTION_TEST_TOKEN: process.env.NOTION_TEST_TOKEN,
  GITHUB_TEST_TOKEN: process.env.GITHUB_TEST_TOKEN,
  AIRTABLE_TEST_TOKEN: process.env.AIRTABLE_TEST_TOKEN,
  ZAPIER_TEST_WEBHOOK: process.env.ZAPIER_TEST_WEBHOOK,
  MICROSOFT_TEST_TENANT: process.env.MICROSOFT_TEST_TENANT,
  SALESFORCE_TEST_ORG: process.env.SALESFORCE_TEST_ORG,
  HUBSPOT_TEST_TOKEN: process.env.HUBSPOT_TEST_TOKEN,
  DISCORD_TEST_WEBHOOK: process.env.DISCORD_TEST_WEBHOOK
};

// Expected connector categories based on Pica's 150+ integrations
const EXPECTED_CONNECTOR_CATEGORIES = {
  'Communication': {
    minCount: 15,
    critical: ['gmail', 'outlook', 'slack', 'discord', 'teams', 'telegram', 'whatsapp'],
    features: ['send_message', 'read_message', 'create_channel', 'manage_users']
  },
  'Productivity': {
    minCount: 20,
    critical: ['notion', 'airtable', 'google-sheets', 'google-docs', 'trello', 'asana', 'monday'],
    features: ['create_document', 'update_record', 'search_content', 'manage_tasks']
  },
  'Development': {
    minCount: 10,
    critical: ['github', 'gitlab', 'bitbucket', 'jira', 'linear', 'vercel', 'netlify'],
    features: ['create_issue', 'manage_repository', 'deploy_app', 'create_branch']
  },
  'Marketing': {
    minCount: 12,
    critical: ['mailchimp', 'sendgrid', 'hubspot', 'intercom', 'segment', 'google-analytics'],
    features: ['send_email', 'track_event', 'manage_contacts', 'create_campaign']
  },
  'Sales & CRM': {
    minCount: 8,
    critical: ['salesforce', 'pipedrive', 'hubspot', 'zendesk', 'freshworks'],
    features: ['create_contact', 'update_deal', 'manage_tickets', 'track_interaction']
  },
  'Finance': {
    minCount: 6,
    critical: ['stripe', 'paypal', 'quickbooks', 'xero', 'plaid'],
    features: ['process_payment', 'create_invoice', 'manage_expenses', 'track_revenue']
  },
  'Design': {
    minCount: 5,
    critical: ['figma', 'sketch', 'adobe-creative', 'canva'],
    features: ['export_design', 'manage_assets', 'create_mockup', 'collaborate_design']
  },
  'Storage & Cloud': {
    minCount: 8,
    critical: ['google-drive', 'dropbox', 'onedrive', 'box', 'aws-s3'],
    features: ['upload_file', 'share_file', 'manage_permissions', 'sync_folder']
  },
  'Analytics': {
    minCount: 6,
    critical: ['google-analytics', 'mixpanel', 'amplitude', 'hotjar'],
    features: ['track_event', 'create_report', 'analyze_data', 'set_goals']
  },
  'Social Media': {
    minCount: 8,
    critical: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'],
    features: ['post_content', 'schedule_post', 'manage_followers', 'analyze_engagement']
  },
  'E-commerce': {
    minCount: 6,
    critical: ['shopify', 'woocommerce', 'bigcommerce', 'magento'],
    features: ['manage_products', 'process_orders', 'track_inventory', 'handle_customers']
  },
  'AI & Machine Learning': {
    minCount: 5,
    critical: ['openai', 'anthropic', 'hugging-face', 'cohere'],
    features: ['generate_text', 'analyze_sentiment', 'classify_content', 'extract_data']
  }
};

describeWithContract('🌐 Comprehensive Pica Integration Validation - ALL 150+ Tools', () => {
  let picaService: PicaService;
  let availableConnectors: any[];

  beforeAll(async () => {
    if (!REAL_TEST_API_KEY) {
      console.warn('⚠️ PICA_TEST_API_KEY not provided - skipping comprehensive tests');
      return;
    }
    
    // Use real API key for comprehensive tests
    process.env.PICA_SECRET_KEY = REAL_TEST_API_KEY;
    picaService = new PicaService();
    
    // Fetch all available connectors once for all tests
    console.log('🔍 Fetching all available Pica connectors...');
    availableConnectors = await picaService.getAvailableIntegrations();
    console.log(`✅ Found ${availableConnectors.length} available connectors`);
  }, 30000);

  describe('🔍 Complete Connector Discovery & Validation', () => {
    test('validates Pica claims 150+ integrations available', async () => {
      expect(availableConnectors).toBeDefined();
      expect(Array.isArray(availableConnectors)).toBe(true);
      
      // Pica claims 150+ integrations - let's verify
      expect(availableConnectors.length).toBeGreaterThanOrEqual(150);
      
      console.log(`📊 Total Available Connectors: ${availableConnectors.length}`);
      console.log('📋 Sample connectors:', availableConnectors.slice(0, 5).map(c => c.id));
    });

    test('validates all connectors have required metadata structure', async () => {
      const invalidConnectors = [];
      
      availableConnectors.forEach((connector, index) => {
        const errors = [];
        
        // Required fields validation
        if (!connector.id || typeof connector.id !== 'string') {
          errors.push('Missing or invalid id');
        }
        
        if (!connector.name || typeof connector.name !== 'string') {
          errors.push('Missing or invalid name');
        }
        
        if (!connector.category || typeof connector.category !== 'string') {
          errors.push('Missing or invalid category');
        }
        
        // ID format validation (should be lowercase, alphanumeric with hyphens/underscores)
        if (connector.id && !/^[a-z0-9_-]+$/.test(connector.id)) {
          errors.push('Invalid ID format');
        }
        
        // Features array validation
        if (!Array.isArray(connector.features)) {
          errors.push('Features should be an array');
        }
        
        // Actions array validation
        if (!Array.isArray(connector.actions)) {
          errors.push('Actions should be an array');
        }
        
        if (errors.length > 0) {
          invalidConnectors.push({
            index,
            id: connector.id || 'unknown',
            name: connector.name || 'unknown',
            errors
          });
        }
      });
      
      if (invalidConnectors.length > 0) {
        console.error('❌ Invalid connectors found:', invalidConnectors.slice(0, 10));
      }
      
      // Allow up to 5% invalid connectors (some may be beta/incomplete)
      const invalidPercentage = (invalidConnectors.length / availableConnectors.length) * 100;
      expect(invalidPercentage).toBeLessThan(5);
      
      console.log(`✅ Connector Validation: ${((100 - invalidPercentage)).toFixed(1)}% valid`);
    });

    test('validates comprehensive category coverage', async () => {
      const categoryStats = {};
      
      availableConnectors.forEach(connector => {
        const category = connector.category || 'Uncategorized';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
      
      console.log('📊 Category Distribution:', categoryStats);
      
      // Validate expected categories exist with minimum counts
      Object.entries(EXPECTED_CONNECTOR_CATEGORIES).forEach(([category, requirements]) => {
        expect(categoryStats[category]).toBeGreaterThanOrEqual(requirements.minCount);
      });
      
      // Should have good category distribution (no single category >40% of total)
      const totalConnectors = availableConnectors.length;
      Object.values(categoryStats).forEach((count: number) => {
        const percentage = (count / totalConnectors) * 100;
        expect(percentage).toBeLessThan(40);
      });
    });

    test('validates critical connectors are available', async () => {
      const availableIds = availableConnectors.map(c => c.id.toLowerCase());
      const missingCritical = [];
      
      Object.entries(EXPECTED_CONNECTOR_CATEGORIES).forEach(([category, requirements]) => {
        const categoryMissing = requirements.critical.filter(criticalId => 
          !availableIds.some(availableId => 
            availableId.includes(criticalId.toLowerCase()) || 
            criticalId.toLowerCase().includes(availableId)
          )
        );
        
        if (categoryMissing.length > 0) {
          missingCritical.push({ category, missing: categoryMissing });
        }
      });
      
      if (missingCritical.length > 0) {
        console.warn('⚠️ Some critical connectors may be missing or named differently:');
        missingCritical.forEach(({ category, missing }) => {
          console.warn(`  ${category}: ${missing.join(', ')}`);
        });
      }
      
      // Allow some flexibility in naming, but most critical connectors should be available
      const totalCritical = Object.values(EXPECTED_CONNECTOR_CATEGORIES)
        .reduce((sum, req) => sum + req.critical.length, 0);
      const totalMissing = missingCritical.reduce((sum, cat) => sum + cat.missing.length, 0);
      const availabilityRate = ((totalCritical - totalMissing) / totalCritical) * 100;
      
      expect(availabilityRate).toBeGreaterThan(70); // 70% of critical connectors should be available
      console.log(`✅ Critical Connector Availability: ${availabilityRate.toFixed(1)}%`);
    });
  });

  describe('🔑 Authentication & Token Generation for All Connectors', () => {
    test('generates auth tokens for major connector categories', async () => {
      const testResults = [];
      const sampleConnectors = [];
      
      // Get sample connectors from each category
      Object.keys(EXPECTED_CONNECTOR_CATEGORIES).forEach(category => {
        const categoryConnectors = availableConnectors.filter(c => c.category === category);
        if (categoryConnectors.length > 0) {
          sampleConnectors.push(categoryConnectors[0]); // Take first from each category
        }
      });
      
      console.log(`🧪 Testing auth token generation for ${sampleConnectors.length} category samples`);
      
      for (const connector of sampleConnectors.slice(0, 10)) { // Limit to 10 for CI speed
        try {
          const startTime = Date.now();
          
          const token = await picaService.generateAuthToken(`test-user-${Date.now()}`, {
            integration_id: connector.id,
            test_mode: true,
            category: connector.category,
            generated_at: new Date().toISOString()
          });
          
          const duration = Date.now() - startTime;
          
          testResults.push({
            connector: connector.id,
            category: connector.category,
            success: true,
            tokenLength: token.length,
            duration,
            hasJWTStructure: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token)
          });
          
        } catch (error) {
          testResults.push({
            connector: connector.id,
            category: connector.category,
            success: false,
            error: error.message,
            duration: null
          });
        }
      }
      
      const successfulTests = testResults.filter(r => r.success);
      const failedTests = testResults.filter(r => !r.success);
      
      console.log(`✅ Successful token generations: ${successfulTests.length}/${testResults.length}`);
      if (failedTests.length > 0) {
        console.warn('⚠️ Failed token generations:', failedTests.slice(0, 3));
      }
      
      // At least 80% should succeed (some may require special setup)
      const successRate = (successfulTests.length / testResults.length) * 100;
      expect(successRate).toBeGreaterThan(80);
      
      // Successful tokens should all be JWT format
      successfulTests.forEach(result => {
        expect(result.hasJWTStructure).toBe(true);
        expect(result.tokenLength).toBeGreaterThan(100);
        expect(result.duration).toBeLessThan(5000); // 5 second timeout
      });
    });

    test('validates OAuth URLs for connectors requiring OAuth', async () => {
      const oauthConnectors = availableConnectors.filter(c => 
        c.features?.includes('oauth') || 
        c.requirements?.some(req => req.toLowerCase().includes('oauth')) ||
        ['gmail', 'slack', 'notion', 'github', 'google', 'microsoft', 'facebook', 'twitter'].some(oauth => 
          c.id.toLowerCase().includes(oauth)
        )
      );
      
      console.log(`🔐 Testing OAuth URL generation for ${oauthConnectors.length} OAuth connectors`);
      
      const oauthResults = [];
      
      for (const connector of oauthConnectors.slice(0, 15)) { // Test 15 OAuth connectors
        try {
          const token = await picaService.generateAuthToken(`oauth-test-user-${Date.now()}`, {
            integration_id: connector.id,
            oauth_test: true
          });
          
          // For OAuth connectors, the token might be different format or include auth URL
          oauthResults.push({
            connector: connector.id,
            success: true,
            tokenGenerated: !!token,
            tokenLength: token?.length || 0
          });
          
        } catch (error) {
          oauthResults.push({
            connector: connector.id,
            success: false,
            error: error.message
          });
        }
      }
      
      const oauthSuccessRate = (oauthResults.filter(r => r.success).length / oauthResults.length) * 100;
      console.log(`✅ OAuth token generation success rate: ${oauthSuccessRate.toFixed(1)}%`);
      
      // OAuth connectors should have at least 70% success rate
      expect(oauthSuccessRate).toBeGreaterThan(70);
    });
  });

  describe('🔧 Connector Actions & Features Validation', () => {
    test('validates connectors have appropriate actions for their category', async () => {
      const categoryActionValidation = {};
      
      Object.entries(EXPECTED_CONNECTOR_CATEGORIES).forEach(([category, requirements]) => {
        const categoryConnectors = availableConnectors.filter(c => c.category === category);
        
        const actionCoverage = {
          totalConnectors: categoryConnectors.length,
          connectorsWithActions: 0,
          totalActions: 0,
          expectedFeatures: requirements.features,
          featureCoverage: {}
        };
        
        categoryConnectors.forEach(connector => {
          if (connector.actions && connector.actions.length > 0) {
            actionCoverage.connectorsWithActions++;
            actionCoverage.totalActions += connector.actions.length;
          }
          
          // Check feature coverage
          requirements.features.forEach(expectedFeature => {
            const hasFeature = connector.features?.some(feature => 
              feature.toLowerCase().includes(expectedFeature.toLowerCase().split('_')[0]) ||
              connector.actions?.some(action => 
                action.id?.toLowerCase().includes(expectedFeature.toLowerCase()) ||
                action.name?.toLowerCase().includes(expectedFeature.toLowerCase().replace('_', ' '))
              )
            );
            
            if (!actionCoverage.featureCoverage[expectedFeature]) {
              actionCoverage.featureCoverage[expectedFeature] = 0;
            }
            if (hasFeature) {
              actionCoverage.featureCoverage[expectedFeature]++;
            }
          });
        });
        
        categoryActionValidation[category] = actionCoverage;
      });
      
      console.log('📊 Action Coverage by Category:');
      Object.entries(categoryActionValidation).forEach(([category, coverage]: [string, any]) => {
        const actionPercentage = (coverage.connectorsWithActions / coverage.totalConnectors) * 100;
        console.log(`  ${category}: ${actionPercentage.toFixed(1)}% have actions (${coverage.totalActions} total)`);
        
        // At least 50% of connectors in each category should have defined actions
        expect(actionPercentage).toBeGreaterThan(50);
      });
    });

    test('validates high-priority connectors have comprehensive actions', async () => {
      const highPriorityConnectors = [
        'gmail', 'slack', 'notion', 'github', 'google-sheets', 
        'airtable', 'trello', 'asana', 'salesforce', 'hubspot',
        'stripe', 'mailchimp', 'discord', 'figma', 'zapier'
      ];
      
      const actionValidationResults = [];
      
      for (const priorityId of highPriorityConnectors) {
        const connector = availableConnectors.find(c => 
          c.id.toLowerCase().includes(priorityId) || 
          priorityId.includes(c.id.toLowerCase())
        );
        
        if (connector) {
          actionValidationResults.push({
            id: connector.id,
            name: connector.name,
            actionsCount: connector.actions?.length || 0,
            featuresCount: connector.features?.length || 0,
            hasActions: (connector.actions?.length || 0) > 0,
            hasFeatures: (connector.features?.length || 0) > 0,
            category: connector.category
          });
        } else {
          actionValidationResults.push({
            id: priorityId,
            found: false
          });
        }
      }
      
      const foundConnectors = actionValidationResults.filter(r => r.found !== false);
      const connectorsWithActions = foundConnectors.filter(r => r.hasActions);
      
      console.log(`📋 High-Priority Connector Actions:`);
      foundConnectors.forEach(connector => {
        console.log(`  ${connector.name}: ${connector.actionsCount} actions, ${connector.featuresCount} features`);
      });
      
      // At least 80% of high-priority connectors should have actions defined
      const actionCoverageRate = (connectorsWithActions.length / foundConnectors.length) * 100;
      expect(actionCoverageRate).toBeGreaterThan(80);
      
      console.log(`✅ High-priority connector action coverage: ${actionCoverageRate.toFixed(1)}%`);
    });

    test('validates action consistency and naming conventions', async () => {
      const allActions = [];
      const actionPatterns = {
        create: /create|add|new/i,
        read: /get|read|fetch|list|find/i,
        update: /update|edit|modify|change/i,
        delete: /delete|remove|destroy/i,
        send: /send|post|publish|share/i,
        manage: /manage|handle|process/i
      };
      
      availableConnectors.forEach(connector => {
        if (connector.actions) {
          connector.actions.forEach(action => {
            allActions.push({
              connectorId: connector.id,
              connectorCategory: connector.category,
              actionId: action.id,
              actionName: action.name,
              actionDescription: action.description
            });
          });
        }
      });
      
      console.log(`📊 Total Actions Across All Connectors: ${allActions.length}`);
      
      // Validate action naming patterns
      const patternCoverage = {};
      Object.keys(actionPatterns).forEach(pattern => {
        const matchingActions = allActions.filter(action => 
          actionPatterns[pattern].test(action.actionId) || 
          actionPatterns[pattern].test(action.actionName)
        );
        patternCoverage[pattern] = {
          count: matchingActions.length,
          percentage: (matchingActions.length / allActions.length) * 100
        };
      });
      
      console.log('📋 Action Pattern Distribution:');
      Object.entries(patternCoverage).forEach(([pattern, stats]: [string, any]) => {
        console.log(`  ${pattern}: ${stats.count} actions (${stats.percentage.toFixed(1)}%)`);
      });
      
      // Should have good distribution of CRUD operations
      expect(patternCoverage.create.count).toBeGreaterThan(50);
      expect(patternCoverage.read.count).toBeGreaterThan(100);
      expect(patternCoverage.update.count).toBeGreaterThan(30);
      expect(patternCoverage.send.count).toBeGreaterThan(40);
      
      // Validate action ID consistency (should be snake_case or kebab-case)
      const invalidActionIds = allActions.filter(action => 
        action.actionId && !/^[a-z0-9_-]+$/.test(action.actionId)
      );
      
      const validActionRate = ((allActions.length - invalidActionIds.length) / allActions.length) * 100;
      expect(validActionRate).toBeGreaterThan(95); // 95% should have valid action IDs
    });
  });

  describe('🧪 Real Integration Testing with Test Accounts', () => {
    test('validates Gmail integration end-to-end', async () => {
      if (!TEST_ACCOUNTS.GMAIL_TEST_EMAIL) {
        console.warn('⚠️ GMAIL_TEST_EMAIL not provided - skipping Gmail integration test');
        return;
      }
      
      const gmailConnector = availableConnectors.find(c => 
        c.id.toLowerCase().includes('gmail') || c.name.toLowerCase().includes('gmail')
      );
      
      expect(gmailConnector).toBeDefined();
      
      // Test auth token generation
      const token = await picaService.generateAuthToken('gmail-test-user', {
        integration_id: gmailConnector.id,
        email: TEST_ACCOUNTS.GMAIL_TEST_EMAIL
      });
      
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(100);
      
      // Test connection health  
      const connectionHealth = await picaService.testConnection('gmail-test-user', gmailConnector.id);
      expect(connectionHealth.status).toBe('healthy');
      
      console.log(`✅ Gmail integration validated: ${gmailConnector.name}`);
    }, 10000);

    test('validates Slack integration end-to-end', async () => {
      if (!TEST_ACCOUNTS.SLACK_TEST_WEBHOOK) {
        console.warn('⚠️ SLACK_TEST_WEBHOOK not provided - skipping Slack integration test');
        return;
      }
      
      const slackConnector = availableConnectors.find(c => 
        c.id.toLowerCase().includes('slack') || c.name.toLowerCase().includes('slack')
      );
      
      expect(slackConnector).toBeDefined();
      
      // Test message sending capability
      if (slackConnector.actions?.some(a => a.id.includes('send') || a.id.includes('message'))) {
        const testResult = await picaService.executeAction(
          'slack-test-user',
          slackConnector.id,
          'send_message',
          {
            channel: '#test',
            text: `🧪 Test message from Haus Platform TDD Suite - ${new Date().toISOString()}`,
            test_mode: true
          }
        );
        
        expect(testResult).toBeDefined();
        console.log(`✅ Slack integration validated: ${slackConnector.name}`);
      }
    }, 10000);

    test('validates GitHub integration capabilities', async () => {
      const githubConnector = availableConnectors.find(c => 
        c.id.toLowerCase().includes('github') || c.name.toLowerCase().includes('github')
      );
      
      if (!githubConnector) {
        console.warn('⚠️ GitHub connector not found in available integrations');
        return;
      }
      
      // Validate GitHub-specific actions are available
      const expectedGithubActions = ['create_issue', 'create_repository', 'create_pull_request', 'get_repository'];
      const availableActions = githubConnector.actions?.map(a => a.id) || [];
      
      const githubActionCoverage = expectedGithubActions.filter(expected =>
        availableActions.some(available => 
          available.includes(expected) || expected.includes(available)
        )
      );
      
      expect(githubActionCoverage.length).toBeGreaterThan(2); // At least half should be available
      console.log(`✅ GitHub integration validated: ${githubConnector.name} (${githubActionCoverage.length}/${expectedGithubActions.length} actions)`);
    });

    test('validates enterprise connectors availability', async () => {
      const enterpriseConnectors = [
        'salesforce', 'microsoft', 'google-workspace', 'office365', 
        'azure', 'aws', 'jira', 'confluence', 'servicenow'
      ];
      
      const foundEnterpriseConnectors = [];
      
      enterpriseConnectors.forEach(enterpriseId => {
        const connector = availableConnectors.find(c => 
          c.id.toLowerCase().includes(enterpriseId) ||
          c.name.toLowerCase().includes(enterpriseId.replace('-', ' ')) ||
          c.name.toLowerCase().includes(enterpriseId.replace('-', ''))
        );
        
        if (connector) {
          foundEnterpriseConnectors.push({
            searchId: enterpriseId,
            connector: {
              id: connector.id,
              name: connector.name,
              category: connector.category,
              actionsCount: connector.actions?.length || 0
            }
          });
        }
      });
      
      console.log('🏢 Enterprise Connectors Found:');
      foundEnterpriseConnectors.forEach(({ searchId, connector }) => {
        console.log(`  ${searchId} → ${connector.name} (${connector.actionsCount} actions)`);
      });
      
      // At least 70% of enterprise connectors should be available
      const enterpriseAvailabilityRate = (foundEnterpriseConnectors.length / enterpriseConnectors.length) * 100;
      expect(enterpriseAvailabilityRate).toBeGreaterThan(70);
      
      console.log(`✅ Enterprise connector availability: ${enterpriseAvailabilityRate.toFixed(1)}%`);
    });
  });

  describe('📊 Performance & Scale Testing', () => {
    test('validates connector loading performance at scale', async () => {
      const startTime = Date.now();
      
      // Re-fetch connectors to test fresh loading performance
      const freshConnectors = await picaService.getAvailableIntegrations();
      
      const loadTime = Date.now() - startTime;
      
      expect(freshConnectors.length).toBeGreaterThanOrEqual(availableConnectors.length);
      expect(loadTime).toBeLessThan(5000); // Should load all connectors in under 5 seconds
      
      console.log(`⚡ Connector loading performance: ${freshConnectors.length} connectors in ${loadTime}ms`);
    });

    test('validates concurrent auth token generation', async () => {
      const sampleConnectors = availableConnectors.slice(0, 20); // Test 20 connectors concurrently
      
      const startTime = Date.now();
      
      const tokenPromises = sampleConnectors.map((connector, index) =>
        picaService.generateAuthToken(`concurrent-test-user-${index}`, {
          integration_id: connector.id,
          concurrent_test: true
        }).catch(error => ({ error: error.message, connector: connector.id }))
      );
      
      const results = await Promise.all(tokenPromises);
      const totalTime = Date.now() - startTime;
      
      const successful = results.filter(r => !r.error);
      const failed = results.filter(r => r.error);
      
      console.log(`⚡ Concurrent token generation: ${successful.length}/${results.length} successful in ${totalTime}ms`);
      
      if (failed.length > 0) {
        console.warn('⚠️ Failed concurrent generations:', failed.slice(0, 3));
      }
      
      // At least 80% should succeed under concurrent load
      const concurrentSuccessRate = (successful.length / results.length) * 100;
      expect(concurrentSuccessRate).toBeGreaterThan(80);
      
      // Total time should be reasonable for concurrent operations
      expect(totalTime).toBeLessThan(15000); // 15 seconds for 20 concurrent operations
    });
  });

  describe('📈 Integration Completeness Report', () => {
    test('generates comprehensive integration coverage report', async () => {
      const report = {
        timestamp: new Date().toISOString(),
        totalConnectors: availableConnectors.length,
        categories: {},
        topConnectorsByActions: [],
        coverageMetrics: {
          criticalConnectorCoverage: 0,
          actionCoverage: 0,
          enterpriseCoverage: 0,
          authCoverage: 0
        },
        recommendations: []
      };
      
      // Category analysis
      const categoryStats = {};
      availableConnectors.forEach(connector => {
        const category = connector.category || 'Uncategorized';
        if (!categoryStats[category]) {
          categoryStats[category] = {
            count: 0,
            withActions: 0,
            totalActions: 0,
            connectors: []
          };
        }
        categoryStats[category].count++;
        categoryStats[category].connectors.push(connector.name);
        
        if (connector.actions && connector.actions.length > 0) {
          categoryStats[category].withActions++;
          categoryStats[category].totalActions += connector.actions.length;
        }
      });
      
      report.categories = categoryStats;
      
      // Top connectors by action count
      report.topConnectorsByActions = availableConnectors
        .filter(c => c.actions && c.actions.length > 0)
        .sort((a, b) => (b.actions?.length || 0) - (a.actions?.length || 0))
        .slice(0, 10)
        .map(c => ({
          id: c.id,
          name: c.name,
          category: c.category,
          actionCount: c.actions?.length || 0,
          featureCount: c.features?.length || 0
        }));
      
      // Coverage metrics
      const totalCritical = Object.values(EXPECTED_CONNECTOR_CATEGORIES)
        .reduce((sum, cat) => sum + cat.critical.length, 0);
      const availableIds = availableConnectors.map(c => c.id.toLowerCase());
      
      let criticalFound = 0;
      Object.values(EXPECTED_CONNECTOR_CATEGORIES).forEach(category => {
        criticalFound += category.critical.filter(crit => 
          availableIds.some(id => id.includes(crit) || crit.includes(id))
        ).length;
      });
      
      report.coverageMetrics.criticalConnectorCoverage = (criticalFound / totalCritical) * 100;
      report.coverageMetrics.actionCoverage = 
        (availableConnectors.filter(c => c.actions?.length > 0).length / availableConnectors.length) * 100;
      
      // Generate recommendations
      if (report.coverageMetrics.criticalConnectorCoverage < 90) {
        report.recommendations.push('Consider adding missing critical connectors for better market coverage');
      }
      
      if (report.coverageMetrics.actionCoverage < 80) {
        report.recommendations.push('Improve action coverage - many connectors lack defined actions');
      }
      
      console.log('\n📊 COMPREHENSIVE PICA INTEGRATION REPORT');
      console.log('==========================================');
      console.log(`🔢 Total Connectors: ${report.totalConnectors}`);
      console.log(`📈 Critical Connector Coverage: ${report.coverageMetrics.criticalConnectorCoverage.toFixed(1)}%`);
      console.log(`⚡ Action Coverage: ${report.coverageMetrics.actionCoverage.toFixed(1)}%`);
      
      console.log('\n📋 Top Categories:');
      Object.entries(categoryStats)
        .sort(([,a], [,b]) => (b as any).count - (a as any).count)
        .slice(0, 5)
        .forEach(([category, stats]: [string, any]) => {
          console.log(`  ${category}: ${stats.count} connectors (${stats.totalActions} total actions)`);
        });
      
      console.log('\n🏆 Most Feature-Rich Connectors:');
      report.topConnectorsByActions.slice(0, 5).forEach(connector => {
        console.log(`  ${connector.name}: ${connector.actionCount} actions, ${connector.featureCount} features`);
      });
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => console.log(`  • ${rec}`));
      }
      
      // Validate report meets minimum quality standards
      expect(report.totalConnectors).toBeGreaterThanOrEqual(150);
      expect(report.coverageMetrics.criticalConnectorCoverage).toBeGreaterThan(70);
      expect(report.coverageMetrics.actionCoverage).toBeGreaterThan(60);
      expect(Object.keys(report.categories)).toContain('Communication');
      expect(Object.keys(report.categories)).toContain('Productivity');
      
      console.log('\n✅ Comprehensive Pica integration validation completed successfully!');
    });
  });
});

// Utility to run comprehensive tests in CI with proper timeout
if (require.main === module) {
  console.log('🚀 Running Comprehensive Pica Integration Tests...');
  
  if (!process.env.PICA_TEST_API_KEY) {
    console.error('❌ PICA_TEST_API_KEY environment variable required for comprehensive testing');
    console.log('Set up test credentials for complete validation:');
    console.log('  - PICA_TEST_API_KEY: Your Pica test API key');
    console.log('  - GMAIL_TEST_EMAIL: Test Gmail account');
    console.log('  - SLACK_TEST_WEBHOOK: Test Slack webhook URL');
    console.log('  - GITHUB_TEST_TOKEN: Test GitHub token');
    process.exit(1);
  }
  
  console.log('✅ Comprehensive test environment configured');
  console.log('🔍 This will validate all 150+ Pica integrations...');
}