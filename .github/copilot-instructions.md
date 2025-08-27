# GitHub Copilot Instructions for Haus Platform

## Project Overview
This is a React Native/Expo property management application with the following architecture:
- **Frontend**: React Native with Expo Router, NativeWind (Tailwind CSS for React Native)
- **Backend**: Hono.js with tRPC for type-safe API routes
- **State Management**: Zustand for client state
- **Data Fetching**: TanStack React Query with tRPC
- **UI Components**: Custom components with Lucide React Native icons
- **Package Manager**: Bun (preferred over npm/yarn)

## Key Technologies & Dependencies
- React Native 0.79.1 with React 19.0.0
- Expo SDK 53+ with Router v5
- TypeScript with strict mode enabled
- Hono.js for lightweight backend server
- tRPC v11 for end-to-end type safety
- NativeWind v4 for styling (Tailwind CSS syntax)
- React Query v5 for server state management
- Zustand v5 for client state management
- Expo Image, Location, Image Picker, and other native modules

## Development Guidelines

### Code Style & Conventions
- Use TypeScript with strict type checking
- Follow React Native and Expo best practices
- Use functional components with hooks exclusively
- Prefer const assertions and type-safe patterns
- Use absolute imports with `@/` prefix for project files
- Follow mobile-first responsive design principles

### File Structure & Organization
```
/app - Expo Router pages and layouts
  /(tabs) - Tab-based navigation screens
  /property - Property-specific routes with dynamic routing
/components - Reusable UI components organized by feature
/hooks - Custom React hooks for business logic
/lib - Utility functions and configurations
/types - TypeScript type definitions
/backend - Hono server with tRPC routes
/constants - App-wide constants (colors, theme)
/providers - React context providers
/mocks - Mock data for development
```

### API & Backend Patterns
- Use tRPC procedures for type-safe API routes
- Implement proper error handling with custom error boundaries
- Follow RESTful principles adapted for tRPC procedures
- Use Zod for runtime schema validation
- Implement proper loading and error states for all async operations

### React Native Specific Guidelines
- Use Expo modules instead of bare React Native when possible
- Implement proper native module imports and platform-specific code
- Use NativeWind classes for styling (Tailwind CSS syntax)
- Handle both iOS and Android platform differences
- Implement proper navigation with Expo Router
- Use Expo Image for optimized image handling

### State Management Patterns
- Use React Query for server state (API data, caching)
- Use Zustand for client state (UI state, user preferences)
- Implement proper cache invalidation strategies
- Use optimistic updates where appropriate
- Handle offline scenarios gracefully

### Performance Considerations
- Implement proper list virtualization for large datasets
- Use Expo Image for optimized image loading and caching
- Implement proper memoization with React.memo and useMemo
- Use lazy loading for non-critical components
- Optimize bundle size with proper tree shaking

### Testing & Quality Assurance
- Write unit tests for utility functions and hooks
- Implement component testing for critical UI components
- Use TypeScript for compile-time error prevention
- Implement proper error boundaries and fallback UI
- Test on both iOS and Android platforms

### Security & Best Practices
- Never commit sensitive data or API keys
- Use environment variables for configuration
- Implement proper input validation with Zod schemas
- Follow React Native security best practices
- Use secure storage for sensitive user data

### Common Patterns to Follow
1. **Component Structure**: Export default function, use TypeScript interfaces for props
2. **API Integration**: Use tRPC procedures with React Query hooks
3. **Navigation**: Use Expo Router with type-safe navigation
4. **Styling**: Use NativeWind classes with responsive design
5. **Error Handling**: Implement error boundaries and proper error states
6. **Loading States**: Show appropriate loading indicators for async operations

### Avoid These Patterns
- Don't use class components (use functional components only)
- Avoid direct DOM manipulation (use React Native components)
- Don't use deprecated Expo/React Native APIs
- Avoid inline styles (use NativeWind classes)
- Don't ignore TypeScript errors or use `any` type
- Avoid heavy computations on the main thread

### Development Commands
```bash
bun start                    # Start development server
bun run start-web           # Start web development server
bun run start-web-dev       # Start web server with debug logging
```

When suggesting code changes or new features:
1. Ensure TypeScript compatibility with strict mode
2. Use the existing project structure and conventions
3. Follow React Native and Expo best practices
4. Implement proper error handling and loading states
5. Consider both iOS and Android compatibility
6. Use the established state management patterns (React Query + Zustand)
7. Follow the NativeWind styling approach
8. Ensure tRPC type safety is maintained