# CRUSH - Codebase Context for AI Agents

## Project Overview
React Native/Expo property management app with:
- Frontend: React Native + Expo Router + NativeWind
- Backend: Hono.js + tRPC
- State: Zustand (client) + React Query (server)
- Lang: TypeScript strict mode
- Manager: Bun (not npm/yarn)

## Key Commands
```bash
bun start          # Start web dev server
bun run start:ios  # Start iOS simulator
bun run start:android # Start Android emulator
bun test           # Run all unit tests
bun run test:watch # Watch mode for development
bun run test:integrations # Run only integration tests (specific to your task)
bun run lint       # ESLint check
bun run typecheck  # TypeScript compilation check
```

## Single Test Execution
```bash
# Run one test file
bun jest path/to/test-file.test.ts

# Run tests matching a pattern
bun jest --testNamePattern="My Test Description"

# Example for integration tests
bun jest __tests__/integrations/pica.service.test.ts
```

## Code Style Guidelines
1. Use TypeScript with strict type checking (no implicit any)
2. Functional components only (no class components)
3. Absolute imports with `@/` prefix (e.g., `import { useProperties } from "@/hooks/useProperties"`)
4. NativeWind classes for styling (Tailwind CSS syntax)
5. tRPC procedures + React Query hooks for API integration
6. Expo modules preferred over bare React Native
7. Proper error boundaries and loading states for async operations
8. const assertions and type-safe patterns

## Conventions
- Mobile-first responsive design
- Zod for runtime schema validation
- React Query for server state, Zustand for client state
- Expo Image for optimized image handling
- Proper cache invalidation strategies
- Test on both iOS and Android platforms
- Never commit sensitive data or API keys

## File Structure
```
/app - Expo Router pages and layouts
/components - Reusable UI components
/hooks - Custom React hooks
/lib - Utility functions
/types - TypeScript definitions
/backend - Hono server with tRPC routes
/constants - App-wide constants
/providers - React context providers
/mocks - Mock data
```