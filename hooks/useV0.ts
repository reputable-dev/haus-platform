import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface V0GenerateOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface V0ComponentOptions {
  description: string;
  componentType?: 'react' | 'vue' | 'svelte';
  framework?: 'nextjs' | 'vite' | 'remix';
  styling?: 'tailwind' | 'css-modules' | 'styled-components';
  typescript?: boolean;
}

export interface V0DesignOptions {
  prompt: string;
  designType?: 'ui' | 'landing' | 'dashboard' | 'mobile';
  style?: 'modern' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'light' | 'dark' | 'auto';
  responsive?: boolean;
}

export interface V0State {
  isLoading: boolean;
  error: string | null;
  lastGeneration: any | null;
}

export function useV0() {
  const [state, setState] = useState<V0State>({
    isLoading: false,
    error: null,
    lastGeneration: null,
  });

  // tRPC mutations
  const generateMutation = trpc.v0.generate.useMutation({
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        lastGeneration: data,
      }));
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
        lastGeneration: null,
      }));
    },
  });

  const generateComponentMutation = trpc.v0.generateComponent.useMutation({
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        lastGeneration: data,
      }));
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
        lastGeneration: null,
      }));
    },
  });

  const generateDesignMutation = trpc.v0.generateDesign.useMutation({
    onSuccess: (data) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        lastGeneration: data,
      }));
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
        lastGeneration: null,
      }));
    },
  });

  // tRPC queries
  const healthQuery = trpc.v0.healthCheck.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const modelsQuery = trpc.v0.getModels.useQuery(undefined, {
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const configQuery = trpc.v0.getConfig.useQuery(undefined, {
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Helper functions
  const generate = async (options: V0GenerateOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await generateMutation.mutateAsync({
        prompt: options.prompt,
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });
      return result;
    } catch (error) {
      // Error is handled by the mutation's onError
      throw error;
    }
  };

  const generateComponent = async (options: V0ComponentOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await generateComponentMutation.mutateAsync({
        description: options.description,
        componentType: options.componentType,
        framework: options.framework,
        styling: options.styling,
        typescript: options.typescript,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const generateDesign = async (options: V0DesignOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await generateDesignMutation.mutateAsync({
        prompt: options.prompt,
        designType: options.designType,
        style: options.style,
        colorScheme: options.colorScheme,
        responsive: options.responsive,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const getHistory = (userId: string, limit?: number) => {
    return trpc.v0.getHistory.useQuery(
      { userId, limit },
      {
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
      }
    );
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const clearLastGeneration = () => {
    setState(prev => ({ ...prev, lastGeneration: null }));
  };

  return {
    // State
    isLoading: state.isLoading || generateMutation.isPending || generateComponentMutation.isPending || generateDesignMutation.isPending,
    error: state.error,
    lastGeneration: state.lastGeneration,

    // Generation functions
    generate,
    generateComponent,
    generateDesign,
    getHistory,

    // Service status
    health: healthQuery.data,
    isHealthy: healthQuery.data?.status === 'healthy',
    models: modelsQuery.data || [],
    config: configQuery.data,

    // Loading states
    isGenerating: generateMutation.isPending,
    isGeneratingComponent: generateComponentMutation.isPending,
    isGeneratingDesign: generateDesignMutation.isPending,
    isLoadingHealth: healthQuery.isLoading,
    isLoadingModels: modelsQuery.isLoading,
    isLoadingConfig: configQuery.isLoading,

    // Utility functions
    clearError,
    clearLastGeneration,

    // Refetch functions
    refetchHealth: healthQuery.refetch,
    refetchModels: modelsQuery.refetch,
    refetchConfig: configQuery.refetch,
  };
}

// Specialized hooks for specific use cases
export function useV0Generate() {
  const v0 = useV0();
  
  return {
    generate: v0.generate,
    isLoading: v0.isGenerating,
    error: v0.error,
    result: v0.lastGeneration,
    clearError: v0.clearError,
    clearResult: v0.clearLastGeneration,
  };
}

export function useV0Component() {
  const v0 = useV0();
  
  return {
    generateComponent: v0.generateComponent,
    isLoading: v0.isGeneratingComponent,
    error: v0.error,
    component: v0.lastGeneration,
    clearError: v0.clearError,
    clearComponent: v0.clearLastGeneration,
  };
}

export function useV0Design() {
  const v0 = useV0();
  
  return {
    generateDesign: v0.generateDesign,
    isLoading: v0.isGeneratingDesign,
    error: v0.error,
    design: v0.lastGeneration,
    clearError: v0.clearError,
    clearDesign: v0.clearLastGeneration,
  };
}

export function useV0Health() {
  const v0 = useV0();
  
  return {
    health: v0.health,
    isHealthy: v0.isHealthy,
    isLoading: v0.isLoadingHealth,
    refetch: v0.refetchHealth,
  };
}