# Backend Development Instructions for GitHub Copilot

## Hono.js + tRPC Backend Guidelines

When creating or modifying backend routes and API endpoints:

### tRPC Route Structure
```typescript
import { router, publicProcedure } from '../create-context';
import { z } from 'zod';

export const exampleRouter = router({
  getAll: publicProcedure
    .input(z.object({
      // Input validation schema
    }))
    .query(async ({ input, ctx }) => {
      // Query logic
      return {
        // Type-safe return data
      };
    }),
    
  create: publicProcedure
    .input(z.object({
      // Input validation schema
    }))
    .mutation(async ({ input, ctx }) => {
      // Mutation logic
      return {
        // Type-safe return data
      };
    }),
});
```

### Key Patterns to Follow:

1. **Type Safety**: Use Zod schemas for all input/output validation
2. **Error Handling**: Use tRPC error handling with proper HTTP status codes
3. **Context Usage**: Access database, auth, and other context through `ctx`
4. **Input Validation**: Always validate input with Zod schemas
5. **Return Types**: Ensure consistent return types for frontend type safety

### Data Validation:
```typescript
const PropertySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  price: z.number().positive(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});
```

### Error Handling:
```typescript
import { TRPCError } from '@trpc/server';

throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Property not found',
});
```

### Database Integration:
- Use proper database connections through context
- Implement proper connection pooling
- Use transactions for multi-step operations
- Handle database errors gracefully

### Authentication:
- Implement proper JWT validation
- Use middleware for protected routes
- Check user permissions before data access
- Return appropriate error codes for auth failures

### API Design:
- Follow RESTful principles adapted to tRPC
- Use consistent naming conventions
- Implement proper pagination for list endpoints
- Cache frequently accessed data

### Testing:
- Write unit tests for all procedures
- Test error scenarios and edge cases
- Mock database connections in tests
- Use tRPC testing utilities