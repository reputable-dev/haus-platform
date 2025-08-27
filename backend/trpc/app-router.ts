import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { integrationsRouter } from "./routes/integrations/route";
import { v0Router } from "./routes/v0/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  integrations: integrationsRouter,
  v0: v0Router,
});

export type AppRouter = typeof appRouter;