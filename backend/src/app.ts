import Fastify, { type FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { InMemoryGymRepository } from './services/gymRepository';
import { GymService } from './services/gymService';
import { gymRoutes } from './routes/gymRoutes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  await app.register(sensible);

  const repo = new InMemoryGymRepository();
  const gymService = new GymService(repo);

  await app.register(gymRoutes, { gymService });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
