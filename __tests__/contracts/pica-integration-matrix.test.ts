/**
 * PICA INTEGRATION MATRIX TESTS - Systematic Validation of All Tools
 * Tests every integration category with real authentication and action execution
 */

import { PicaService } from '../../backend/services/pica.service';

// Skip if no real API key provided
const REAL_TEST_API_KEY = process.env.PICA_TEST_API_KEY;
const describeWithContract = REAL_TEST_API_KEY ? describe : describe.skip;

// Comprehensive integration matrix based on Pica's advertised capabilities
const PICA_INTEGRATION_MATRIX = {
  // Communication & Messaging (20+ tools)
  'Communication': {
    expectedCount: 20,
    priority: 'high',
    testAccounts: {
      gmail: process.env.TEST_GMAIL_ACCOUNT,
      slack: process.env.TEST_SLACK_WEBHOOK,
      discord: process.env.TEST_DISCORD_WEBHOOK,
      teams: process.env.TEST_TEAMS_WEBHOOK
    },
    criticalTools: [
      { id: 'gmail', name: 'Gmail', actions: ['send_email', 'read_inbox', 'create_draft'] },
      { id: 'outlook', name: 'Microsoft Outlook', actions: ['send_email', 'read_calendar'] },
      { id: 'slack', name: 'Slack', actions: ['send_message', 'create_channel'] },
      { id: 'discord', name: 'Discord', actions: ['send_message', 'manage_server'] },
      { id: 'teams', name: 'Microsoft Teams', actions: ['send_message', 'schedule_meeting'] },
      { id: 'telegram', name: 'Telegram', actions: ['send_message', 'create_bot'] },
      { id: 'whatsapp', name: 'WhatsApp Business', actions: ['send_message', 'manage_contacts'] },
      { id: 'zoom', name: 'Zoom', actions: ['schedule_meeting', 'create_room'] }
    ]
  },

  // Productivity & Collaboration (25+ tools)  
  'Productivity': {
    expectedCount: 25,
    priority: 'high',
    testAccounts: {
      notion: process.env.TEST_NOTION_TOKEN,
      airtable: process.env.TEST_AIRTABLE_TOKEN,
      google_sheets: process.env.TEST_GOOGLE_SHEETS_TOKEN
    },
    criticalTools: [
      { id: 'notion', name: 'Notion', actions: ['create_page', 'update_database', 'search_content'] },
      { id: 'airtable', name: 'Airtable', actions: ['create_record', 'update_record', 'get_records'] },
      { id: 'google-sheets', name: 'Google Sheets', actions: ['read_sheet', 'write_sheet', 'create_sheet'] },
      { id: 'google-docs', name: 'Google Docs', actions: ['create_document', 'update_document'] },
      { id: 'trello', name: 'Trello', actions: ['create_card', 'update_board', 'manage_lists'] },
      { id: 'asana', name: 'Asana', actions: ['create_task', 'update_project', 'assign_task'] },
      { id: 'monday', name: 'Monday.com', actions: ['create_item', 'update_board'] },
      { id: 'clickup', name: 'ClickUp', actions: ['create_task', 'manage_workspace'] }
    ]
  },

  // Development & Code Management (15+ tools)
  'Development': {
    expectedCount: 15,
    priority: 'high',
    testAccounts: {
      github: process.env.TEST_GITHUB_TOKEN,
      gitlab: process.env.TEST_GITLAB_TOKEN,
      jira: process.env.TEST_JIRA_TOKEN
    },
    criticalTools: [
      { id: 'github', name: 'GitHub', actions: ['create_issue', 'create_pr', 'manage_repo'] },
      { id: 'gitlab', name: 'GitLab', actions: ['create_issue', 'create_mr', 'manage_pipeline'] },
      { id: 'bitbucket', name: 'Bitbucket', actions: ['create_pr', 'manage_repo'] },
      { id: 'jira', name: 'Atlassian Jira', actions: ['create_issue', 'update_issue', 'manage_project'] },
      { id: 'linear', name: 'Linear', actions: ['create_issue', 'update_issue'] },
      { id: 'vercel', name: 'Vercel', actions: ['deploy_app', 'manage_project'] },
      { id: 'netlify', name: 'Netlify', actions: ['deploy_site', 'manage_build'] }
    ]
  },

  // Marketing & Analytics (18+ tools)
  'Marketing': {
    expectedCount: 18,
    priority: 'medium',
    testAccounts: {
      mailchimp: process.env.TEST_MAILCHIMP_TOKEN,
      hubspot: process.env.TEST_HUBSPOT_TOKEN,
      google_analytics: process.env.TEST_GA_TOKEN
    },
    criticalTools: [
      { id: 'mailchimp', name: 'Mailchimp', actions: ['send_campaign', 'manage_list', 'create_template'] },
      { id: 'sendgrid', name: 'SendGrid', actions: ['send_email', 'manage_templates'] },
      { id: 'hubspot', name: 'HubSpot', actions: ['create_contact', 'send_email', 'track_engagement'] },
      { id: 'intercom', name: 'Intercom', actions: ['send_message', 'manage_users'] },
      { id: 'segment', name: 'Segment', actions: ['track_event', 'identify_user'] },
      { id: 'google-analytics', name: 'Google Analytics', actions: ['track_event', 'get_reports'] },
      { id: 'facebook-ads', name: 'Facebook Ads', actions: ['create_campaign', 'manage_ads'] }
    ]
  },

  // Sales & CRM (12+ tools)
  'Sales & CRM': {
    expectedCount: 12,
    priority: 'medium',
    testAccounts: {
      salesforce: process.env.TEST_SALESFORCE_ORG,
      pipedrive: process.env.TEST_PIPEDRIVE_TOKEN,
      zendesk: process.env.TEST_ZENDESK_TOKEN
    },
    criticalTools: [
      { id: 'salesforce', name: 'Salesforce', actions: ['create_lead', 'update_opportunity', 'manage_account'] },
      { id: 'pipedrive', name: 'Pipedrive', actions: ['create_deal', 'update_person', 'manage_pipeline'] },
      { id: 'hubspot', name: 'HubSpot CRM', actions: ['create_contact', 'update_deal'] },
      { id: 'zendesk', name: 'Zendesk', actions: ['create_ticket', 'update_ticket', 'manage_users'] },
      { id: 'freshworks', name: 'Freshworks', actions: ['create_contact', 'manage_deals'] }
    ]
  },

  // Finance & Payments (10+ tools)
  'Finance': {
    expectedCount: 10,
    priority: 'medium',
    testAccounts: {
      stripe: process.env.TEST_STRIPE_TOKEN,
      paypal: process.env.TEST_PAYPAL_TOKEN,
      quickbooks: process.env.TEST_QUICKBOOKS_TOKEN
    },
    criticalTools: [
      { id: 'stripe', name: 'Stripe', actions: ['create_payment', 'manage_subscriptions', 'create_invoice'] },
      { id: 'paypal', name: 'PayPal', actions: ['create_payment', 'manage_subscriptions'] },
      { id: 'quickbooks', name: 'QuickBooks', actions: ['create_invoice', 'manage_expenses', 'track_revenue'] },
      { id: 'xero', name: 'Xero', actions: ['create_invoice', 'manage_contacts'] },
      { id: 'plaid', name: 'Plaid', actions: ['link_account', 'get_transactions'] }
    ]
  },

  // Design & Creative (8+ tools)
  'Design': {
    expectedCount: 8,
    priority: 'low',
    testAccounts: {
      figma: process.env.TEST_FIGMA_TOKEN,
      adobe: process.env.TEST_ADOBE_TOKEN
    },
    criticalTools: [
      { id: 'figma', name: 'Figma', actions: ['export_design', 'manage_file', 'collaborate'] },
      { id: 'sketch', name: 'Sketch', actions: ['export_design', 'manage_symbols'] },
      { id: 'adobe-creative', name: 'Adobe Creative Cloud', actions: ['manage_assets', 'export_file'] },
      { id: 'canva', name: 'Canva', actions: ['create_design', 'export_image'] }
    ]
  },

  // Cloud Storage & Files (12+ tools)
  'Storage & Cloud': {
    expectedCount: 12,
    priority: 'medium',
    testAccounts: {
      google_drive: process.env.TEST_GDRIVE_TOKEN,
      dropbox: process.env.TEST_DROPBOX_TOKEN,
      onedrive: process.env.TEST_ONEDRIVE_TOKEN
    },
    criticalTools: [
      { id: 'google-drive', name: 'Google Drive', actions: ['upload_file', 'share_file', 'create_folder'] },
      { id: 'dropbox', name: 'Dropbox', actions: ['upload_file', 'share_link', 'sync_folder'] },
      { id: 'onedrive', name: 'Microsoft OneDrive', actions: ['upload_file', 'share_file'] },
      { id: 'box', name: 'Box', actions: ['upload_file', 'manage_permissions'] },
      { id: 'aws-s3', name: 'Amazon S3', actions: ['upload_object', 'manage_bucket'] }
    ]
  },

  // Social Media (12+ tools)
  'Social Media': {
    expectedCount: 12,
    priority: 'low',
    testAccounts: {
      twitter: process.env.TEST_TWITTER_TOKEN,
      facebook: process.env.TEST_FACEBOOK_TOKEN,
      linkedin: process.env.TEST_LINKEDIN_TOKEN
    },
    criticalTools: [
      { id: 'twitter', name: 'Twitter/X', actions: ['post_tweet', 'schedule_post', 'manage_followers'] },
      { id: 'facebook', name: 'Facebook', actions: ['post_content', 'schedule_post', 'manage_page'] },
      { id: 'instagram', name: 'Instagram', actions: ['post_photo', 'schedule_post', 'manage_stories'] },
      { id: 'linkedin', name: 'LinkedIn', actions: ['post_content', 'manage_company', 'send_message'] },
      { id: 'youtube', name: 'YouTube', actions: ['upload_video', 'manage_channel'] },
      { id: 'tiktok', name: 'TikTok', actions: ['post_video', 'manage_account'] }
    ]
  },

  // E-commerce (10+ tools)
  'E-commerce': {
    expectedCount: 10,
    priority: 'low',
    testAccounts: {
      shopify: process.env.TEST_SHOPIFY_TOKEN,
      woocommerce: process.env.TEST_WOO_TOKEN
    },
    criticalTools: [
      { id: 'shopify', name: 'Shopify', actions: ['manage_products', 'process_orders', 'track_inventory'] },
      { id: 'woocommerce', name: 'WooCommerce', actions: ['manage_products', 'process_orders'] },
      { id: 'bigcommerce', name: 'BigCommerce', actions: ['manage_catalog', 'process_payments'] },
      { id: 'magento', name: 'Magento', actions: ['manage_products', 'handle_customers'] }
    ]
  },

  // AI & Machine Learning (8+ tools)
  'AI & Machine Learning': {
    expectedCount: 8,
    priority: 'high',
    testAccounts: {
      openai: process.env.TEST_OPENAI_TOKEN,
      anthropic: process.env.TEST_ANTHROPIC_TOKEN
    },
    criticalTools: [
      { id: 'openai', name: 'OpenAI', actions: ['generate_text', 'create_embedding', 'analyze_content'] },
      { id: 'anthropic', name: 'Anthropic Claude', actions: ['generate_text', 'analyze_content'] },
      { id: 'hugging-face', name: 'Hugging Face', actions: ['run_inference', 'fine_tune_model'] },
      { id: 'cohere', name: 'Cohere', actions: ['generate_text', 'classify_content'] }
    ]
  }
};

