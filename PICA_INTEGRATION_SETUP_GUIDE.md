# 🔗 Pica Tools & AuthKit Integration Guide

## 🎉 Complete Integration Setup

Your Haus Platform now includes **full Pica tools integration** with AuthKit authentication, allowing users to connect their favorite apps and services directly through **Settings > Integrations**.

## 📋 What's Included

### ✅ Frontend Components
- **Settings > Integrations Screen** - Complete UI for managing connections
- **IntegrationAuthModal** - WebView-based OAuth authentication
- **IntegrationStatusBadge** - Visual status indicators
- **useIntegrations Hook** - React Query-powered data management

### ✅ Backend Infrastructure
- **PicaService** - Complete Pica SDK integration
- **tRPC Routes** - Type-safe API endpoints
- **Secure Token Storage** - Expo SecureStore implementation
- **Health Monitoring** - Connection status and metrics

### ✅ Security & Testing
- **Comprehensive Test Suite** - Unit and integration tests
- **Security Controls** - Token encryption and validation
- **Error Handling** - Graceful failure management

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Backend dependencies (add to package.json)
npm install @picahq/ai @picahq/authkit-node

# Frontend dependencies (already configured in your project)
npx expo install expo-secure-store expo-web-browser expo-linking
npm install react-native-webview
```

### 2. Environment Configuration

Add to your `.env` file:

```bash
# Pica Configuration
PICA_SECRET_KEY=your_pica_secret_key_here
PICA_SERVER_URL=https://api.picaos.com

# Optional: For enhanced search capabilities
BRAVE_API_KEY=your_brave_api_key_here
```

### 3. Update App Configuration

Add to your `app.json`:

```json
{
  "expo": {
    "scheme": "haus",
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-linking",
        {
          "scheme": "haus"
        }
      ]
    ]
  }
}
```

### 4. Update tRPC Router

Add to your main tRPC router:

```typescript
// backend/trpc/app-router.ts
import { integrationsRouter } from './routes/integrations/route';

export const appRouter = router({
  // ... your existing routes
  integrations: integrationsRouter,
});
```

### 5. Test the Integration

```bash
# Run the test suite
npm test -- __tests__/integrations/

# Start the development server
npm run start

# Navigate to Settings > Integrations in your app
```

## 🎯 How Users Will Use It

### For End Users:

1. **Navigate to Settings**
   - Open app → Go to Settings tab → Tap "Integrations"

2. **Browse Available Integrations**
   - See popular integrations (Gmail, Slack, Notion, etc.)
   - View all 150+ available services
   - Read descriptions and features

3. **Connect Services**
   - Tap "Connect" on desired integration
   - Complete OAuth flow in secure WebView
   - Grant permissions through service's official interface

4. **Manage Connections**
   - View connection status and health
   - Test connections
   - Disconnect when needed
   - Monitor usage statistics

### For Developers:

1. **Use Integration Data**
   ```typescript
   const { integrations, connectedIntegrations } = useIntegrations();
   
   // Execute actions on connected services
   const executeAction = useIntegrationAction('gmail');
   await executeAction({
     action: 'send_email',
     data: { to: 'user@example.com', subject: 'Hello!' }
   });
   ```

2. **Monitor Health**
   ```typescript
   const { healthStatus } = useIntegrationHealth();
   
   // Check if all integrations are healthy
   const hasErrors = healthStatus?.some(h => h.status === 'error');
   ```

## 📱 UI Features

### Settings > Integrations Screen
- **Popular Integrations Section** - Most commonly used services
- **Search and Categories** - Easy discovery
- **Visual Status Indicators** - Clear connection health
- **Security Banners** - OAuth 2.0 and encryption info

### Authentication Modal
- **WebView Integration** - Native OAuth flow
- **Browser Fallback** - Alternative authentication method
- **Progress Indicators** - Clear loading states
- **Error Handling** - Graceful failure recovery

### Status Management
- **Real-time Health Checks** - Connection monitoring
- **Usage Statistics** - Track API calls and performance
- **Error Reporting** - Detailed failure information

## 🔐 Security Features

### Token Security
- **Expo SecureStore** - Hardware-backed encryption
- **Token Rotation** - Automatic refresh handling
- **Scope Management** - Minimal required permissions

### Authentication Flow
- **OAuth 2.0 Compliant** - Industry standard security
- **HTTPS Only** - Encrypted communication
- **Custom URL Schemes** - Secure callback handling

### Data Protection
- **No Password Storage** - OAuth tokens only
- **Encrypted Storage** - All sensitive data encrypted
- **Automatic Cleanup** - Expired tokens removed

## 🧪 Available Integrations

### Popular Services (Pre-configured)
- **Communication**: Gmail, Slack, Discord, Teams
- **Productivity**: Notion, Airtable, Trello, Asana
- **Development**: GitHub, GitLab, Bitbucket, Jira
- **CRM**: Salesforce, HubSpot, Pipedrive
- **Finance**: Stripe, QuickBooks, Xero
- **Storage**: Google Drive, Dropbox, OneDrive

### Full Platform Support
- **150+ Integrations** through Pica's OneTool SDK
- **21,000+ Actions** via Passthrough API
- **Custom Integrations** can be added through Pica

## 📊 Usage Analytics

### For Platform Owners
- Track which integrations are most popular
- Monitor connection health across users
- Analyze usage patterns and performance
- Identify integration issues early

### For Users
- View personal usage statistics
- Monitor API call limits
- Track integration performance
- Get health notifications

## 🔧 Customization Options

### Theming
```typescript
// Customize integration cards
<IntegrationCard
  integration={integration}
  theme="dark"
  size="large"
  showMetrics={true}
