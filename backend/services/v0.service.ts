import { generateHausSystemPrompt, getComponentInstructions, HAUS_DESIGN_SYSTEM } from '../config/haus-design-system';

interface V0GenerateRequest {
  prompt: string;
  model?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

interface V0GenerateResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface V0ComponentRequest {
  description: string;
  componentType?: 'react' | 'vue' | 'svelte';
  framework?: 'nextjs' | 'vite' | 'remix';
  styling?: 'tailwind' | 'css-modules' | 'styled-components';
  typescript?: boolean;
}

interface V0ComponentResponse {
  id: string;
  component: {
    name: string;
    code: string;
    dependencies: string[];
    preview?: string;
  };
  suggestions?: string[];
  improvements?: string[];
}

interface V0DesignRequest {
  prompt: string;
  designType?: 'ui' | 'landing' | 'dashboard' | 'mobile';
  style?: 'modern' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'light' | 'dark' | 'auto';
  responsive?: boolean;
}

interface V0DesignResponse {
  id: string;
  design: {
    html: string;
    css: string;
    js?: string;
    components: Array<{
      name: string;
      code: string;
      props?: Record<string, any>;
    }>;
    preview?: string;
    assets?: string[];
  };
  metadata: {
    designType: string;
    style: string;
    colorScheme: string;
    responsive: boolean;
    generatedAt: string;
  };
}

export class V0Service {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const apiKey = process.env.V0_API_KEY;
    if (!apiKey) {
      throw new Error('V0_API_KEY environment variable is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = process.env.V0_API_BASE_URL || 'https://api.v0.dev';
  }

  /**
   * Generate AI content using v0 API with HAUS design system
   */
  async generate(request: V0GenerateRequest): Promise<V0GenerateResponse> {
    try {
      // Enhance prompt with HAUS design system instructions
      const hausSystemPrompt = generateHausSystemPrompt();
      const enhancedPrompt = `${hausSystemPrompt}\n\nUser Request: ${request.prompt}\n\nPlease generate content following the HAUS design system guidelines above.`;

      const response = await fetch(`${this.baseUrl}/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'haus-platform/1.0.0'
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          model: request.model || 'v0-default',
          stream: request.stream || false,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 2048
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`V0 API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('V0 generate error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  /**
   * Generate React/Vue/Svelte components with HAUS design system
   */
  async generateComponent(request: V0ComponentRequest): Promise<V0ComponentResponse> {
    try {
      // Determine component category for specific instructions
      const componentCategory = this.categorizeComponent(request.description);
      const hausSystemPrompt = generateHausSystemPrompt();
      const componentInstructions = getComponentInstructions(componentCategory);
      
      const enhancedDescription = `${hausSystemPrompt}\n\n${componentInstructions}\n\nComponent Request: ${request.description}\n\nGenerate a ${request.componentType || 'React'} component that follows the HAUS design system exactly. Use the specified colors, typography, spacing, and component patterns.`;

      const response = await fetch(`${this.baseUrl}/v1/components/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'haus-platform/1.0.0'
        },
        body: JSON.stringify({
          description: enhancedDescription,
          component_type: request.componentType || 'react',
          framework: request.framework || 'nextjs',
          styling: request.styling || 'tailwind',
          typescript: request.typescript !== false,
          include_preview: true,
          include_dependencies: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`V0 Component API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id || `comp_${Date.now()}`,
        component: {
          name: data.component?.name || 'GeneratedComponent',
          code: data.component?.code || '',
          dependencies: data.component?.dependencies || [],
          preview: data.component?.preview
        },
        suggestions: data.suggestions || [],
        improvements: data.improvements || []
      };
    } catch (error) {
      console.error('V0 generateComponent error:', error);
      throw new Error(`Failed to generate component: ${error.message}`);
    }
  }

  /**
   * Generate complete UI designs with HAUS design system
   */
  async generateDesign(request: V0DesignRequest): Promise<V0DesignResponse> {
    try {
      const hausSystemPrompt = generateHausSystemPrompt();
      const designInstructions = this.getDesignInstructions(request.designType || 'ui');
      
      const enhancedPrompt = `${hausSystemPrompt}\n\n${designInstructions}\n\nDesign Request: ${request.prompt}\n\nCreate a ${request.designType || 'UI'} design that strictly follows the HAUS design system. Focus on real estate use cases and maintain brand consistency.`;

      const response = await fetch(`${this.baseUrl}/v1/designs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'haus-platform/1.0.0'
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          design_type: request.designType || 'ui',
          style: request.style || 'modern',
          color_scheme: request.colorScheme || 'light',
          responsive: request.responsive !== false,
          include_components: true,
          include_assets: true,
          format: 'complete'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`V0 Design API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id || `design_${Date.now()}`,
        design: {
          html: data.design?.html || '',
          css: data.design?.css || '',
          js: data.design?.js,
          components: data.design?.components || [],
          preview: data.design?.preview,
          assets: data.design?.assets || []
        },
        metadata: {
          designType: request.designType || 'ui',
          style: request.style || 'modern',
          colorScheme: request.colorScheme || 'light',
          responsive: request.responsive !== false,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('V0 generateDesign error:', error);
      throw new Error(`Failed to generate design: ${error.message}`);
    }
  }

  /**
   * Get generation history for a user
   */
  async getGenerationHistory(userId: string, limit: number = 20): Promise<Array<{
    id: string;
    type: 'generate' | 'component' | 'design';
    prompt: string;
    createdAt: string;
    status: 'completed' | 'failed';
  }>> {
    try {
      // This would typically be stored in your database
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('V0 getGenerationHistory error:', error);
      throw new Error(`Failed to get generation history: ${error.message}`);
    }
  }

  /**
   * Validate API connection
   */
  async validateConnection(): Promise<{
    status: 'connected' | 'error';
    version?: string;
    rateLimit?: {
      remaining: number;
      reset: number;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'haus-platform/1.0.0'
        }
      });

      if (!response.ok) {
        return { status: 'error' };
      }

      const data = await response.json();
      
      return {
        status: 'connected',
        version: data.version,
        rateLimit: {
          remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
          reset: parseInt(response.headers.get('x-ratelimit-reset') || '0')
        }
      };
    } catch (error) {
      console.error('V0 validateConnection error:', error);
      return { status: 'error' };
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'haus-platform/1.0.0'
        }
      });

      if (!response.ok) {
        // Return default models if API call fails
        return [
          {
            id: 'v0-default',
            name: 'V0 Default',
            description: 'General purpose AI model for code and design generation',
            capabilities: ['text', 'code', 'components', 'designs']
          }
        ];
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('V0 getAvailableModels error:', error);
      return [
        {
          id: 'v0-default',
          name: 'V0 Default',
          description: 'General purpose AI model for code and design generation',
          capabilities: ['text', 'code', 'components', 'designs']
        }
      ];
    }
  }

  /**
   * Stream generation (for real-time updates)
   */
  async streamGenerate(request: V0GenerateRequest): Promise<ReadableStream<V0GenerateResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream',
          'User-Agent': 'haus-platform/1.0.0'
        },
        body: JSON.stringify({
          ...request,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`V0 Stream API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return response.body as ReadableStream<V0GenerateResponse>;
    } catch (error) {
      console.error('V0 streamGenerate error:', error);
      throw new Error(`Failed to start stream generation: ${error.message}`);
    }
  }

  /**
   * Categorize component type based on description
   */
  private categorizeComponent(description: string): 'card' | 'form' | 'navigation' | 'dashboard' | 'property' {
    const desc = description.toLowerCase();
    
    if (desc.includes('property') || desc.includes('listing') || desc.includes('house') || desc.includes('apartment') || desc.includes('real estate')) {
      return 'property';
    }
    if (desc.includes('form') || desc.includes('input') || desc.includes('field') || desc.includes('login') || desc.includes('signup')) {
      return 'form';
    }
    if (desc.includes('navigation') || desc.includes('menu') || desc.includes('tab') || desc.includes('header') || desc.includes('nav')) {
      return 'navigation';
    }
    if (desc.includes('dashboard') || desc.includes('metric') || desc.includes('chart') || desc.includes('graph') || desc.includes('analytics')) {
      return 'dashboard';
    }
    
    return 'card'; // Default to card pattern
  }

  /**
   * Get design-specific instructions
   */
  private getDesignInstructions(designType: string): string {
    const instructions = {
      ui: `
## UI DESIGN INSTRUCTIONS:
- Focus on clean, modern layouts with HAUS color palette
- Use card-based layouts with 12px border radius
- Implement proper spacing with 4px grid system
- Include interactive states and hover effects
- Ensure accessibility with proper contrast ratios
      `,
      
      landing: `
## LANDING PAGE INSTRUCTIONS:
- Hero section with HAUS primary color (#3366FF)
- Property showcase sections with card layouts
- Call-to-action buttons in primary color
- Trust indicators and testimonials
- Mobile-responsive design with breakpoints at 768px
      `,
      
      dashboard: `
## DASHBOARD DESIGN INSTRUCTIONS:
- Metric cards with trend indicators
- Property analytics with real estate KPIs
- Grid layouts responsive to screen size
- Color-coded status indicators using HAUS palette
- Charts and graphs in primary color scheme
      `,
      
      mobile: `
## MOBILE DESIGN INSTRUCTIONS:
- Touch-friendly interface with 44px minimum touch targets
- Bottom navigation for primary actions
- Swipe gestures for property galleries
- Optimized for one-handed use
- Progressive disclosure for complex features
      `
    };

    return instructions[designType as keyof typeof instructions] || instructions.ui;
  }
}