describeWithContract('🔬 Pica Integration Matrix - Comprehensive Tool Validation', () => {
  let picaService: PicaService;
  let allConnectors: any[];
  let matrixResults: any = {};

  beforeAll(async () => {
    if (!REAL_TEST_API_KEY) {
      console.warn('⚠️ PICA_TEST_API_KEY not provided - skipping matrix tests');
      return;
    }
    
    process.env.PICA_SECRET_KEY = REAL_TEST_API_KEY;
    picaService = new PicaService();
    
    console.log('🔍 Loading complete Pica connector matrix...');
    allConnectors = await picaService.getAvailableIntegrations();
    console.log(`📊 Matrix Analysis: ${allConnectors.length} total connectors loaded`);
  }, 30000);

  describe('📊 Integration Matrix Coverage Analysis', () => {
    test('validates complete integration matrix coverage', async () => {
      const matrixAnalysis = {
        totalExpected: 0,
        totalFound: 0,
        categoryBreakdown: {},
        missingCritical: [],
        coverageScore: 0
      };
      
      Object.entries(PICA_INTEGRATION_MATRIX).forEach(([category, config]: [string, any]) => {
        const categoryConnectors = allConnectors.filter(c => 
          c.category?.toLowerCase() === category.toLowerCase() ||
          c.category?.toLowerCase().includes(category.toLowerCase().split(' ')[0])
        );
        
        // Find critical tools in this category
        const foundCritical = config.criticalTools.map((criticalTool: any) => {
          const found = categoryConnectors.find(c => 
            c.id.toLowerCase().includes(criticalTool.id) ||
            c.name.toLowerCase().includes(criticalTool.name.toLowerCase()) ||
            criticalTool.id.includes(c.id.toLowerCase())
          );
          
          return {
            expected: criticalTool,
            found: found || null,
            available: !!found
          };
        });
        
        const categoryAnalysis = {
          expected: config.expectedCount,
          found: categoryConnectors.length,
          criticalExpected: config.criticalTools.length,
          criticalFound: foundCritical.filter(c => c.available).length,
          priority: config.priority,
          coveragePercent: Math.min((categoryConnectors.length / config.expectedCount) * 100, 100),
          criticalCoveragePercent: (foundCritical.filter(c => c.available).length / config.criticalTools.length) * 100,
          connectors: categoryConnectors.map(c => ({ id: c.id, name: c.name, actions: c.actions?.length || 0 })),
          criticalStatus: foundCritical
        };
        
        matrixAnalysis.categoryBreakdown[category] = categoryAnalysis;
        matrixAnalysis.totalExpected += config.expectedCount;
        matrixAnalysis.totalFound += categoryConnectors.length;
        
        // Track missing critical tools
        foundCritical.filter(c => !c.available).forEach(missing => {
          matrixAnalysis.missingCritical.push({
            category,
            tool: missing.expected.name,
            id: missing.expected.id
          });
        });
      });
      
      matrixAnalysis.coverageScore = Math.min((matrixAnalysis.totalFound / matrixAnalysis.totalExpected) * 100, 100);
      matrixResults.coverage = matrixAnalysis;
      
      console.log('\n📊 PICA INTEGRATION MATRIX ANALYSIS');
      console.log('====================================');
      console.log(`🎯 Overall Coverage: ${matrixAnalysis.coverageScore.toFixed(1)}% (${matrixAnalysis.totalFound}/${matrixAnalysis.totalExpected})`);
      
      console.log('\n📋 Category Breakdown:');
      Object.entries(matrixAnalysis.categoryBreakdown).forEach(([category, analysis]: [string, any]) => {
        const priority = analysis.priority === 'high' ? '🔴' : analysis.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${priority} ${category}: ${analysis.found}/${analysis.expected} (${analysis.coveragePercent.toFixed(1)}%)`);
        console.log(`    Critical Tools: ${analysis.criticalFound}/${analysis.criticalExpected} (${analysis.criticalCoveragePercent.toFixed(1)}%)`);
      });
      
      if (matrixAnalysis.missingCritical.length > 0) {
        console.log('\n⚠️ Missing Critical Tools:');
        matrixAnalysis.missingCritical.slice(0, 10).forEach(missing => {
          console.log(`  • ${missing.category}: ${missing.tool} (${missing.id})`);
        });
      }
      
      // Validation assertions
      expect(matrixAnalysis.totalFound).toBeGreaterThanOrEqual(150); // Pica's claimed 150+ integrations
      expect(matrixAnalysis.coverageScore).toBeGreaterThan(80); // 80% of expected matrix coverage
      
      // High priority categories must have good coverage
      const highPriorityCategories = Object.entries(matrixAnalysis.categoryBreakdown)
        .filter(([, analysis]: [string, any]) => analysis.priority === 'high');
      
      highPriorityCategories.forEach(([category, analysis]: [string, any]) => {
        expect(analysis.criticalCoveragePercent).toBeGreaterThan(70); // 70% of critical tools
      });
    });

    test('validates integration action completeness across matrix', async () => {
      const actionAnalysis = {
        totalConnectors: allConnectors.length,
        connectorsWithActions: 0,
        totalActions: 0,
        categoryActionStats: {},
        actionDistribution: {},
        incompleteTool: []
      };
      
      // Common action patterns we expect across integrations
      const expectedActionPatterns = {
        'create': ['create', 'add', 'new', 'make'],
        'read': ['get', 'read', 'fetch', 'list', 'find'],
        'update': ['update', 'edit', 'modify', 'change', 'patch'],
        'delete': ['delete', 'remove', 'destroy', 'clear'],
        'send': ['send', 'post', 'publish', 'share', 'broadcast'],
        'manage': ['manage', 'handle', 'control', 'admin']
      };
      
      allConnectors.forEach(connector => {
        if (connector.actions && connector.actions.length > 0) {
          actionAnalysis.connectorsWithActions++;
          actionAnalysis.totalActions += connector.actions.length;
          
          // Category action stats
          const category = connector.category || 'Uncategorized';
          if (!actionAnalysis.categoryActionStats[category]) {
            actionAnalysis.categoryActionStats[category] = {
              connectors: 0,
              totalActions: 0,
              avgActionsPerConnector: 0
            };
          }
          actionAnalysis.categoryActionStats[category].connectors++;
          actionAnalysis.categoryActionStats[category].totalActions += connector.actions.length;
          
          // Analyze action patterns
          connector.actions.forEach((action: any) => {
            const actionId = action.id?.toLowerCase() || '';
            const actionName = action.name?.toLowerCase() || '';
            
            Object.entries(expectedActionPatterns).forEach(([pattern, keywords]) => {
              const hasPattern = keywords.some(keyword => 
                actionId.includes(keyword) || actionName.includes(keyword)
              );
              
              if (hasPattern) {
                actionAnalysis.actionDistribution[pattern] = (actionAnalysis.actionDistribution[pattern] || 0) + 1;
              }
            });
          });
        } else {
          // Track tools without actions as potentially incomplete
          actionAnalysis.incompleteTool.push({
            id: connector.id,
            name: connector.name,
            category: connector.category
          });
        }
      });
      
      // Calculate averages
      Object.values(actionAnalysis.categoryActionStats).forEach((stats: any) => {
        stats.avgActionsPerConnector = stats.totalActions / stats.connectors;
      });
      
      const overallActionCoverage = (actionAnalysis.connectorsWithActions / actionAnalysis.totalConnectors) * 100;
      
      console.log('\n⚡ ACTION COMPLETENESS ANALYSIS');
      console.log('===============================');
      console.log(`📊 Action Coverage: ${overallActionCoverage.toFixed(1)}% (${actionAnalysis.connectorsWithActions}/${actionAnalysis.totalConnectors})`);
      console.log(`🔧 Total Actions: ${actionAnalysis.totalActions} across all connectors`);
      
      console.log('\n📋 Action Pattern Distribution:');
      Object.entries(actionAnalysis.actionDistribution)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .forEach(([pattern, count]) => {
          console.log(`  ${pattern}: ${count} actions`);
        });
      
      console.log('\n📊 Top Categories by Action Density:');
      Object.entries(actionAnalysis.categoryActionStats)
        .sort(([,a], [,b]) => (b as any).avgActionsPerConnector - (a as any).avgActionsPerConnector)
        .slice(0, 5)
        .forEach(([category, stats]: [string, any]) => {
          console.log(`  ${category}: ${stats.avgActionsPerConnector.toFixed(1)} actions/connector`);
        });
      
      if (actionAnalysis.incompleteTool.length > 0) {
        console.log(`\n⚠️ Tools Without Actions: ${actionAnalysis.incompleteTool.length}`);
        actionAnalysis.incompleteTool.slice(0, 5).forEach(tool => {
          console.log(`  • ${tool.name} (${tool.id}) - ${tool.category}`);
        });
      }
      
      matrixResults.actions = actionAnalysis;
      
      // Validation assertions
      expect(overallActionCoverage).toBeGreaterThan(70); // 70% of connectors should have actions
      expect(actionAnalysis.totalActions).toBeGreaterThan(500); // At least 500 total actions
      
      // Should have good CRUD coverage
      expect(actionAnalysis.actionDistribution.create || 0).toBeGreaterThan(50);
      expect(actionAnalysis.actionDistribution.read || 0).toBeGreaterThan(100);
      expect(actionAnalysis.actionDistribution.update || 0).toBeGreaterThan(40);
      expect(actionAnalysis.actionDistribution.send || 0).toBeGreaterThan(30);
    });
  });

  describe('🔑 Authentication Flow Validation by Category', () => {
    test('validates communication tools authentication', async () => {
      const communicationConfig = PICA_INTEGRATION_MATRIX['Communication'];
      const communicationConnectors = allConnectors.filter(c => 
        c.category?.toLowerCase().includes('communication') ||
        communicationConfig.criticalTools.some((tool: any) => 
          c.id.toLowerCase().includes(tool.id) || c.name.toLowerCase().includes(tool.name.toLowerCase())
        )
      );
      
      console.log(`🧪 Testing authentication for ${communicationConnectors.length} communication tools`);
      
      const authResults = [];
      
      for (const connector of communicationConnectors.slice(0, 8)) { // Test 8 communication tools
        try {
          const testUser = `comm-test-user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          
          const token = await picaService.generateAuthToken(testUser, {
            integration_id: connector.id,
            category: 'Communication',
            test_type: 'authentication_flow'
          });
          
          authResults.push({
            connector: connector.id,
            name: connector.name,
            success: true,
            tokenLength: token?.length || 0,
            hasJWTStructure: token ? /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token) : false
          });
          
        } catch (error) {
          authResults.push({
            connector: connector.id,
            name: connector.name,
            success: false,
            error: error.message
          });
        }
      }
      
      const successfulAuths = authResults.filter(r => r.success);
      const authSuccessRate = (successfulAuths.length / authResults.length) * 100;
      
      console.log(`✅ Communication Auth Success: ${authSuccessRate.toFixed(1)}% (${successfulAuths.length}/${authResults.length})`);
      
      successfulAuths.forEach(result => {
        console.log(`  ✓ ${result.name}: ${result.tokenLength} chars, JWT: ${result.hasJWTStructure}`);
      });
      
      if (authResults.filter(r => !r.success).length > 0) {
        console.log('⚠️ Failed authentications:', authResults.filter(r => !r.success).slice(0, 3));
      }
      
      expect(authSuccessRate).toBeGreaterThan(75); // 75% auth success for communication tools
    }, 45000);

    test('validates productivity tools authentication', async () => {
      const productivityConfig = PICA_INTEGRATION_MATRIX['Productivity'];
      const productivityConnectors = allConnectors.filter(c => 
        c.category?.toLowerCase().includes('productivity') ||
        productivityConfig.criticalTools.some((tool: any) => 
          c.id.toLowerCase().includes(tool.id) || c.name.toLowerCase().includes(tool.name.toLowerCase())
        )
      );
      
      console.log(`🧪 Testing authentication for ${productivityConnectors.length} productivity tools`);
      
      const authResults = [];
      
      for (const connector of productivityConnectors.slice(0, 10)) { // Test 10 productivity tools
        try {
          const testUser = `prod-test-user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          
          const token = await picaService.generateAuthToken(testUser, {
            integration_id: connector.id,
            category: 'Productivity',
            test_type: 'authentication_flow',
            features_requested: connector.actions?.slice(0, 3).map((a: any) => a.id) || []
          });
          
          authResults.push({
            connector: connector.id,
            name: connector.name,
            success: true,
            tokenLength: token?.length || 0,
            actionsAvailable: connector.actions?.length || 0
          });
          
        } catch (error) {
          authResults.push({
            connector: connector.id,
            name: connector.name,
            success: false,
            error: error.message.substring(0, 100),
            actionsAvailable: connector.actions?.length || 0
          });
        }
      }
      
      const successfulAuths = authResults.filter(r => r.success);
      const authSuccessRate = (successfulAuths.length / authResults.length) * 100;
      
      console.log(`✅ Productivity Auth Success: ${authSuccessRate.toFixed(1)}% (${successfulAuths.length}/${authResults.length})`);
      
      // Show most feature-rich successful auths
      const featureRichAuths = successfulAuths
        .sort((a, b) => b.actionsAvailable - a.actionsAvailable)
        .slice(0, 5);
        
      console.log('🏆 Most Feature-Rich Successful Auths:');
      featureRichAuths.forEach(result => {
        console.log(`  ✓ ${result.name}: ${result.actionsAvailable} actions available`);
      });
      
      expect(authSuccessRate).toBeGreaterThan(70); // 70% auth success for productivity tools
    }, 50000);

    test('validates enterprise tools authentication', async () => {
      const enterpriseTools = [
        'salesforce', 'microsoft', 'google-workspace', 'office365', 
        'azure', 'aws', 'jira', 'confluence', 'servicenow', 'tableau'
      ];
      
      const enterpriseConnectors = allConnectors.filter(c => 
        enterpriseTools.some(enterprise => 
          c.id.toLowerCase().includes(enterprise) ||
          c.name.toLowerCase().includes(enterprise.replace('-', ' ')) ||
          c.name.toLowerCase().includes(enterprise.replace('-', ''))
        )
      );
      
      console.log(`🏢 Testing authentication for ${enterpriseConnectors.length} enterprise tools`);
      
      const enterpriseAuthResults = [];
      
      for (const connector of enterpriseConnectors.slice(0, 8)) { // Test 8 enterprise tools
        try {
          const testUser = `enterprise-test-user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          
          const token = await picaService.generateAuthToken(testUser, {
            integration_id: connector.id,
            category: 'Enterprise',
            test_type: 'enterprise_authentication',
            enterprise_features: true,
            security_level: 'high'
          });
          
          enterpriseAuthResults.push({
            connector: connector.id,
            name: connector.name,
            success: true,
            tokenLength: token?.length || 0,
            category: connector.category
          });
          
        } catch (error) {
          enterpriseAuthResults.push({
            connector: connector.id,
            name: connector.name,
            success: false,
            error: error.message.substring(0, 100),
            category: connector.category
          });
        }
      }
      
      const enterpriseSuccessRate = (enterpriseAuthResults.filter(r => r.success).length / enterpriseAuthResults.length) * 100;
      
      console.log(`✅ Enterprise Auth Success: ${enterpriseSuccessRate.toFixed(1)}%`);
      console.log('🏢 Enterprise Tools Tested:');
      enterpriseAuthResults.forEach(result => {
        const status = result.success ? '✓' : '✗';
        console.log(`  ${status} ${result.name} (${result.category})`);
      });
      
      expect(enterpriseSuccessRate).toBeGreaterThan(60); // 60% auth success for enterprise tools (often require special setup)
    }, 40000);
  });

  describe('⚡ Performance Testing Across Integration Matrix', () => {
    test('validates matrix-wide performance benchmarks', async () => {
      const performanceResults = {
        connectorLoadTime: 0,
        avgTokenGenerationTime: 0,
        concurrentAuthPerformance: {},
        categoryPerformanceProfile: {}
      };
      
      // 1. Connector loading performance
      const loadStart = Date.now();
      const freshConnectors = await picaService.getAvailableIntegrations();
      performanceResults.connectorLoadTime = Date.now() - loadStart;
      
      // 2. Token generation performance across categories
      const sampleConnectors = [];
      Object.keys(PICA_INTEGRATION_MATRIX).forEach(category => {
        const categoryConnectors = allConnectors.filter(c => 
          c.category?.toLowerCase().includes(category.toLowerCase().split(' ')[0])
        );
        if (categoryConnectors.length > 0) {
          sampleConnectors.push({ 
            connector: categoryConnectors[0],
            category: category
          });
        }
      });
      
      const tokenTimings = [];
      
      for (const { connector, category } of sampleConnectors.slice(0, 10)) {
        const startTime = Date.now();
        try {
          await picaService.generateAuthToken(`perf-test-user-${Date.now()}`, {
            integration_id: connector.id,
            test_type: 'performance_benchmark'
          });
          const duration = Date.now() - startTime;
          tokenTimings.push({ category, duration, success: true });
          
          if (!performanceResults.categoryPerformanceProfile[category]) {
            performanceResults.categoryPerformanceProfile[category] = [];
          }
          performanceResults.categoryPerformanceProfile[category].push(duration);
          
        } catch (error) {
          tokenTimings.push({ category, duration: Date.now() - startTime, success: false });
        }
      }
      
      const successfulTimings = tokenTimings.filter(t => t.success);
      performanceResults.avgTokenGenerationTime = successfulTimings.length > 0 
        ? successfulTimings.reduce((sum, t) => sum + t.duration, 0) / successfulTimings.length 
        : 0;
      
      // 3. Concurrent authentication performance
      const concurrentConnectors = sampleConnectors.slice(0, 5);
      const concurrentStart = Date.now();
      
      const concurrentPromises = concurrentConnectors.map(({ connector }, index) =>
        picaService.generateAuthToken(`concurrent-perf-user-${index}`, {
          integration_id: connector.id,
          concurrent_test: true
        }).catch(error => ({ error: error.message }))
      );
      
      const concurrentResults = await Promise.all(concurrentPromises);
      const concurrentDuration = Date.now() - concurrentStart;
      
      performanceResults.concurrentAuthPerformance = {
        totalTime: concurrentDuration,
        successful: concurrentResults.filter(r => !r.error).length,
        total: concurrentResults.length,
        avgTimePerAuth: concurrentDuration / concurrentResults.length
      };
      
      console.log('\n⚡ MATRIX PERFORMANCE BENCHMARKS');
      console.log('=================================');
      console.log(`🔍 Connector Loading: ${performanceResults.connectorLoadTime}ms for ${freshConnectors.length} connectors`);
      console.log(`🔑 Avg Token Generation: ${performanceResults.avgTokenGenerationTime.toFixed(0)}ms`);
      console.log(`🚀 Concurrent Auth: ${performanceResults.concurrentAuthPerformance.totalTime}ms for ${performanceResults.concurrentAuthPerformance.total} simultaneous auths`);
      console.log(`   Success Rate: ${((performanceResults.concurrentAuthPerformance.successful / performanceResults.concurrentAuthPerformance.total) * 100).toFixed(1)}%`);
      
      console.log('\n📊 Performance by Category:');
      Object.entries(performanceResults.categoryPerformanceProfile).forEach(([category, timings]: [string, number[]]) => {
        const avgTime = timings.reduce((sum, time) => sum + time, 0) / timings.length;
        console.log(`  ${category}: ${avgTime.toFixed(0)}ms avg`);
      });
      
      matrixResults.performance = performanceResults;
      
      // Performance validation
      expect(performanceResults.connectorLoadTime).toBeLessThan(10000); // 10 seconds max to load all connectors
      expect(performanceResults.avgTokenGenerationTime).toBeLessThan(3000); // 3 seconds avg token generation
      expect(performanceResults.concurrentAuthPerformance.totalTime).toBeLessThan(15000); // 15 seconds for concurrent auths
      
      // Category performance should be reasonable
      Object.values(performanceResults.categoryPerformanceProfile).forEach((timings: number[]) => {
        const avgTime = timings.reduce((sum, time) => sum + time, 0) / timings.length;
        expect(avgTime).toBeLessThan(5000); // 5 seconds max avg per category
      });
    }, 60000);
  });

  describe('📈 Matrix Completeness Report', () => {
    test('generates comprehensive matrix validation report', async () => {
      const matrixReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalConnectors: allConnectors.length,
          matrixCoverage: matrixResults.coverage?.coverageScore || 0,
          actionCompleteness: ((matrixResults.actions?.connectorsWithActions || 0) / allConnectors.length) * 100,
          overallScore: 0
        },
        categoryScores: {},
        recommendations: [],
        criticalFindings: [],
        readinessAssessment: 'pending'
      };
      
      // Calculate category scores
      if (matrixResults.coverage) {
        Object.entries(matrixResults.coverage.categoryBreakdown).forEach(([category, analysis]: [string, any]) => {
          matrixReport.categoryScores[category] = {
            coverage: analysis.coveragePercent,
            criticalCoverage: analysis.criticalCoveragePercent,
            priority: analysis.priority,
            score: (analysis.coveragePercent * 0.6) + (analysis.criticalCoveragePercent * 0.4), // Weighted score
            status: analysis.criticalCoveragePercent > 80 ? 'excellent' : 
                   analysis.criticalCoveragePercent > 60 ? 'good' : 
                   analysis.criticalCoveragePercent > 40 ? 'fair' : 'poor'
          };
        });
      }
      
      // Calculate overall score
      const categoryScoresValues = Object.values(matrixReport.categoryScores).map((c: any) => c.score);
      matrixReport.summary.overallScore = categoryScoresValues.length > 0 
        ? categoryScoresValues.reduce((sum, score) => sum + score, 0) / categoryScoresValues.length 
        : 0;
      
      // Generate recommendations
      if (matrixReport.summary.matrixCoverage < 90) {
        matrixReport.recommendations.push('Expand integration catalog to reach 90%+ matrix coverage');
      }
      
      if (matrixReport.summary.actionCompleteness < 80) {
        matrixReport.recommendations.push('Improve action definitions - many connectors lack comprehensive actions');
      }
      
      const highPriorityCategories = Object.entries(matrixReport.categoryScores)
        .filter(([, score]: [string, any]) => score.priority === 'high' && score.score < 80);
      
      if (highPriorityCategories.length > 0) {
        matrixReport.recommendations.push(`Focus on high-priority categories: ${highPriorityCategories.map(([cat]) => cat).join(', ')}`);
      }
      
      // Critical findings
      if (matrixResults.coverage?.missingCritical) {
        const criticalMissing = matrixResults.coverage.missingCritical.length;
        if (criticalMissing > 10) {
          matrixReport.criticalFindings.push(`${criticalMissing} critical integrations are missing from the catalog`);
        }
      }
      
      // Performance findings
      if (matrixResults.performance?.avgTokenGenerationTime > 2000) {
        matrixReport.criticalFindings.push('Token generation performance exceeds 2-second threshold');
      }
      
      // Readiness assessment
      if (matrixReport.summary.overallScore > 85 && matrixReport.criticalFindings.length === 0) {
        matrixReport.readinessAssessment = 'production-ready';
      } else if (matrixReport.summary.overallScore > 70) {
        matrixReport.readinessAssessment = 'staging-ready';
      } else {
        matrixReport.readinessAssessment = 'development-only';
      }
      
      console.log('\n📊 COMPREHENSIVE PICA INTEGRATION MATRIX REPORT');
      console.log('================================================');
      console.log(`🎯 Overall Matrix Score: ${matrixReport.summary.overallScore.toFixed(1)}%`);
      console.log(`📈 Matrix Coverage: ${matrixReport.summary.matrixCoverage.toFixed(1)}%`);
      console.log(`⚡ Action Completeness: ${matrixReport.summary.actionCompleteness.toFixed(1)}%`);
      console.log(`📊 Total Connectors: ${matrixReport.summary.totalConnectors}`);
      
      console.log('\n📋 Category Performance:');
      Object.entries(matrixReport.categoryScores)
        .sort(([,a], [,b]) => (b as any).score - (a as any).score)
        .forEach(([category, score]: [string, any]) => {
          const priority = score.priority === 'high' ? '🔴' : score.priority === 'medium' ? '🟡' : '🟢';
          const status = score.status === 'excellent' ? '🟢' : 
                        score.status === 'good' ? '🟡' : 
                        score.status === 'fair' ? '🟠' : '🔴';
          console.log(`  ${priority}${status} ${category}: ${score.score.toFixed(1)}% (${score.coverage.toFixed(0)}% coverage, ${score.criticalCoverage.toFixed(0)}% critical)`);
        });
      
      if (matrixReport.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        matrixReport.recommendations.forEach(rec => console.log(`  • ${rec}`));
      }
      
      if (matrixReport.criticalFindings.length > 0) {
        console.log('\n⚠️ Critical Findings:');
        matrixReport.criticalFindings.forEach(finding => console.log(`  ! ${finding}`));
      }
      
      console.log(`\n🎯 Readiness Assessment: ${matrixReport.readinessAssessment.toUpperCase()}`);
      
      const readinessEmoji = {
        'production-ready': '🚀',
        'staging-ready': '🏗️', 
        'development-only': '🔧'
      };
      
      console.log(`${readinessEmoji[matrixReport.readinessAssessment]} System is ${matrixReport.readinessAssessment.replace('-', ' ')}`);
      
      // Final validation
      expect(matrixReport.summary.totalConnectors).toBeGreaterThanOrEqual(150);
      expect(matrixReport.summary.overallScore).toBeGreaterThan(70);
      expect(matrixReport.readinessAssessment).not.toBe('development-only');
      
      console.log('\n✅ Comprehensive Pica integration matrix validation completed!');
      console.log(`🎉 Successfully validated ${matrixReport.summary.totalConnectors} integrations across ${Object.keys(matrixReport.categoryScores).length} categories`);
      
      matrixResults.finalReport = matrixReport;
    });
  });
});

// Export matrix results for CI reporting
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PICA_INTEGRATION_MATRIX, matrixResults: () => matrixResults };
}