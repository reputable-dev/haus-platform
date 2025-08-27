/**
 * END-TO-END USER JOURNEY TESTS - Complete Integration Lifecycle
 * Tests real user scenarios from onboarding through full integration management
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('🚀 Complete Integration User Journey', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { notifications: 'YES', camera: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Navigate to clean state
    await element(by.text('Settings')).tap();
    await waitFor(element(by.text('Integrations'))).toBeVisible().withTimeout(5000);
  });

  describe('🎯 First-Time User Complete Flow', () => {
    test('new user discovers, connects, and uses Gmail integration', async () => {
      // 1. User opens integrations from settings
      await element(by.text('Integrations')).tap();
      
      // 2. User sees onboarding welcome screen
      await waitFor(element(by.id('integrations-welcome'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Connect Your Favorite Tools'))).toBeVisible();
      await detoxExpect(element(by.text('150+ integrations available'))).toBeVisible();
      
      // 3. User browses available integrations
      await element(by.id('browse-integrations-btn')).tap();
      
      await waitFor(element(by.text('Gmail'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Slack'))).toBeVisible();
      await detoxExpect(element(by.text('Notion'))).toBeVisible();
      
      // 4. User views Gmail details
      await element(by.text('Gmail')).tap();
      
      await waitFor(element(by.text('Send emails'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Read emails'))).toBeVisible();
      await detoxExpect(element(by.text('Manage labels'))).toBeVisible();
      await detoxExpect(element(by.text('Communication'))).toBeVisible();
      
      // 5. User decides to connect Gmail
      await element(by.id('connect-gmail-btn')).tap();
      
      // 6. Auth modal opens with OAuth flow
      await waitFor(element(by.id('integration-auth-modal'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Connecting to Gmail...'))).toBeVisible();
      await detoxExpect(element(by.id('auth-webview'))).toBeVisible();
      
      // 7. Simulate successful OAuth (mock OAuth callback)
      // In real e2e test, this would involve actual OAuth flow
      await element(by.id('mock-oauth-success')).tap(); // Test-only button
      
      // 8. Success screen appears
      await waitFor(element(by.text('Gmail Connected Successfully!'))).toBeVisible().withTimeout(10000);
      await detoxExpect(element(by.text('You can now send emails and manage your inbox'))).toBeVisible();
      
      await element(by.text('Continue')).tap();
      
      // 9. Back to integrations list - Gmail now shows as connected
      await waitFor(element(by.text('Connected'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('user@testaccount.com'))).toBeVisible(); // Mock email
      await detoxExpect(element(by.id('gmail-connected-badge'))).toBeVisible();
      
      // 10. User tests the connection
      await element(by.text('Test Connection')).tap();
      
      await waitFor(element(by.text('Testing connection...'))).toBeVisible().withTimeout(2000);
      await waitFor(element(by.text('Connection healthy ✅'))).toBeVisible().withTimeout(5000);
      
      // 11. User executes a test action
      await element(by.id('gmail-actions-btn')).tap();
      await element(by.text('Send Test Email')).tap();
      
      // 12. Action form appears
      await waitFor(element(by.id('send-email-form'))).toBeVisible().withTimeout(3000);
      await element(by.id('email-to-input')).typeText('test@example.com');
      await element(by.id('email-subject-input')).typeText('Test from Haus Platform');
      await element(by.id('email-body-input')).typeText('This is a test email from your new integration!');
      
      await element(by.id('send-email-btn')).tap();
      
      // 13. Success confirmation
      await waitFor(element(by.text('Email sent successfully!'))).toBeVisible().withTimeout(10000);
      await detoxExpect(element(by.text('Message ID:'))).toBeVisible();
      
      // 14. User returns to integrations overview
      await element(by.text('Done')).tap();
      
      // 15. User sees updated statistics
      await detoxExpect(element(by.text('1 Connected'))).toBeVisible();
      await detoxExpect(element(by.text('149 Available'))).toBeVisible();
    }, 60000);
    
    test('user connects multiple integrations in sequence', async () => {
      await element(by.text('Integrations')).tap();
      
      // Connect Gmail
      await element(by.text('Gmail')).tap();
      await element(by.id('connect-gmail-btn')).tap();
      await element(by.id('mock-oauth-success')).tap();
      await element(by.text('Continue')).tap();
      
      // Connect Slack without leaving the screen
      await element(by.text('Slack')).tap();
      await element(by.id('connect-slack-btn')).tap();
      await element(by.id('mock-oauth-success')).tap();
      await element(by.text('Continue')).tap();
      
      // Connect Notion
      await element(by.text('Notion')).tap();
      await element(by.id('connect-notion-btn')).tap();
      await element(by.id('mock-oauth-success')).tap();
      await element(by.text('Continue')).tap();
      
      // Verify all three are connected
      await waitFor(element(by.text('3 Connected'))).toBeVisible().withTimeout(5000);
      
      const connectedBadges = element(by.id('connected-badge'));
      await detoxExpect(connectedBadges.atIndex(0)).toBeVisible(); // Gmail
      await detoxExpect(connectedBadges.atIndex(1)).toBeVisible(); // Slack
      await detoxExpect(connectedBadges.atIndex(2)).toBeVisible(); // Notion
    }, 45000);
  });

  describe('🔧 Power User Management Flows', () => {
    test('experienced user manages connections and troubleshoots issues', async () => {
      // Setup: User already has Gmail connected but it's having issues
      await element(by.text('Integrations')).tap();
      
      // 1. User notices connection error status
      await waitFor(element(by.text('Connection Error'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Authentication expired'))).toBeVisible();
      await detoxExpect(element(by.id('error-badge'))).toBeVisible();
      
      // 2. User views connection details
      await element(by.text('Gmail')).tap();
      await element(by.id('connection-details-btn')).tap();
      
      // 3. Connection health dashboard shows issues
      await waitFor(element(by.text('Connection Health'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Status: Error'))).toBeVisible();
      await detoxExpect(element(by.text('Last successful sync: 2 hours ago'))).toBeVisible();
      await detoxExpect(element(by.text('Error: Authentication token expired'))).toBeVisible();
      
      // 4. User tries to refresh connection
      await element(by.id('refresh-connection-btn')).tap();
      
      await waitFor(element(by.text('Refreshing connection...'))).toBeVisible().withTimeout(2000);
      await waitFor(element(by.text('Refresh failed - Re-authentication required'))).toBeVisible().withTimeout(5000);
      
      // 5. User initiates re-authentication
      await element(by.id('reauthenticate-btn')).tap();
      
      await waitFor(element(by.id('integration-auth-modal'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Re-authenticating Gmail...'))).toBeVisible();
      
      // 6. Complete OAuth flow
      await element(by.id('mock-oauth-success')).tap();
      
      // 7. Verify connection is restored
      await waitFor(element(by.text('Connection restored successfully!'))).toBeVisible().withTimeout(10000);
      await element(by.text('Continue')).tap();
      
      // 8. Status should now show healthy
      await waitFor(element(by.text('Connected'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.id('healthy-badge'))).toBeVisible();
      
      // 9. User tests connection to confirm
      await element(by.text('Test Connection')).tap();
      await waitFor(element(by.text('Connection healthy ✅'))).toBeVisible().withTimeout(5000);
    }, 45000);
    
    test('user manages integration permissions and data access', async () => {
      await element(by.text('Integrations')).tap();
      
      // 1. User accesses Gmail settings
      await element(by.text('Gmail')).tap();
      await element(by.id('integration-settings-btn')).tap();
      
      // 2. Permission management screen
      await waitFor(element(by.text('Permission Settings'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Email Access'))).toBeVisible();
      await detoxExpect(element(by.text('Contact Access'))).toBeVisible();
      await detoxExpect(element(by.text('Calendar Access'))).toBeVisible();
      
      // 3. User reviews current permissions
      await detoxExpect(element(by.id('email-access-enabled'))).toBeVisible();
      await detoxExpect(element(by.id('contact-access-disabled'))).toBeVisible();
      await detoxExpect(element(by.id('calendar-access-disabled'))).toBeVisible();
      
      // 4. User enables additional permissions
      await element(by.id('contact-access-toggle')).tap();
      await element(by.text('Confirm')).tap(); // Permission confirmation dialog
      
      // 5. Re-authentication required for new permissions
      await waitFor(element(by.text('Additional permissions require re-authentication'))).toBeVisible().withTimeout(3000);
      await element(by.text('Authenticate')).tap();
      
      await waitFor(element(by.id('integration-auth-modal'))).toBeVisible().withTimeout(5000);
      await element(by.id('mock-oauth-success')).tap();
      
      // 6. Verify new permissions are active
      await waitFor(element(by.id('contact-access-enabled'))).toBeVisible().withTimeout(5000);
      
      // 7. User views data usage statistics
      await element(by.id('data-usage-btn')).tap();
      
      await waitFor(element(by.text('Data Usage'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Emails accessed: 1,234'))).toBeVisible();
      await detoxExpect(element(by.text('Last sync: 5 minutes ago'))).toBeVisible();
      await detoxExpect(element(by.text('Data stored: 12.5 MB'))).toBeVisible();
    }, 40000);
  });

  describe('💼 Business User Workflow Management', () => {
    test('user creates automation workflow using multiple integrations', async () => {
      // Setup: User has Gmail, Slack, and Notion connected
      await element(by.text('Integrations')).tap();
      
      // 1. User accesses workflow builder
      await element(by.id('create-workflow-btn')).tap();
      
      await waitFor(element(by.text('Create Automation Workflow'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Connect your integrations to automate tasks'))).toBeVisible();
      
      // 2. User selects trigger integration
      await element(by.text('Choose Trigger')).tap();
      await element(by.text('Gmail')).tap();
      await element(by.text('New Email Received')).tap();
      
      // 3. User configures trigger conditions
      await waitFor(element(by.text('Configure Trigger'))).toBeVisible().withTimeout(3000);
      await element(by.id('sender-filter-input')).typeText('client@company.com');
      await element(by.id('subject-contains-input')).typeText('urgent');
      
      await element(by.text('Next')).tap();
      
      // 4. User selects action integration
      await element(by.text('Choose Action')).tap();
      await element(by.text('Slack')).tap();
      await element(by.text('Send Message')).tap();
      
      // 5. User configures action
      await waitFor(element(by.text('Configure Action'))).toBeVisible().withTimeout(3000);
      await element(by.id('slack-channel-select')).tap();
      await element(by.text('#urgent-alerts')).tap();
      await element(by.id('message-template-input')).typeText('🚨 Urgent email from {{sender}}: {{subject}}');
      
      await element(by.text('Next')).tap();
      
      // 6. User adds second action (Notion)
      await element(by.text('Add Another Action')).tap();
      await element(by.text('Notion')).tap();
      await element(by.text('Create Page')).tap();
      
      await element(by.id('notion-database-select')).tap();
      await element(by.text('Client Communications')).tap();
      await element(by.id('page-title-input')).typeText('Urgent: {{subject}}');
      
      await element(by.text('Next')).tap();
      
      // 7. User reviews and activates workflow
      await waitFor(element(by.text('Review Workflow'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Gmail → Slack + Notion'))).toBeVisible();
      await detoxExpect(element(by.text('When: Urgent email from client'))).toBeVisible();
      await detoxExpected(element(by.text('Then: Alert team & log in Notion'))).toBeVisible();
      
      await element(by.id('workflow-name-input')).typeText('Urgent Client Email Handler');
      await element(by.id('activate-workflow-btn')).tap();
      
      // 8. Workflow is active
      await waitFor(element(by.text('Workflow Created Successfully!'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Your automation is now active'))).toBeVisible();
      
      await element(by.text('View Workflows')).tap();
      
      // 9. User sees workflow in active list
      await waitFor(element(by.text('Urgent Client Email Handler'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Active'))).toBeVisible();
      await detoxExpect(element(by.text('0 executions'))).toBeVisible();
    }, 60000);
    
    test('user monitors and manages existing workflows', async () => {
      await element(by.text('Integrations')).tap();
      await element(by.text('Workflows')).tap();
      
      // 1. User views workflow dashboard
      await waitFor(element(by.text('Active Workflows'))).toBeVisible().withTimeout(5000);
      await detoxExpect(element(by.text('Urgent Client Email Handler'))).toBeVisible();
      await detoxExpect(element(by.text('12 executions today'))).toBeVisible();
      
      // 2. User views workflow details and performance
      await element(by.text('Urgent Client Email Handler')).tap();
      
      await waitFor(element(by.text('Workflow Performance'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Success rate: 98.5%'))).toBeVisible();
      await detoxExpect(element(by.text('Average execution time: 2.3s'))).toBeVisible();
      await detoxExpect(element(by.text('Total executions: 247'))).toBeVisible();
      
      // 3. User views execution history
      await element(by.id('execution-history-btn')).tap();
      
      await waitFor(element(by.text('Recent Executions'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('2 minutes ago - Success'))).toBeVisible();
      await detoxExpect(element(by.text('1 hour ago - Success'))).toBeVisible();
      await detoxExpect(element(by.text('3 hours ago - Failed'))).toBeVisible();
      
      // 4. User investigates failed execution
      await element(by.text('3 hours ago - Failed')).tap();
      
      await waitFor(element(by.text('Execution Details'))).toBeVisible().withTimeout(3000);
      await detoxExpect(element(by.text('Error: Slack channel not found'))).toBeVisible();
      await detoxExpect(element(by.text('Duration: 5.2s'))).toBeVisible();
      
      // 5. User fixes the workflow
      await element(by.id('edit-workflow-btn')).tap();
      await element(by.id('slack-channel-select')).tap();
      await element(by.text('#general')).tap(); // Fix channel
      await element(by.text('Save Changes')).tap();
      
      // 6. User manually tests the workflow
      await element(by.id('test-workflow-btn')).tap();
      
      await waitFor(element(by.text('Testing workflow...'))).toBeVisible().withTimeout(2000);
      await waitFor(element(by.text('Test completed successfully!'))).toBeVisible().withTimeout(10000);
      
      await detoxExpect(element(by.text('✅ Gmail trigger simulated'))).toBeVisible();
      await detoxExpect(element(by.text('✅ Slack message sent'))).toBeVisible();
      await detoxExpect(element(by.text('✅ Notion page created'))).toBeVisible();
    }, 50000);
  });

  describe('🚨 Error Recovery and Edge Cases', () => {
    test('user handles network disconnection gracefully', async () => {
      await element(by.text('Integrations')).tap();
      
      // 1. Simulate network disconnection
      await device.shake(); // Test-only trigger for network simulation
      await element(by.id('simulate-network-offline')).tap();
      
      // 2. User tries to connect new integration
      await element(by.text('Slack')).tap();
      await element(by.id('connect-slack-btn')).tap();
      
      // 3. Offline error handling
      await waitFor(element(by.text('Connection Failed'))).toBeVisible().withTimeout(5000);
      await detoxExpected(element(by.text('Unable to connect to Slack. Check your internet connection.'))).toBeVisible();
      await detoxExpected(element(by.text('Retry'))).toBeVisible();
      
      // 4. User enables network and retries
      await element(by.id('simulate-network-online')).tap();
      await element(by.text('Retry')).tap();
      
      // 5. Connection succeeds
      await waitFor(element(by.id('integration-auth-modal'))).toBeVisible().withTimeout(5000);
      await element(by.id('mock-oauth-success')).tap();
      await waitFor(element(by.text('Slack Connected Successfully!'))).toBeVisible().withTimeout(10000);
    }, 30000);
    
    test('user recovers from app crash during OAuth flow', async () => {
      await element(by.text('Integrations')).tap();
      
      // 1. Start OAuth flow
      await element(by.text('Gmail')).tap();
      await element(by.id('connect-gmail-btn')).tap();
      await waitFor(element(by.id('integration-auth-modal'))).toBeVisible().withTimeout(5000);
      
      // 2. Simulate app crash/restart during OAuth
      await device.reloadReactNative();
      
      // 3. App recovers and shows appropriate state
      await element(by.text('Settings')).tap();
      await element(by.text('Integrations')).tap();
      
      // 4. User should see connection pending or retry option
      await waitFor(element(by.text('Connection Incomplete'))).toBeVisible().withTimeout(5000);
      await detoxExpected(element(by.text('Complete Gmail Connection'))).toBeVisible();
      
      // 5. User completes the connection
      await element(by.text('Complete Connection')).tap();
      await waitFor(element(by.id('integration-auth-modal'))).toBeVisible().withTimeout(5000);
      await element(by.id('mock-oauth-success')).tap();
      
      // 6. Connection completes successfully
      await waitFor(element(by.text('Gmail Connected Successfully!'))).toBeVisible().withTimeout(10000);
    }, 35000);
  });

  describe('♿ Accessibility User Journeys', () => {
    test('visually impaired user navigates integrations with screen reader', async () => {
      await element(by.text('Settings')).tap();
      
      // 1. User accesses integrations
      await detoxExpected(element(by.label('Integrations setting'))).toBeVisible();
      await element(by.label('Integrations setting')).tap();
      
      // 2. Screen reader describes the page
      await waitFor(element(by.label('Available integrations list'))).toBeVisible().withTimeout(5000);
      
      // 3. User navigates to Gmail
      await detoxExpected(element(by.label('Gmail integration, not connected'))).toBeVisible();
      await element(by.label('Gmail integration, not connected')).tap();
      
      // 4. User receives audio feedback about Gmail
      await waitFor(element(by.label('Gmail details, Email management tool'))).toBeVisible().withTimeout(3000);
      
      // 5. User activates connection
      await element(by.label('Connect Gmail button')).tap();
      
      // 6. Auth flow provides accessibility feedback
      await waitFor(element(by.label('Gmail authentication in progress'))).toBeVisible().withTimeout(5000);
      
      await element(by.id('mock-oauth-success')).tap();
      
      // 7. Success feedback is accessible
      await waitFor(element(by.label('Gmail connected successfully'))).toBeVisible().withTimeout(10000);
    }, 40000);
  });

  afterEach(async () => {
    // Clean up test state
    await element(by.id('reset-test-state')).tap().catch(() => {}); // Ignore if not found
  });

  afterAll(async () => {
    await device.terminateApp();
  });
});