/>
```

### Custom Actions
```typescript
// Add custom integration actions
const customActions = [
  {
    id: 'bulk_email',
    name: 'Send Bulk Email',
    description: 'Send emails to multiple recipients',
    integration: 'gmail'
  }
];
```

### Filtering and Search
```typescript
// Filter integrations by category
const communicationIntegrations = integrations.filter(
  i => i.category === 'Communication'
);

// Search integrations
const searchResults = integrations.filter(
  i => i.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

## 🐛 Troubleshooting

### Common Issues

#### "Failed to load authentication page"
- Check internet connection
- Try "Open in Browser" option
- Verify Pica server URL in environment variables

#### "Integration not connecting"
- Ensure service credentials are valid
- Check OAuth redirect URL configuration
- Verify integration is enabled in Pica dashboard

#### "Token expired" errors
- Tokens are automatically refreshed
- Manually disconnect and reconnect if persistent
- Check secure storage permissions

### Debug Mode
```typescript
// Enable debug logging
process.env.DEBUG_INTEGRATIONS = 'true';
```

### Health Checks
```bash
# Test Pica service connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.picaos.com/health

# Test integration endpoints
npm run test:integrations
```

## 📚 Additional Resources

### Documentation Links
- [Pica Platform Docs](https://docs.picaos.com)
- [AuthKit Guide](https://docs.picaos.com/authkit)
- [OneTool SDK Reference](https://docs.picaos.com/onetool)
- [Expo SecureStore Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)

### Code Examples
- See `__tests__/integrations/` for comprehensive test examples
- Check `hooks/useIntegrations.ts` for usage patterns
- Review `components/integrations/` for UI implementations

## 🆘 Support

### Getting Help
1. **Check Integration Status** in Settings > Integrations
2. **Review Error Messages** in app and console logs
3. **Test Connections** using built-in health checks
4. **Contact Support** with specific error messages

### Reporting Issues
- Include integration name and error message
- Provide steps to reproduce the issue
- Share relevant console logs (without sensitive data)
- Mention device type and OS version

---

## 🎉 Success! 

Your users can now:
- ✅ **Connect 150+ services** through a beautiful, native interface
- ✅ **Securely authenticate** with OAuth 2.0 and encrypted storage  
- ✅ **Monitor connection health** with real-time status updates
- ✅ **Execute actions** across connected platforms
- ✅ **Track usage** and performance metrics

The integration provides a **Zapier-like experience** directly within your React Native app, allowing users to automate workflows and connect their digital ecosystem seamlessly.

**Ready to revolutionize how your users interact with their favorite apps!** 🚀