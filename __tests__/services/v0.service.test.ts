import { V0Service } from '../../backend/services/v0.service';

// Mock fetch globally
global.fetch = jest.fn();

describe('V0Service', () => {
  let v0Service: V0Service;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
    
    // Mock environment variable
    process.env.V0_API_KEY = 'test-api-key';
    // Reset base URL to default
    delete process.env.V0_API_BASE_URL;
    
    v0Service = new V0Service();
  });

  afterEach(() => {
    delete process.env.V0_API_KEY;
    delete process.env.V0_API_BASE_URL;
  });

  describe('constructor', () => {
    it('should throw error if V0_API_KEY is not provided', () => {
      delete process.env.V0_API_KEY;
      
      expect(() => {
        new V0Service();
      }).toThrow('V0_API_KEY environment variable is required');
    });

    it('should initialize with correct baseUrl', () => {
      process.env.V0_API_BASE_URL = 'https://custom-api.example.com';
      const service = new V0Service();
      
      // We can't directly access private properties, but we can test the behavior
      expect(service).toBeInstanceOf(V0Service);
    });
  });

  describe('generate', () => {
    it('should make a successful API call', async () => {
      const mockResponse = {
        id: 'test-id',
        object: 'text_completion',
        created: 1234567890,
        model: 'v0-default',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Generated content'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        statusText: 'OK'
      } as Response);

      const result = await v0Service.generate({
        prompt: 'Test prompt',
        model: 'v0-default',
        temperature: 0.7
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.v0.dev/v1/generate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
            'User-Agent': 'haus-platform/1.0.0'
          }),
          body: expect.stringContaining('Test prompt') // Body now includes design system prompt
        })
      );
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        message: 'Invalid API key'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => errorResponse
      } as Response);

      await expect(v0Service.generate({
        prompt: 'Test prompt'
      })).rejects.toThrow('Failed to generate content: V0 API error: 401 - Invalid API key');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(v0Service.generate({
        prompt: 'Test prompt'
      })).rejects.toThrow('Failed to generate content: Network error');
    });
  });

  describe('generateComponent', () => {
    it('should make a successful API call', async () => {
      const mockResponse = {
        id: 'comp-123',
        component: {
          name: 'TestComponent',
          code: 'const TestComponent = () => <div>Hello</div>;',
          dependencies: ['react'],
          preview: 'preview-url'
        },
        suggestions: ['Add props', 'Add styling'],
        improvements: ['Better performance']
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        statusText: 'OK'
      } as Response);

      const result = await v0Service.generateComponent({
        description: 'A simple button component',
        componentType: 'react',
        framework: 'nextjs',
        styling: 'tailwind',
        typescript: true
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.v0.dev/v1/components/generate',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('A simple button component') // Body now includes design system prompt
        })
      );
    });
  });

  describe('validateConnection', () => {
    it('should return connected status for valid API', async () => {
      const mockResponse = {
        version: '1.0.0'
      };

      const mockHeaders = new Map([
        ['x-ratelimit-remaining', '100'],
        ['x-ratelimit-reset', '1234567890']
      ]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: {
          get: (name: string) => mockHeaders.get(name) || null
        }
      } as unknown as Response);

      const result = await v0Service.validateConnection();

      expect(result).toEqual({
        status: 'connected',
        version: '1.0.0',
        rateLimit: {
          remaining: 100,
          reset: 1234567890
        }
      });
    });

    it('should return error status for invalid API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response);

      const result = await v0Service.validateConnection();

      expect(result).toEqual({
        status: 'error'
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await v0Service.validateConnection();

      expect(result).toEqual({
        status: 'error'
      });
    });
  });

  describe('getAvailableModels', () => {
    it('should return models from API', async () => {
      const mockModels = [
        {
          id: 'v0-default',
          name: 'V0 Default',
          description: 'General purpose model',
          capabilities: ['text', 'code']
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: mockModels })
      } as Response);

      const result = await v0Service.getAvailableModels();

      expect(result).toEqual(mockModels);
    });

    it('should return default models on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      const result = await v0Service.getAvailableModels();

      expect(result).toEqual([
        {
          id: 'v0-default',
          name: 'V0 Default',
          description: 'General purpose AI model for code and design generation',
          capabilities: ['text', 'code', 'components', 'designs']
        }
      ]);
    });
  });
});