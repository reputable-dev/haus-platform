# HAUS V0 AI Integration

This document explains how to use the v0 API integration with HAUS design system in the Haus Platform.

## Overview

The HAUS v0 AI integration provides AI-powered content generation that **automatically follows HAUS design system guidelines**. This integration includes:

- **HAUS-Branded Content Generation**: Generate text, code, and content using HAUS design patterns
- **HAUS-Compliant Component Generation**: Create React, Vue, or Svelte components with HAUS colors, typography, and spacing
- **HAUS-Styled Design Generation**: Generate complete UI designs using HAUS brand guidelines
- **Design System Enforcement**: All AI outputs automatically follow HAUS standards
- **Real Estate Focus**: Specialized for property, agent, and real estate workflows

## HAUS Design System Integration

### Automatic HAUS Guidelines

Every v0 AI generation automatically includes:

- **HAUS Color Palette**: Primary (#3366FF), Secondary (#FF6B6B), Success (#06D6A0), Warning (#FFD166), Error (#EF476F)
- **HAUS Typography**: 24px titles, 16px body, 12px captions with proper font weights
- **HAUS Spacing**: 4px grid system (8px, 12px, 16px, 20px, 24px)
- **HAUS Components**: Card patterns, button styles, input designs, badge formats
- **Real Estate Patterns**: Property cards, agent profiles, metric widgets, filter panels
- **HAUS Icons**: Lucide React Native icons only (Home, Heart, MapPin, Bed, Bath, Car)
- **Theme Support**: Automatic light/dark theme compatibility

### Setup

#### Environment Variables

Add your v0 API key to your `.env` file:

```bash
# V0 AI Design API with HAUS Design System
V0_API_KEY=v1:6BtmCwlliPiwURXu3jiEWiag:jQZoLbH8Ekhpz9XeEJsJsMZF
EXPO_PUBLIC_V0_API_KEY=v1:6BtmCwlliPiwURXu3jiEWiag:jQZoLbH8Ekhpz9XeEJsJsMZF

# Optional: Custom base URL (defaults to https://api.v0.dev)
V0_API_BASE_URL=https://api.v0.dev
```

#### Installation

The HAUS design system integration is pre-configured. No additional setup required.

## Usage

### 1. Using React Hooks

```typescript
import { useV0Generate, useV0Component, useV0Design } from '@/hooks/useV0';

// Generate text content
const { generate, isLoading, error, result } = useV0Generate();

// Generate components
const { generateComponent, isLoading, error, component } = useV0Component();

// Generate designs
const { generateDesign, isLoading, error, design } = useV0Design();
```

### 2. Direct Service Usage

```typescript
import { V0Service } from '@/backend/services/v0.service';

const v0Service = new V0Service();

// Generate content
const result = await v0Service.generate({
  prompt: 'Generate a React component for a button',
  model: 'v0-default',
  temperature: 0.7
});

// Generate component
const component = await v0Service.generateComponent({
  description: 'A modern card component with hover effects',
  componentType: 'react',
  framework: 'nextjs',
  styling: 'tailwind',
  typescript: true
});

// Generate design
const design = await v0Service.generateDesign({
  prompt: 'A modern landing page for a tech startup',
  designType: 'landing',
  style: 'modern',
  colorScheme: 'light',
  responsive: true
});
```

### 3. Using tRPC API

```typescript
import { trpc } from '@/lib/trpc';

// Client-side usage
const generateMutation = trpc.v0.generate.useMutation();
const healthQuery = trpc.v0.healthCheck.useQuery();

// Generate content
const result = await generateMutation.mutateAsync({
  prompt: 'Create a login form',
  temperature: 0.7
});
```

## Available Endpoints

### Content Generation
- `POST /api/trpc/v0.generate` - Generate AI content

### Component Generation  
- `POST /api/trpc/v0.generateComponent` - Generate React/Vue/Svelte components

### Design Generation
- `POST /api/trpc/v0.generateDesign` - Generate complete UI designs

### Health & Status
- `GET /api/trpc/v0.healthCheck` - Check API health
- `GET /api/trpc/v0.validateConnection` - Validate API connection
- `GET /api/trpc/v0.getModels` - Get available models
- `GET /api/trpc/v0.getConfig` - Get service configuration

### History
- `GET /api/trpc/v0.getHistory` - Get generation history for a user

## HAUS UI Components

The integration includes HAUS-branded React Native components:

### V0Generator
HAUS-aware content generator with real estate prompts and design system integration.

```typescript
import V0Generator from '@/components/v0/V0Generator';

<V0Generator onGenerated={(result) => console.log(result)} />
```
- Includes HAUS design system indicator
- Pre-loaded with real estate prompt suggestions
- Automatically applies HAUS guidelines to all generations

### V0ComponentGenerator
HAUS-compliant component generator for React/Vue/Svelte with real estate focus.

```typescript
import V0ComponentGenerator from '@/components/v0/V0ComponentGenerator';

<V0ComponentGenerator onGenerated={(component) => console.log(component)} />
```
- Pre-configured for HAUS colors and typography
- Real estate component suggestions (property cards, agent profiles, etc.)
- Automatic HAUS design pattern application

### V0Status
API health monitoring with HAUS branding.

```typescript
import V0Status from '@/components/v0/V0Status';

<V0Status />
```

### HausDesignSystemInfo
Interactive design system reference showing HAUS guidelines.

```typescript
import HausDesignSystemInfo from '@/components/v0/HausDesignSystemInfo';

<HausDesignSystemInfo />
```
- Complete HAUS color palette with usage examples
- Typography scale demonstration
- Component pattern reference
- Design principles explanation

## Navigation

The HAUS v0 integration is accessible through the "V0 AI" tab in the bottom navigation with four sections:

1. **Generator**: HAUS-branded content generation with real estate prompts
2. **Components**: HAUS-compliant component generation with property patterns
3. **Design System**: Interactive HAUS design system reference and guidelines
4. **Status**: API health monitoring and connection status

## Configuration Options

### Content Generation
- `prompt`: The text prompt for generation
- `model`: AI model to use (default: 'v0-default')
- `temperature`: Creativity level (0.0 - 2.0)
- `maxTokens`: Maximum response length

### Component Generation
- `description`: Component description
- `componentType`: 'react', 'vue', or 'svelte'
- `framework`: 'nextjs', 'vite', or 'remix'  
- `styling`: 'tailwind', 'css-modules', or 'styled-components'
- `typescript`: Enable TypeScript

### Design Generation
- `prompt`: Design description
- `designType`: 'ui', 'landing', 'dashboard', or 'mobile'
- `style`: 'modern', 'minimal', 'corporate', or 'creative'
- `colorScheme`: 'light', 'dark', or 'auto'
- `responsive`: Enable responsive design

## Error Handling

The integration includes comprehensive error handling:

```typescript
const { generate, error, clearError } = useV0Generate();

try {
  const result = await generate({ prompt: 'Hello world' });
} catch (err) {
  console.error('Generation failed:', error);
  clearError(); // Clear the error state
}
```

## Testing

Run the v0 service tests:

```bash
npm test -- __tests__/services/v0.service.test.ts
```

The test suite covers:
- Service initialization
- API calls and responses
- Error handling
- Connection validation
- Model listing

## API Response Types

### Generate Response
```typescript
interface V0GenerateResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    total_tokens: number;
  };
}
```

### Component Response
```typescript
interface V0ComponentResponse {
  id: string;
  component: {
    name: string;
    code: string;
    dependencies: string[];
  };
  suggestions?: string[];
}
```

### Design Response  
```typescript
interface V0DesignResponse {
  id: string;
  design: {
    html: string;
    css: string;
    components: Array<{
      name: string;
      code: string;
    }>;
  };
}
```

## Security

- API keys are stored as environment variables
- All requests include authentication headers
- Rate limiting is handled automatically
- Error messages don't expose sensitive information

## Troubleshooting

### Common Issues

1. **Missing API Key**
   ```
   Error: V0_API_KEY environment variable is required
   ```
   Solution: Add the V0_API_KEY to your .env file

2. **API Connection Failed**
   ```
   Error: Failed to validate connection
   ```
   Solution: Check your API key and internet connection

3. **Rate Limited**
   ```
   Error: Rate limit exceeded
   ```
   Solution: Wait for the rate limit to reset or check your quota

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=v0:*
```

## Support

- Check the V0 Status component for real-time API health
- Review error messages for specific issues
- Verify environment variables are properly set
- Test connection using the health check endpoint