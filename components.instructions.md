# Component Development Instructions for GitHub Copilot

## React Native Component Guidelines

When creating or modifying React Native components in this project:

### Component Structure
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import type { ComponentProps } from '@/types';

interface Props extends ComponentProps {
  // Specific prop definitions
}

export default function ComponentName({ ...props }: Props) {
  // Component logic
  return (
    <View className="flex-1">
      {/* NativeWind styling */}
    </View>
  );
}
```

### Key Patterns to Follow:

1. **TypeScript First**: Always use TypeScript interfaces for props
2. **NativeWind Styling**: Use Tailwind CSS classes via `className` prop
3. **Expo Components**: Prefer Expo components (expo-image, expo-linear-gradient) over React Native equivalents
4. **Error Boundaries**: Wrap components that fetch data or perform async operations
5. **Loading States**: Always implement loading states for async operations
6. **Responsive Design**: Use responsive NativeWind classes (sm:, md:, lg:)

### State Management Integration:
- Use `useProperties` hook for property-related data
- Use `useFavorites` hook for favorites functionality
- Integrate with tRPC hooks for API calls
- Use Zustand stores for UI state

### Accessibility:
- Add `accessibilityLabel` and `accessibilityHint` props
- Use semantic HTML elements when targeting web
- Implement proper focus management
- Support dark mode through NativeWind

### Performance:
- Use React.memo for expensive components
- Implement proper key props for lists
- Use Expo Image for optimized image loading
- Avoid inline functions in render methods

### Testing:
- Export component props interface for testing
- Use React Native Testing Library patterns
- Test user interactions, not implementation details
- Mock API calls with tRPC testing utilities